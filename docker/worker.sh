#!/bin/sh
#
# [self-host] Poor man's Trigger.dev.
#
# The hosted product hands PDF page rendering to Trigger.dev. Self-hosted there
# is nothing to hand it to, so this loop pokes /api/self-host/process-pending on
# a fixed interval and the app does the work in-process. All state lives in
# Postgres, so this container is disposable — killing it only pauses conversion.
#
set -e

INTERVAL="${WORKER_INTERVAL_SECONDS:-10}"
TARGET="${WORKER_TARGET_URL:-http://app:3000}/api/self-host/process-pending"

echo "[worker] polling ${TARGET} every ${INTERVAL}s"

# The app runs database migrations before it starts listening, so the first
# several polls of a cold stack are expected to fail. Staying quiet until it has
# really been too long keeps a normal startup from looking like a fault.
failures=0
QUIET_FAILURES=6

while true; do
  if curl -fsS -X POST "$TARGET" \
      -H "Authorization: Bearer ${INTERNAL_API_KEY}" \
      -H "Content-Type: application/json" \
      --max-time "${WORKER_MAX_TIME_SECONDS:-3600}" \
      -o /dev/null 2>/dev/null; then
    if [ "$failures" -gt "$QUIET_FAILURES" ]; then
      echo "[worker] app reachable again"
    fi
    failures=0
  else
    failures=$((failures + 1))
    if [ "$failures" = "$QUIET_FAILURES" ]; then
      echo "[worker] app still unreachable after $((failures * INTERVAL))s — is it healthy? (docker compose logs app)"
    fi
  fi
  sleep "$INTERVAL"
done
