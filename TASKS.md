# tasks.md â€” Detailed SDLC / Development Plan (Module-by-Module)

## 0. Working agreements / workflow

- Dev style: backend-first per module
  1. DB + Prisma schema
  2. API routes + service layer
  3. Manual API-client test + edge cases
  4. Frontend UI + API integration
  5. Module regression check
- Branching:
  - main (stable)
  - feature/<module>-<task>
- Every module ends with:
  - Manual API checks completed (happy + validation + unauthorized)
  - Test notes updated
  - Payloads/validation cases updated in `MANUAL_API_TESTING.md` if endpoint contracts changed
  - Minimal smoke tests run
  - UI states checked (loading/empty/error)

---

## Phase 0 â€” Project Foundation (Platform setup)

### 0.1 Repo scaffolding (monorepo)

- [x] Initialize npm workspace + Turborepo
- [x] Create apps:
  - [x] apps/api (Express)
  - [x] apps/web (React/Vite)
- [x] Create packages:
  - [x] packages/shared (types + zod schemas)
- [x] Configure root scripts:
  - [x] npm dev (runs both)
  - [x] npm build
  - [x] npm lint
  - [x] npm test (placeholder ok)

### 0.2 Backend baseline

-[x] Express app skeleton -[x] Middleware baseline: -[x] request logger (pino) -[x] helmet -[x] cors -[x] json body parsing -[x] centralized error handler -[x] Health endpoint: -[x] GET /health -> { status: "ok" }

### 0.3 Database baseline

- [x] Docker compose: Postgres
- [x] Prisma init + connection env vars
- [x] First migration (empty ok)
- [x] Seed script scaffold

### 0.4 Frontend baseline

- [x] Vite + React + TS
- [x] Tailwind setup
- [x] Router scaffold with protected route shell
- [x] Layout shell:
  - [x] sidebar/nav
  - [x] header + user menu placeholder

### 0.5 Developer Experience / Quality gates

- [x] ESLint + Prettier configured for monorepo
- [x] Husky + lint-staged (optional but recommended)
- [x] Env templates:
  - [x] .env.example for api & web
- [x] External API client setup (manual, outside repo)

**Phase 0 exit criteria**

- [x] npm dev runs web+api
- [x] /health works
- [x] Prisma migrate works
- [x] Basic FE routes load

---

## Module 1 â€” Authentication & User Setup

### 1.0 Spec

- [x] Decide auth approach:
  - [x] JWT access token + refresh token cookie (recommended)
- [x] Define user fields: email, passwordHash, name, currency, learningModeEnabled

### 1.1 Backend

- [x] Prisma: User model + migration
- [x] Endpoints:
  - [x] POST /auth/register
  - [x] POST /auth/login
  - [x] POST /auth/logout
  - [x] GET /me
- [x] Password hashing (bcrypt)
- [x] Token issuance + refresh cookie
- [x] Middleware: requireAuth
- [x] Manual API tests:
  - [x] register success
  - [x] register validation failure
  - [x] login success
  - [x] wrong password
  - [x] login validation failure
  - [x] /me unauthorized
  - [x] /me authorized

### 1.2 Frontend

- [x] Pages: /login, /register
- [x] Auth guard for app routes
- [x] Session fetch:
  - [x] query: GET /me on load
- [x] Basic logout action

### 1.3 DoD

- [x] Protected routes blocked when logged out
- [x] Refresh does not break session unexpectedly
- [x] No secrets in logs

---

## Module 2 â€” Categories

### 2.0 Spec

- [x] Category types: INCOME, EXPENSE
- [x] Soft delete vs hard delete (recommend soft delete)

### 2.1 Backend

- [x] Prisma: Category model + migration
- [x] Endpoints:
  - [x] GET /categories
  - [x] POST /categories
  - [x] PATCH /categories/:id
  - [x] DELETE /categories/:id
- [x] Validation:
  - [x] name required
  - [x] type required
- [x] Authorization: user-scoped access
- [x] Manual API tests (CRUD + forbidden access)

### 2.2 Frontend

- [x] Categories page
- [x] Add/Edit modal
- [x] Archive/Delete action with confirm
- [x] Empty state for first-time users

### 2.3 DoD

- [x] Categories usable in transactions module

---

## Module 3 â€” Accounts

### 3.0 Spec

- [x] Account types: CASH, BANK, SAVINGS
- [x] Deletion policy: prevent delete if referenced OR archive

### 3.1 Backend

- [x] Prisma: Account model + migration
- [x] Endpoints:
  - [x] GET /accounts
  - [x] POST /accounts
  - [x] PATCH /accounts/:id
  - [x] DELETE /accounts/:id (archive)
- [ ] (Optional) GET /accounts/:id/balance

### 3.2 Frontend

- [x] Accounts page
- [x] Add/Edit form
- [x] Archive action + UI tag for archived accounts (optional)

### 3.3 DoD

- [x] Account list stable and referenced by transactions

---

## Module 4 â€” Transactions (Core)

### 4.0 Spec

- [x] Transaction fields: account, category, type, amount, occurredAt, note
- [x] Filters: month + optional category/account/type
- [x] Money: Decimal only, no floats

### 4.1 Backend

