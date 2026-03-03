# AGENTS.md — Engineering Guidelines for FlowLedger (MVP)

> Purpose: Give coding agents (Codex) a single source of truth for architecture, conventions, and delivery flow.

## 0) Project snapshot

- Product: Personal finance tracker + optional journal visibility
- Scope: MVP only (no AI in MVP)
- Dev workflow: backend-first per module (manual API-client testing), then frontend + integration, then repeat
- Stack:
  - TypeScript monorepo
  - apps/web: React + Vite + Tailwind
  - apps/api: Node + Express
  - DB: Postgres
  - ORM: Prisma
  - Validation: Zod
  - Data fetching: TanStack Query
  - Forms: React Hook Form + Zod resolver
  - Charts: Recharts
  - Monorepo: npm workspaces + Turborepo

## UI Design Vibe (MUST FOLLOW) — Soft Academic

- Clean white background; accents only in soft blue (primary) + sage green (success/savings).
- Rounded, calm UI: cards `rounded-2xl`, subtle borders, very light/no shadows.
- Simple charts only (pie + bar/line): minimal clutter, clear labels/legend, tooltips.
- Friendly outline icons (single icon set), plenty of whitespace, readable hierarchy.
- Consistent states: skeleton loading; friendly empty state + 1 CTA; calm error banner + retry.
- Show Journal: OFF = normal tracker; ON = expandable journal (Debit/Credit) + 1–2 sentence explanation.

## 1) Monorepo structure

Expected structure:

/
apps/
api/
src/
index.ts
app/
core/
modules/
middleware/
config/
prisma/
schema.prisma
migrations/
seed.ts
package.json
web/
src/
main.tsx
app/
routes/
layout/
components/
features/
api/
hooks/
utils/
package.json
packages/
shared/
src/
schemas/ # zod schemas shared across FE/BE (preferred)
package.json
turbo.json
package.json
AGENTS.md
spec.md
tasks.md

Rules:

- Keep API logic grouped by feature in `api/src/modules/<feature>`.
- Inside a feature module, use: route -> controller -> service -> repository.
- Keep controllers thin and keep Prisma usage inside repositories.
- Keep Zod schemas in packages/shared when possible (DRY validation + typing).
- Use feature folders in web for scaling.

## 2) Delivery process (MANDATORY)

For each module:

1. Spec: confirm scope, DB, API contract, UI needs.
2. Backend:
   - Prisma model + migration
   - Service layer
   - Routes/controllers
   - Zod validation
   - Manual API tests (happy + sad paths)
3. Frontend:
   - Route/page + UI
   - Hooks using TanStack Query
   - RHF + Zod forms
   - Loading/empty/error states
4. Done:
   - End-to-end flow works
   - Regression smoke test
   - Manual API test checklist updated

Do NOT start frontend until backend endpoints exist and are tested manually in your API client.

## 3) Global conventions

### 3.1 TypeScript

- Strict mode enabled.
- Never use `any` unless unavoidable and justified.
- Prefer explicit types at module boundaries (API inputs/outputs).

### 3.2 Formatting and lint

- Prettier + ESLint enforced.
- No unused variables.
- Consistent import ordering.

### 3.3 Error handling

API responses must follow a consistent shape:

- Success: JSON object
- Error: `{ error: { code: string, message: string, details?: any } }`

Express error middleware must:

- map Zod errors to 400 with readable details
- map auth errors to 401/403
- map not found to 404
- map unexpected to 500 (log with request id)

### 3.4 Logging

- Use pino for API logs.
- Do NOT log secrets: passwords, tokens, refresh cookies.

### 3.5 Dates and time

- Store timestamps in UTC.
- For monthly filters, use YYYY-MM.
- Use date-fns where needed.
- Avoid timezone-dependent logic in the DB unless required.

## 4) Security requirements (MVP)

- Password hashing: bcrypt (salt rounds reasonable).
- Auth:
  - JWT access token (Authorization: Bearer)
  - refresh token stored in httpOnly cookie (recommended)
- Protect all endpoints except /auth/register and /auth/login.
- Rate limit auth routes.
- Helmet headers.
- CORS locked to the web origin.

## 5) Money rules (CRITICAL)

- Never use JS floating point math for money.
- Database uses either:
  - NUMERIC(12,2) with Prisma Decimal
  - or BIGINT cents (only if explicitly chosen)
    MVP default: NUMERIC + Prisma Decimal.

Rules:

- Treat all money values as Decimal (or string) at API boundaries.
- Only format to currency strings in the UI layer.
- When computing totals, use database aggregation or Decimal-safe math.

## 6) Accounting rules (MVP)

