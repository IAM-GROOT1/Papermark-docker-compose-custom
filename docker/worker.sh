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

while true; do
  curl -fsS -X POST "$TARGET" \
    -H "Authorization: Bearer ${INTERNAL_API_KEY}" \
    -H "Content-Type: application/json" \
    --max-time "${WORKER_MAX_TIME_SECONDS:-3600}" \
    -o /dev/null \
    || echo "[worker] poll failed (app not ready yet?)"
  sleep "$INTERVAL"
done
