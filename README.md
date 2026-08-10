<div align="center">
  <h1>Papermark — Docker Compose (custom)</h1>
  <p><b>A self-hostable fork of <a href="https://github.com/mfts/papermark">Papermark</a>, packaged as a single <code>docker compose up</code>.</b></p>
</div>

---

## ⚠️ Read this first

**This whole repository was built with [Claude Code](https://claude.com/claude-code).**

I made it for **my own personal use**, to run Papermark on **my home lab**. I am
a vibe coder, not a developer. I did not write most of this, I cannot promise it
is correct, and I am not in a position to support it.

You are welcome to use it — **entirely at your own risk.** No warranty, no
guarantees, no support. Do not put this on the public internet, do not put
anything you care about into it, and read the code before you trust it. If it
eats your documents, that is between you and your backups.

All credit for Papermark itself goes to the
[Papermark team](https://github.com/mfts/papermark). This fork only adds the
Docker packaging and the handful of patches needed to make it run without
Vercel, Trigger.dev, Upstash, AWS and Resend.

---

## What you get

Everything runs in containers on your own machine. No SaaS accounts required.

| Piece | What it is | Replaces |
|---|---|---|
| `app` | Papermark (Next.js, standalone build) | Vercel |
| `postgres` | Postgres 16 | Vercel Postgres |
| `redis` + `srh` | Redis with an Upstash-compatible HTTP API | Upstash Redis |
| `minio` | S3-compatible object storage | AWS S3 / Vercel Blob |
| `worker` | Renders uploaded PDFs into page images | Trigger.dev |
| `proxy` | nginx; serves the app *and* storage on one port | CloudFront |

### Ports

Everything sits at **9009 and up**, as one block:

| Port | What |
|---|---|
| **9009** | **Papermark — this is the one you open in a browser** |
| 9010 | MinIO console (storage admin UI) |
| 9011 | Postgres — commented out in `docker-compose.yml`, uncomment if you want it |
| 9012 | Redis — same |

Storage is served *through* 9009, so there is only one port to forward.

---

## Quick start

```bash
git clone https://github.com/IAM-GROOT1/Papermark-docker-compose-custom.git
cd Papermark-docker-compose-custom

cp .env.example .env
./scripts/generate-secrets.sh        # Windows: ./scripts/generate-secrets.ps1

# now edit .env and set PAPERMARK_HOST + PAPERMARK_URL — see below

docker compose up -d --build
```

The first build is slow (it compiles the whole Next.js app — expect 10–20
minutes and a few GB). After that, `docker compose up -d` is quick.

Then open **http://your-host:9009**, enter your email, and grab the login code:

```bash
docker compose logs app | grep "Login code"
```

That is the escape hatch for a fresh instance with no mail server. Set up SMTP
in `.env` and codes get emailed properly instead.

### The one setting that matters: `PAPERMARK_HOST`

```env
PAPERMARK_HOST=papermark.local
PAPERMARK_URL=http://papermark.local:9009
```

This host must be reachable **from your browser and from inside the containers**.
That rules out `localhost` — inside a container, `localhost` is the container.

Why it matters: file downloads use presigned S3 URLs, which are cryptographically
bound to one hostname. The browser fetches them, and the app fetches them too
(to render PDF pages). Both have to agree on the name.

Pick whichever is easier:

- **Your machine's LAN IP** — `PAPERMARK_HOST=192.168.1.50`. Works immediately,
  nothing else to configure.
- **A hostname** — `PAPERMARK_HOST=papermark.local`. The compose file already
  teaches the containers to resolve it; you just need it in your own
  `hosts` file or your router's DNS.

> Changing `PAPERMARK_URL` later needs a rebuild — `NEXT_PUBLIC_*` values are
> baked into the browser bundle at build time.
> `docker compose up -d --build`

---

## What works, and what doesn't

Papermark is built for a specific managed stack. Some of it has a self-hosted
equivalent; some of it doesn't.

### Works

- Uploading documents, PDF page rendering, the viewer
- Share links, passwords, email verification, expiry, allow/deny lists
- Data rooms, folders, versioning
- Teams, invites, branding, custom link settings
- Sign-in by email code, or Google OAuth if you configure it

### Doesn't work without an external account

- **Per-page view analytics** — needs Tinybird. The dashboard's analytics views
  will be empty or error. Everything else works around it.
- **Office → PDF conversion** (`.docx`, `.pptx`, Keynote) — needs Trigger.dev
  with a LibreOffice image. Upload PDFs.
- **Video transcoding** — needs Trigger.dev + ffmpeg.
- **Custom domains** — needs Vercel's domain API.
- **Billing / plans** — needs Stripe. Everything is unrestricted here anyway.
- **AI document chat, passkeys, SAML SSO** — each needs its own provider key.

If you want any of these, the environment variables are all still there —
add them to `docker-compose.yml` and point them at the real service.

---

## Configuration

Everything lives in `.env`. See `.env.example` for the annotated list.

### Email

Sign-in codes and notifications go out over SMTP if you configure it:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=papermark@example.com
SMTP_PASSWORD=...
SMTP_FROM=Papermark <papermark@example.com>
```

Or set `RESEND_API_KEY` to use Resend instead (it takes precedence).

With neither, `LOG_LOGIN_CODES=true` prints login codes to the app logs.

### Google sign-in

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Authorized redirect URI: `http://your-host:9009/api/auth/callback/google`

---

## Operating it

```bash
docker compose logs -f app          # app logs
docker compose logs -f worker       # PDF conversion
docker compose ps                   # what's up
docker compose down                 # stop
docker compose down -v              # stop AND delete all data. careful.
docker compose up -d --build        # rebuild after changing PAPERMARK_URL
```

### Backups

Three named volumes hold everything: `papermark_postgres-data`,
`papermark_minio-data`, `papermark_redis-data`. The first two are the ones you
cannot lose — database and files respectively.

```bash
docker compose exec postgres pg_dump -U papermark papermark > backup.sql
```

---

## Troubleshooting

**Uploads fail, or documents never render.**
Almost always `PAPERMARK_HOST`. Check that the app container can reach it:

```bash
docker compose exec app curl -sI http://$PAPERMARK_HOST:9009/api/health
```

**PDFs upload but stay stuck on "processing".**
Check the worker: `docker compose logs -f worker`. It polls the app every 10s
and does the conversion in-process; if the app can't fetch its own storage URLs
(see above), conversion fails there.

**Login code never arrives.**
`docker compose logs app | grep "Login code"`.

**The build runs out of memory.**
Next.js needs a few GB. Give Docker more, or build with
`NODE_OPTIONS=--max-old-space-size=4096`.

**Everything redirects oddly / the app thinks it's on a custom domain.**
`PAPERMARK_HOST` must match the host you're actually browsing to, exactly.

---

## What was changed from upstream

Kept deliberately small, so pulling upstream changes stays possible. Every patch
is marked with a `[self-host]` comment.

- `middleware.ts` — treat `NEXT_PUBLIC_APP_BASE_HOST` as the app's own host.
  Upstream classifies any non-papermark.com host as a customer custom domain,
  which breaks a self-hosted deployment outright.
- `next.config.mjs` — opt-in `output: "standalone"` for a slim image, plus
  allow images served from the deployment's own origin.
- `ee/features/storage/config.ts`, `lib/files/aws-client.ts`,
  `lib/files/bulk-download-presign.ts`, `ee/features/storage/s3-store.ts` —
  honor a custom S3 endpoint and path-style addressing, which MinIO requires.
- `lib/smtp.ts` + `lib/resend.ts` — SMTP fallback so the instance can send its
  own login codes without a Resend account.
- `lib/emails/send-verification-request.ts` — optionally log login codes.
- `pages/api/self-host/process-pending.ts` — new. Does what the Trigger.dev
  PDF-rendering task does, in-process, driven by the `worker` container.
- `Dockerfile`, `docker-compose.yml`, `docker/`, `scripts/generate-secrets.*` —
  new, the packaging itself.

Upstream's own README is preserved as
[README.upstream.md](README.upstream.md), and its env reference as
`.env.example.upstream`.

---

## License

Papermark is licensed by Papermark, Inc. — AGPLv3, with the `ee/` and
`app/(ee)/` directories under a commercial license. See [LICENSE](LICENSE).
Those terms apply to this fork unchanged. The `ee/` directories are included
here as they are upstream; if you use those features, the commercial license is
between you and Papermark, Inc.

Nothing here is affiliated with or endorsed by Papermark, Inc.
