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
# Browsers still need CORS for direct-to-storage uploads and page fetches.
echo "[minio-init] applying CORS..."
cat >/tmp/cors.json <<'JSON'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": [
        "ETag",
        "Location",
        "Upload-Offset",
        "Upload-Length",
        "Content-Length",
        "Content-Type"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}
JSON
mc cors set "papermark/${BUCKET}" /tmp/cors.json || \
  echo "[minio-init] CORS not applied (older mc?) — uploads through the proxy are same-origin anyway"

echo "[minio-init] done"
