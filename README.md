# Student Finance Tracker (MVP)

Monorepo for a backend-first student finance tracker with simplified double-entry accounting and optional learning mode.

## Quick start

1. Install dependencies:
   - `npm install`
2. Create env files:
   - `Copy-Item apps/api/.env.example apps/api/.env`
   - `Copy-Item apps/web/.env.example apps/web/.env`
3. Start Postgres:
   - `npm run db:up`
4. Apply migrations:
   - `npm run db:migrate`
5. Seed demo data:
   - `npm run db:seed`
6. Start API + web:
   - `npm run dev`

Default local URLs:

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

## Deployment (Docker, production-like)

This stack runs `postgres + migrate + api + web` with production startup commands:

- API: `node apps/api/dist/index.js`
- Web: `nginx` serving `apps/web/dist`

Setup:

1. Create a Docker env file:
   - `Copy-Item .env.docker.example .env.docker`
2. Update secrets in `.env.docker`:
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `POSTGRES_PASSWORD`
3. Build and start the deployment stack:
   - `docker compose --env-file .env.docker up --build -d`

The one-off `migrate` service runs `prisma migrate deploy` before the API starts.

Default deployment URLs:

- Web: `http://localhost:8080`
- API: `http://localhost:4000`

Useful commands:

- Show status:
  - `docker compose --env-file .env.docker ps`
- Follow logs:
  - `docker compose --env-file .env.docker logs -f postgres migrate api web`
- Stop services:
  - `docker compose --env-file .env.docker down`
- Rebuild images:
  - `docker compose --env-file .env.docker build --no-cache`
- Stop and remove DB volume:
  - `docker compose --env-file .env.docker down -v`

## Environment variables

### `apps/api/.env`

| Variable                 | Required            | Purpose                                            | Example                                                                  |
| ------------------------ | ------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `API_PORT`               | No (default `4000`) | API listen port                                    | `4000`                                                                   |
| `DATABASE_URL`           | Yes                 | Postgres connection string for Prisma              | `postgresql://sft_user:sft_password@localhost:5432/sft_db?schema=public` |
| `CORS_ORIGIN`            | Yes                 | Allowed frontend origins (comma-separated, no `*`) | `http://localhost:5173`                                                  |
| `JWT_ACCESS_SECRET`      | Yes                 | Access token signing secret                        | `replace_with_long_random_access_secret`                                 |
| `JWT_REFRESH_SECRET`     | Yes                 | Refresh token signing secret                       | `replace_with_long_random_refresh_secret`                                |
| `JWT_ACCESS_EXPIRES_IN`  | No (default `15m`)  | Access token lifetime (`ms` format)                | `15m`                                                                    |
| `JWT_REFRESH_EXPIRES_IN` | No (default `7d`)   | Refresh token lifetime (`ms` format)               | `7d`                                                                     |

### `apps/web/.env`

| Variable            | Required | Purpose                              | Example                 |
| ------------------- | -------- | ------------------------------------ | ----------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL used by frontend API client | `http://localhost:4000` |

## Seeded demo account

`npm run db:seed` creates/updates this demo login and resets only that user's finance data to a known dataset:

- Email: `demo@studentfinance.dev`
- Password: `DemoPass123!`
- Accounts: `3`
- Categories: `8`
- Transactions: `12`
- Journal entries: `24` (2 per transaction, balanced)

The seed is idempotent and safe to re-run for demos.

## Manual API testing

Use payloads in [MANUAL_API_TESTING.md](./MANUAL_API_TESTING.md).

Suggested flow:

1. Run quick start steps through `npm run dev`.
2. Authenticate with seeded demo credentials (`POST /auth/login`) to get an access token.
3. Reuse that token for protected route payloads in `MANUAL_API_TESTING.md`.
4. Execute happy path, validation failure, and unauthorized checks for each module.

Do not commit API client collection/environment exports into this repository.

## CI/CD

This repository uses GitHub Actions + Render:

- CI (GitHub Actions):
  - Workflow: `.github/workflows/ci.yml`
  - Triggers: push to `main`, pull requests to `main`
  - Checks: `npm ci --include=dev`, `npm run lint`, `npm run build`
- CD (Render):
  - Render services auto-deploy from the latest `main` commit (based on your Blueprint/service settings).
  - For environment changes (for example `VITE_API_BASE_URL`, `CORS_ORIGIN`), update Render env vars and redeploy.

Recommended branch protection:

- Require pull request before merging to `main`
- Require status check `CI / Lint And Build` to pass

## Demo media (optional)

If screenshots/GIFs are not ready yet, keep this checklist for later:

- `docs/assets/dashboard-overview.png`
- `docs/assets/transactions-journal.png`
- `docs/assets/statements-page.png`
- `docs/assets/manual-flow.gif`

After assets are added, embed them in this README under a `## Demo` section.
