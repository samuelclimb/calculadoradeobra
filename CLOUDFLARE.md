# Cloudflare migration

This project is prepared for Cloudflare Pages with Pages Functions.

## Architecture

- Static frontend: `artifacts/calculadora/dist/public`
- Edge API: `functions/api/*`
- Database: Neon Postgres via `DATABASE_URL`

The frontend keeps using relative `/api/*` URLs. On Cloudflare, those routes are handled by Pages Functions.

## Cloudflare Pages settings

- Framework preset: None
- Build command: `pnpm install --frozen-lockfile && pnpm run build:cloudflare`
- Build output directory: `artifacts/calculadora/dist/public`
- Root directory: repository root

## Environment variables

Set these in Cloudflare Pages:

- `DATABASE_URL`
- `ADMIN_PASSWORD_HASH`

`ADMIN_PASSWORD_HASH` must use this format:

```text
sha256:<salt>:<hex_sha256_of_salt_colon_password>
```

Example generator:

```bash
node -e "const crypto=require('node:crypto'); const password=process.argv[1]; const salt=crypto.randomBytes(16).toString('hex'); const hash=crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex'); console.log(`sha256:${salt}:${hash}`)" 'your-password'
```

## Notes

The existing Render deployment can remain online while Cloudflare is tested. After Cloudflare is validated, DNS can point to Cloudflare or the Render service can be suspended.
