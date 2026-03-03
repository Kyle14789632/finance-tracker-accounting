# spec.md — FlowLedger Finance Tracker (MVP)

## 1. Overview

### 1.1 Product summary

A web app that helps users track income, expenses, and accounts, with an optional “Show journal” toggle that reveals double-entry journal entries and simple explanations.

### 1.2 Goals (MVP)

- Track personal finances (income/expense) with a clean dashboard
- Implement basic double-entry accounting: each transaction produces balanced debit/credit journal entries
- Provide basic financial statements:
  - Income Statement (Profit/Loss)
  - Balance Sheet (Assets & Equity simplified)
- Include Show journal toggle:
  - reveal journal entries
  - show simple accounting explanation per transaction

### 1.3 Non-goals (out of MVP scope)

- AI assistant/chat, predictions, budgeting rules, financial scoring (Phase 2+)
- Multi-currency conversions
- Bank sync integrations
- Complex accounting (accruals, AP/AR, depreciation, taxes, inventory)
- Shared family/group accounts (multi-tenant collaboration beyond a single user)

---

## 2. Users & Personas

### 2.1 Primary persona

- Individuals who want a simple personal finance tracker
- Wants clear summaries and optional accounting visibility without complexity

### 2.2 Secondary persona

- Beginners who want finance tracking + light accounting education

---

## 3. Core concepts & definitions

### 3.1 Transaction Types

- INCOME: money increases an Asset account and increases Revenue (or Equity via income)
- EXPENSE: money decreases an Asset account and increases Expense

### 3.2 Double-entry accounting rules (MVP)

Every transaction creates at least 2 journal lines such that:

- Total Debits = Total Credits (balanced journal)
- Accounts use a simplified chart:
  - ASSET: Cash/Bank/Savings accounts
  - REVENUE: Income categories (optional: store as account or derive from transaction type)
  - EXPENSE: Expense categories (optional: store as account or derive)
- Accounting equation concept (simplified):
  - Assets = Equity (where Equity = cumulative Net Income)
    Double-entry bookkeeping is defined by recording each event in at least two accounts, keeping debits and credits equal. This provides consistency checks. (Reference: standard explanations) :contentReference[oaicite:2]{index=2}

### 3.3 “Show journal”

A user setting that toggles whether to display:

- journal entries (debit/credit lines)
- “what happened?” explanation in plain language

---

## 4. Tech stack (final)

- Language: TypeScript
- Monorepo: npm workspaces + Turborepo
- Frontend: React + Vite + Tailwind CSS
  - React Router
  - TanStack Query
  - React Hook Form + Zod resolver
  - Recharts (charts)
- Backend: Node.js + Express.js
  - Prisma ORM
  - Zod validation
  - JWT auth (access token) + refresh token in httpOnly cookie (recommended)
  - helmet/cors/rate-limit/pino logging
- Database: PostgreSQL
- Money representation:
  - Option A (recommended for Prisma): Postgres NUMERIC(12,2) + Prisma Decimal (no JS number math)
  - Always avoid float arithmetic for money

---

## 5. Information architecture (pages)

### 5.1 Public pages

- /login
- /register

### 5.2 Authenticated pages

- /dashboard
- /transactions
- /accounts
- /categories
- /statements (Income Statement + Balance Sheet)
- /settings (Show journal toggle + profile name update)

---

## 6. Data model (proposed)

> Note: exact naming can be adjusted, but relationships should match.

### 6.1 User

- id (uuid)
- email (unique)
- passwordHash
- name (optional)
- currency (default “PHP”; allowed values: `PHP | USD`)
- learningModeEnabled (boolean)
- createdAt / updatedAt

### 6.2 Account (asset accounts only in MVP)

Represents where money sits (cash/bank/savings).

- id (uuid)
- userId (FK)
- name
- type: CASH | BANK | SAVINGS
- isArchived (boolean)
- createdAt / updatedAt

Balance rule:

- balance is computed from transactions OR maintained as derived view.
- MVP recommendation: compute via queries (safer), optionally cache later.

### 6.3 Category

- id (uuid)
- userId (FK)
- name
- type: INCOME | EXPENSE
- isArchived (boolean)
- createdAt / updatedAt

### 6.4 Transaction

- id (uuid)
- userId (FK)
- accountId (FK -> Account)
- categoryId (FK -> Category, required)
- type: INCOME | EXPENSE
- amount (Decimal)
- occurredAt (timestamp)
- note (text optional)
- createdAt / updatedAt

### 6.5 JournalEntry (double-entry lines)

Each Transaction produces 2 lines.