This app implements simplified double-entry accounting.

### 6.1 Transaction types

- INCOME: user receives money into an Asset account
- EXPENSE: user spends money from an Asset account

### 6.2 Journal entries generation

Every transaction must create exactly 2 journal lines:

INCOME:

- DEBIT ASSET (Account) amount
- CREDIT REVENUE (Category) amount

EXPENSE:

- DEBIT EXPENSE (Category) amount
- CREDIT ASSET (Account) amount

Invariant:

- Debits sum == Credits sum (balance).
- On transaction update: recompute journal entries.
- On transaction delete: delete (or cascade) journal entries.

### 6.3 Show Journal

When learningModeEnabled:

- UI may show journal lines and a short plain explanation.
  No AI in MVP.

## 7) API design guidelines

- REST JSON.
- Resource naming: plural nouns (/transactions, /accounts, /categories).
- Use query params for filtering (month, type, categoryId, accountId).
- Pagination optional for MVP; if added, use `limit` + `cursor` pattern.

### 7.1 Validation

- Use Zod for:
  - request body
  - query params
  - route params
- Return 400 with field-level errors.

### 7.2 Authorization

- All resources are user-scoped.
- Ensure the authenticated user cannot access another user’s records.
- Always filter by userId in DB queries.

## 8) Backend architecture pattern (recommended)

- `app/` -> app bootstrap and route registration
- `core/` -> cross-cutting helpers (http, errors, money, datetime, db)
- `modules/<feature>/`:
  - `<feature>.route.ts` -> route definitions
  - `<feature>.controller.ts` -> parse/validate, call service, return response
  - `<feature>.service.ts` -> business logic and invariants
  - `<feature>.repository.ts` -> Prisma/data access only
  - `<feature>.mapper.ts` -> DB-to-contract transformations
- `middleware/` -> auth, error, logging, rate-limits

No Prisma calls inside controllers/services. Use repository boundaries.

## 9) Frontend architecture pattern

- Use feature folders:
  - features/auth
  - features/accounts
  - features/categories
  - features/transactions
  - features/reports
  - features/statements
- React Query:
  - One hook per endpoint in `web/src/api/` or `features/*/api.ts`
  - Invalidate relevant queries after mutations
- Forms:
  - React Hook Form + zodResolver
  - Show server errors (form-level and field-level)
- UI states:
  - Loading state
  - Empty state
  - Error state

## 10) Manual API Testing Workflow (MANDATORY)

- Each module must execute manual API tests in your external API client (for example, Postman desktop app).
- Include:
  - happy path
  - validation failure
  - unauthorized scenario
- Do not store API-client collections or environment exports in the repo.

## 11) Testing expectations

Minimum manual coverage:

- Auth: register/login/me
- Transaction: create => journal entries exist and balanced
- Report: monthly summary totals match

Automated tests are optional during MVP and can be added in hardening.

Current backend baseline:

- Add and maintain unit tests for module services (`apps/api/src/**/*.test.ts`).
- Keep manual API regression checks for auth, transactions/journal, and reports.
- For new backend modules, add at least:
  - happy path service test
  - core invariant or failure-path test

## 14) Adding a Backend Module

When adding a new API module, use this checklist:

1. Create folder: `apps/api/src/modules/<feature>/`.
2. Add files:
   - `<feature>.route.ts`
   - `<feature>.controller.ts`
   - `<feature>.service.ts`
   - `<feature>.repository.ts`
   - `<feature>.mapper.ts` (if mapping is needed)
   - `index.ts`
3. Put request/query/response schemas in `packages/shared/src/schemas/*` when they are API contracts.
4. Register the router in `apps/api/src/app/register-routes.ts`.
5. Keep auth/user scoping in repository queries (`where: { userId }`).
6. Add service unit tests in the same module folder.
7. Run: `npm run lint -w @sft/api`, `npm run build -w @sft/api`, `npm run test -w @sft/api`.

## 12) Module order (MVP)

1. Auth & user (/auth/\*, /me)
2. Categories
3. Accounts
4. Transactions
5. Journal entries (accounting engine)
6. Dashboard reports
7. Statements
8. Settings (show journal toggle + profile)

Do not reorder unless dependencies are handled.

## 13) Definition of Done (per module)

A module is "done" only if:

- Backend:
  - Prisma migration applied
  - Zod validations exist
  - auth + user scoping enforced
  - Manual API test scenarios executed + pass
- Frontend:
  - UI integrated and functional
  - loading/empty/error states
  - forms validated
- Integration:
  - create/read/update/delete works
  - journal invariants hold (where relevant)
- Regression:
  - smoke test on key flows
