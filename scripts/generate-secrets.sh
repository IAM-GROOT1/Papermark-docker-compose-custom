#!/usr/bin/env bash
#
# [self-host] Fills every `change-me-*` placeholder in .env with a random value.
# Creates .env from .env.example first if it does not exist. Safe to re-run:
# values that are no longer placeholders are left alone.
#
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "created .env from .env.example"
fi

rand() { openssl rand -base64 32 | tr -d '/+=' | cut -c1-40; }

for key in NEXTAUTH_SECRET DOCUMENT_PASSWORD_KEY VERIFICATION_SECRET \
           INTERNAL_API_KEY REVALIDATE_TOKEN POSTGRES_PASSWORD \
           REDIS_TOKEN STORAGE_SECRET_KEY; do
  if grep -qE "^${key}=change-me" .env; then
    value="$(rand)"
    # BSD sed (macOS) needs an explicit backup suffix.
    sed -i.bak "s|^${key}=.*|${key}=${value}|" .env && rm -f .env.bak
    echo "  set ${key}"
  else
    echo "  kept ${key} (already customised)"
  fi
done

echo
echo "Done. Now open .env and set PAPERMARK_HOST / PAPERMARK_URL, then run:"
echo "  docker compose up -d --build"