- id (uuid)
- userId (FK)
- transactionId (FK)
- side: DEBIT | CREDIT
- accountType: ASSET | REVENUE | EXPENSE
- accountRefId (nullable uuid)
  - For ASSET: references Account.id
  - For REVENUE/EXPENSE: can reference Category.id or be null and store label only
- label (string): e.g., “Cash”, “Food Expense”, “Allowance Income”
- amount (Decimal)
- createdAt

Rules:

- For each transaction: sum(debit amounts) = sum(credit amounts)
- Exactly 2 lines for MVP:
  - INCOME:
    - DEBIT ASSET (Account) amount
    - CREDIT REVENUE (Category) amount
  - EXPENSE:
    - DEBIT EXPENSE (Category) amount
    - CREDIT ASSET (Account) amount

---

## 7. API specification (MVP)

### 7.1 Conventions

- REST JSON
- All endpoints require authentication except register/login
- Use Zod validation for input
- Standard error shape:
  - { "error": { "code": "...", "message": "...", "details": ... } }

### 7.2 Auth

POST /auth/register

- body: { email, password, name?, currency? }
- response: { user }

POST /auth/login

- body: { email, password }
- response: { user }
- sets refresh token cookie (httpOnly)

POST /auth/logout

- clears refresh cookie

GET /me

- response: { user }

### 7.3 Categories

GET /categories?type=INCOME|EXPENSE
POST /categories
PATCH /categories/:id
DELETE /categories/:id (soft delete recommended)

### 7.4 Accounts

GET /accounts
POST /accounts
PATCH /accounts/:id
DELETE /accounts/:id (soft delete if referenced)

GET /accounts/:id/balance?from=...&to=...
(optional; or compute server-side for dashboard)

### 7.5 Transactions

GET /transactions?month=YYYY-MM&accountId=&categoryId=&type=
POST /transactions
PATCH /transactions/:id
DELETE /transactions/:id

Server responsibilities:

- On create/update/delete: generate/update/delete JournalEntry lines

### 7.6 Journal / Accounting

GET /transactions/:id/journal

- response: { journalEntries: [...] }

### 7.7 Reports

GET /reports/monthly-summary?month=YYYY-MM

- response:
  - totalIncome, totalExpense, net
  - expenseByCategory[]
  - incomeByCategory[] (optional)

GET /reports/income-statement?month=YYYY-MM

- response:
  - month
  - totalIncome
  - totalExpenses
  - netIncome
  - breakdownIncome[]
  - breakdownExpenses[]

GET /reports/balance-sheet?asOf=YYYY-MM-DD (or month end)

- response:
  - asOf
  - assets: [{ accountId, accountName, balance }]
  - totalAssets
  - equity (simplified): cumulative net income up to `asOf` (inclusive UTC day)
  - equityDefinition: `CUMULATIVE_NET_INCOME_TO_DATE`
  - (liabilities omitted in MVP)

---

## 8. Frontend behavior requirements

### 8.1 UX requirements

- Must support:
  - empty states (no data yet)
  - loading states
  - error states with user-friendly messages
- Forms:
  - client-side validation (Zod)
  - server error display (field + form level)
- Transactions:
  - list with filters (month/type/category/account)
  - add/edit modal or dedicated page

### 8.2 Show journal behavior

If learningModeEnabled:

- transaction row can expand to show journal lines
- show a brief explanation block:
  - INCOME: “Cash increases (asset) and income increases (revenue).”
  - EXPENSE: “Expense increases and cash decreases (asset).”

---

## 9. Security / privacy (MVP)

- Password hashing via bcrypt
- JWT access tokens + refresh token cookie (httpOnly)
- Rate limiting on auth routes
- CORS configured to frontend origin
- Helmet headers
- Logs must not contain passwords or tokens

---

## 10. Performance & correctness

- Must not use float math for money (Decimal only)
- Reports should be computed via SQL aggregations (Prisma groupBy where possible)
- Ensure journal entries always balance; enforce with service-layer invariant checks

---

## 11. Testing strategy (MVP)

- Manual API-client testing is the primary MVP testing approach (for example, Postman desktop app).
- For each module, run and document manual requests for:
  - happy path
  - validation failure
  - unauthorized/forbidden scenarios
- Keep request payload examples in your API client workspace notes; do not store API-client collections/environments in the repo.
- Automated tests are deferred until after MVP feature completion.

---

## 12. Release criteria (Definition of Done for MVP)

- User can:
  - register/login
  - create accounts
  - create categories
  - create/edit/delete transactions
  - view dashboard summaries
  - view statements
  - toggle Show journal
- Accounting:
  - journal lines exist for every transaction and are balanced
- Reliability:
  - no money precision issues
  - proper validation + error handling
- UI:
  - loading/empty/error states present on all major pages
