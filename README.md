# FlowLedger (MVP)

FlowLedger is a TypeScript monorepo for personal finance tracking with simplified double-entry accounting, modular backend-first development, and a React dashboard experience.

## Tech Stack

- Monorepo: npm workspaces + Turborepo
- Backend: Node.js, Express, Prisma, Zod, PostgreSQL
- Frontend: React, Vite, Tailwind CSS, TanStack Query, React Hook Form
- Shared package: cross-app schemas/types in `packages/shared`

## Quick Start

1. Install dependencies:
   - `npm install`
2. Create env files:
   - `Copy-Item apps/api/.env.example apps/api/.env`
   - `Copy-Item apps/web/.env.example apps/web/.env`
3. Start PostgreSQL and set `DATABASE_URL` in `apps/api/.env`.
4. Apply migrations:
   - `npm run db:migrate`
5. Seed demo data:
   - `npm run db:seed`
6. Start API + web:
   - `npm run dev`

## Local URLs

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

## Available Scripts

- `npm run dev` - Run API and web apps in parallel
- `npm run build` - Build all workspaces
- `npm run lint` - Run lint checks across workspaces
- `npm run format` - Format repo files with Prettier
- `npm run format:check` - Check formatting without modifying files
- `npm run test` - Run workspace test scripts
- `npm run db:migrate` - Apply Prisma migrations (`@sft/api`)
- `npm run db:seed` - Seed demo data (`@sft/api`)
- `npm run db:studio` - Open Prisma Studio (`@sft/api`)

## Environment Variables

### `apps/api/.env`

| Variable                 | Required            | Purpose                                 | Example                                                                  |
| ------------------------ | ------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `API_PORT`               | No (default `4000`) | API listen port                         | `4000`                                                                   |
| `DATABASE_URL`           | Yes                 | PostgreSQL connection string for Prisma | `postgresql://sft_user:sft_password@localhost:5432/sft_db?schema=public` |
| `CORS_ORIGIN`            | Yes                 | Allowed frontend origin(s)              | `http://localhost:5173`                                                  |
| `JWT_ACCESS_SECRET`      | Yes                 | Access token signing secret             | `replace_with_long_random_access_secret`                                 |
| `JWT_REFRESH_SECRET`     | Yes                 | Refresh token signing secret            | `replace_with_long_random_refresh_secret`                                |
| `JWT_ACCESS_EXPIRES_IN`  | No (default `15m`)  | Access token lifetime (`ms` format)     | `15m`                                                                    |
| `JWT_REFRESH_EXPIRES_IN` | No (default `7d`)   | Refresh token lifetime (`ms` format)    | `7d`                                                                     |

### `apps/web/.env`

| Variable            | Required | Purpose                | Example                 |
| ------------------- | -------- | ---------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL for API calls | `http://localhost:4000` |

## Seeded Demo Account

`npm run db:seed` creates/updates a demo user and resets that user's finance data to a known state:

- Email: `demo@flowledger.dev`
- Password: `DemoPass123!`
- Accounts: `3`
- Categories: `8`
- Transactions: `12`
- Journal entries: `24` (2 per transaction, balanced)

## Manual API Testing

Use this checklist for manual verification:

- Run the app with `npm run dev`
- Authenticate via `POST /auth/login` and capture `accessToken`
- Reuse bearer token on protected endpoints
- Validate happy path, validation errors, and unauthorized scenarios
- Do not commit API client collections or environment exports

## Project Docs

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- Engineering guidelines: [`docs/AGENTS.md`](docs/AGENTS.md)
- Archived implementation plan: [`docs/archive/TASKS.md`](docs/archive/TASKS.md)

## CI/CD

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Current checks: `npm ci --include=dev`, `npm run lint`, `npm run build`
- Render deployment is configured via `render.yaml` for API and web services.
- When API/web environment values change, update Render environment variables and redeploy.
