#!/bin/sh
set -e

PRISMA="node /app/node_modules/prisma/build/index.js"

# [self-host] Fail loudly on the configuration mistakes that otherwise surface
# as a bare 502 from the proxy, with nothing useful in any log.
fail() { echo; echo "[entrypoint] CONFIG ERROR: $1"; echo; exit 1; }

case "${NEXT_PUBLIC_BASE_URL:-}" in
  http://*|https://*) ;;
  "") fail "PAPERMARK_URL is empty. Set it in .env, e.g. http://192.168.1.80:9009" ;;
  *) fail "PAPERMARK_URL must start with http:// or https:// — got '${NEXT_PUBLIC_BASE_URL}'.
             Example: PAPERMARK_URL=http://${NEXT_PUBLIC_APP_BASE_HOST:-192.168.1.80}:9009" ;;
esac

# The host in the URL has to match PAPERMARK_HOST, or the app answers on a name
# it does not recognise and redirects to papermark.com.
url_host=$(printf '%s' "$NEXT_PUBLIC_BASE_URL" | sed -e 's|^https\?://||' -e 's|[:/].*$||')
if [ -n "${NEXT_PUBLIC_APP_BASE_HOST:-}" ] && [ "$url_host" != "$NEXT_PUBLIC_APP_BASE_HOST" ]; then
  fail "PAPERMARK_HOST ('${NEXT_PUBLIC_APP_BASE_HOST}') does not match the host in
             PAPERMARK_URL ('${url_host}'). They must be the same name."
fi

# compose already gates startup on the postgres healthcheck, but this keeps the
# container sane when it is pointed at an external database that boots slowly.
if [ -n "$POSTGRES_PRISMA_URL" ]; then
  echo "[entrypoint] waiting for the database to accept connections..."
  node -e '
    const net = require("net");
    const url = new URL(process.env.POSTGRES_PRISMA_URL);
    const host = url.hostname;
    const port = Number(url.port || 5432);
    const deadline = Date.now() + 120000;

    const attempt = () => {
      const socket = net.connect({ host, port });
      socket.setTimeout(2000);
      socket.on("connect", () => { socket.destroy(); process.exit(0); });
      const retry = () => {
        socket.destroy();
        if (Date.now() > deadline) {
          console.error("[entrypoint] database never came up at " + host + ":" + port);
          process.exit(1);
        }
        setTimeout(attempt, 2000);
      };
      socket.on("error", retry);
      socket.on("timeout", retry);
    };

    attempt();
  '
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] applying database migrations..."
  $PRISMA migrate deploy --schema ./prisma/schema
fi

# [self-host] Print what this instance answers to. A hostname that is not in
# this list is treated as a customer's custom domain and 404s or bounces to
# papermark.com, which is otherwise very hard to diagnose from the outside.
echo "[entrypoint] public URL:      ${NEXT_PUBLIC_BASE_URL:-<unset>}"
echo "[entrypoint] hostnames served: ${SELF_HOSTED_APP_HOSTS:-<unset>}"
if [ -z "${SELF_HOSTED_APP_HOSTS:-}" ]; then
  echo "[entrypoint] WARNING: SELF_HOSTED_APP_HOSTS is unset — this image predates"
  echo "[entrypoint]          the runtime hostname lookup. Rebuild with:"
  echo "[entrypoint]          docker compose build --no-cache app && docker compose up -d"
fi

echo "[entrypoint] starting Papermark on port ${PORT:-3000}"
exec "$@"
