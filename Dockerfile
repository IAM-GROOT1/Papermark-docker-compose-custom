# syntax=docker/dockerfile:1

##
## Papermark — self-hosted image
##
## Debian slim rather than Alpine: several dependencies (prisma engines,
## @boxyhq/saml-jackson, mupdf, sharp) ship glibc prebuilds and either fail to
## install or fall back to slow paths on musl.
##

########################
# 1. Dependencies
########################
FROM node:24-bookworm-slim AS deps
WORKDIR /app

# openssl is required by the Prisma query engine, python3/make/g++ by the few
# dependencies without a prebuild for this platform.
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma

# `postinstall` runs `prisma generate`, so the schema has to be in place above.
RUN npm ci --no-audit --no-fund

########################
# 2. Build
########################
FROM node:24-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be known here — changing them later requires a rebuild. docker-compose
# passes these through from .env.
ARG NEXT_PUBLIC_BASE_URL=http://localhost:9009
ARG NEXT_PUBLIC_MARKETING_URL=http://localhost:9009
ARG NEXT_PUBLIC_APP_BASE_HOST=localhost
ARG NEXT_PUBLIC_WEBHOOK_BASE_URL=http://localhost:9009
ARG NEXT_PUBLIC_WEBHOOK_BASE_HOST=localhost

ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_MARKETING_URL=${NEXT_PUBLIC_MARKETING_URL} \
    NEXT_PUBLIC_APP_BASE_HOST=${NEXT_PUBLIC_APP_BASE_HOST} \
    NEXT_PUBLIC_WEBHOOK_BASE_URL=${NEXT_PUBLIC_WEBHOOK_BASE_URL} \
    NEXT_PUBLIC_WEBHOOK_BASE_HOST=${NEXT_PUBLIC_WEBHOOK_BASE_HOST} \
    NEXT_PUBLIC_UPLOAD_TRANSPORT=s3 \
    NEXT_OUTPUT_STANDALONE=true \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Placeholder so anything that constructs a Prisma client at import time during
# the build does not throw. The real URL is supplied at runtime.
ENV POSTGRES_PRISMA_URL=postgresql://build:build@localhost:5432/build \
    POSTGRES_PRISMA_URL_NON_POOLING=postgresql://build:build@localhost:5432/build

RUN npx prisma generate && npm run build

########################
# 3. Runtime
########################
FROM node:24-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone bundle carries its own minimal node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI + engines, so the entrypoint can run `prisma migrate deploy`
# against the database on every boot.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# next/image wants sharp for on-the-fly optimization. Installed into its own
# directory rather than /app: `npm install` inside the standalone bundle would
# reconcile against the app's package.json and drag the whole tree back in.
RUN mkdir -p /opt/sharp \
  && cd /opt/sharp \
  && npm install --no-audit --no-fund --no-save --no-package-lock sharp \
  && chown -R nextjs:nodejs /opt/sharp /app/node_modules
ENV NEXT_SHARP_PATH=/opt/sharp/node_modules/sharp

COPY --chown=nextjs:nodejs docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
