#!/bin/sh
#
# [self-host] One-shot bucket setup. Safe to re-run.
#
set -e

BUCKET="${STORAGE_BUCKET:-papermark-storage}"

echo "[minio-init] connecting to MinIO..."
mc alias set papermark http://minio:9000 "$STORAGE_ACCESS_KEY" "$STORAGE_SECRET_KEY"

echo "[minio-init] ensuring bucket '${BUCKET}' exists..."
mc mb --ignore-existing "papermark/${BUCKET}"

# The bucket stays private: every read and write goes through a presigned URL
# minted by the app, which is what keeps document links access-controlled.
#
# No CORS rules are needed. Storage is served through the same nginx origin as
# the app (http://host:9009/<bucket>/...), so browser uploads and page fetches
# are same-origin. Verified end to end: presigned PUT, page rendering, and the
# viewer all work without any CORS configuration.

echo "[minio-init] done"