- [x] Prisma: Transaction model + migration
- [x] Endpoints:
  - [x] GET /transactions (filters)
  - [x] POST /transactions
  - [x] PATCH /transactions/:id
  - [x] DELETE /transactions/:id
- [x] Validation:
  - [x] amount > 0
  - [x] occurredAt required
  - [x] category must match transaction type
- [x] Manual API tests:
  - [x] create income
  - [x] create expense
  - [x] update
  - [x] delete
  - [x] filter by month

### 4.2 Frontend

- [x] Transactions page (list)
- [x] Create/Edit transaction form
- [x] Filters UI (month + dropdowns)
- [x] Loading skeletons + empty states

### 4.3 DoD

- [x] CRUD works end-to-end
- [x] Filters match backend results

---

## Module 5 â€” Accounting Engine (Journal Entries)

### 5.0 Spec

- [x] For each transaction create 2 journal lines (double-entry)
- [x] Ensure balanced journal: debits == credits
- [x] Define mapping:
  - INCOME: Debit ASSET(Account), Credit REVENUE(Category)
  - EXPENSE: Debit EXPENSE(Category), Credit ASSET(Account)
    Double-entry rule reference: each transaction affects at least two accounts and keeps debits and credits equal. :contentReference[oaicite:3]{index=3}

### 5.1 Backend

- [x] Prisma: JournalEntry model + migration
- [x] Service changes:
  - [x] On transaction create: insert 2 journal lines
  - [x] On update: recompute journal lines
  - [x] On delete: delete journal lines (or cascade)
- [x] Endpoint:
  - [x] GET /transactions/:id/journal
- [x] Invariant checks:
  - [x] if not balanced => throw error
- [x] Manual API tests:
  - [x] transaction creates journal
  - [x] journal lines sum debit==credit

### 5.2 Frontend

- [x] Transaction row expandable section (or drawer)
- [x] Show journal lines table
- [x] Show plain explanation (static, not AI)

### 5.3 DoD

- [x] All transactions have balanced journal entries
- [x] Learning Mode can reveal journal reliably

---

## Module 6 â€” Dashboard (Reports v1)

### 6.0 Spec

- [x] Monthly summary:
  - total income, total expense, net
  - breakdown by category (expense at minimum)
- [x] Chart requirements: readable, not cluttered

### 6.1 Backend

- [x] Endpoints:
  - [x] GET /reports/monthly-summary?month=YYYY-MM
  - [x] GET /reports/category-breakdown?month=YYYY-MM&type=EXPENSE (optional)
- [x] Ensure totals match raw transaction sums

### 6.2 Frontend

- [x] Dashboard page
- [x] Month selector
- [x] KPI cards + charts

### 6.3 DoD

- [x] Totals consistent; charts load quickly

---

## Module 7 â€” Statements (Income Statement + Balance Sheet)

### 7.0 Spec

- [x] Income statement per month
- [x] Balance sheet simplified:
  - assets = sum of accounts (computed)
  - equity = cumulative net income to date (documented as `CUMULATIVE_NET_INCOME_TO_DATE`)

Double-entry supports generating financial statements like balance sheet and income statement; keep MVP simplified. :contentReference[oaicite:4]{index=4}

### 7.1 Backend

- [x] GET /reports/income-statement?month=YYYY-MM
- [x] GET /reports/balance-sheet?asOf=YYYY-MM-DD (or month end)
- [x] Cross-check:
  - income statement net matches dashboard net

### 7.2 Frontend

- [x] Statements page
- [x] Tabs: Income Statement / Balance Sheet
- [x] Explanation text blocks (very short)

### 7.3 DoD

- [x] Statements match underlying data

---

## Module 8 â€” Settings + Learning Mode Toggle

### 8.0 Spec

- [x] Store learningModeEnabled on User (recommended)

### 8.1 Backend

- [x] PATCH /me/settings { learningModeEnabled }
- [x] GET /me includes setting

### 8.2 Frontend

- [x] Settings page with toggle
- [x] Toggle affects transaction UI (show/hide accounting section)

### 8.3 DoD

- [x] Toggle persists and changes UI behavior

---

## Phase 2 â€” Hardening, QA, Release Packaging

### 9.1 Quality & correctness

- [x] Enforce money Decimal usage everywhere
- [x] Add global error boundary (frontend)
- [x] Consistent API error mapping to UI
- [x] Rate limit auth endpoints
- [x] Validate CORS config

### 9.2 Testing

- [x] Complete manual API regression pass:
  - [x] Auth (register/login/me)
  - [x] Transaction -> Journal -> Balanced
  - [x] Monthly report totals
- [x] Regression checklist run

### 9.3 Demo readiness

- [x] Seed demo user + sample data
- [x] "Getting started" docs:
  - [x] run instructions
  - [x] env var docs
  - [x] how to run manual API test payloads
- [ ] Screenshots/GIF for README (optional)

### 9.4 Deployment readiness (optional but strong)

- [x] Dockerize api + web
- [x] Compose file for local production-like run
- [x] Build scripts verified

**Release exit criteria**

- [ ] MVP DoD satisfied
- [ ] No critical bugs in flows
- [ ] Demo data available
- [ ] Repo docs complete
