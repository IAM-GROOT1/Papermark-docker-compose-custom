#!/bin/sh
set -e

PRISMA="node /app/node_modules/prisma/build/index.js"

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

echo "[entrypoint] starting Papermark on port ${PORT:-3000}"
exec "$@"
