# Manual API Testing Guide (MVP)

Use this guide for manual testing in your API client (for example, Postman desktop app).
Do not export collections or environment files into this repo.

## 1) Base setup

- Base URL: `http://localhost:4000`
- Common header for JSON requests: `Content-Type: application/json`
- Protected routes: send `Authorization: Bearer <access_token>`
- Standard error shape:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### 1.1) Quick start with seeded demo user

Before running payloads in this file:

1. Run DB and API locally (`npm run db:up`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`).
2. Log in with seeded credentials:
   - `email`: `demo@studentfinance.dev`
   - `password`: `DemoPass123!`
3. Copy the returned `accessToken` from `POST /auth/login` into your API client auth header.

## 2) Auth routes

### POST /auth/register

Request body:

```json
{
  "email": "student@example.com",
  "password": "StrongPass123!",
  "name": "Student User",
  "currency": "USD"
}
```

Expected success response:

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Student User",
    "currency": "USD",
    "learningModeEnabled": false,
    "createdAt": "2026-02-18T06:00:00.000Z",
    "updatedAt": "2026-02-18T06:00:00.000Z"
  },
  "accessToken": "jwt-access-token"
}
```

Cookie behavior:

- sets `refreshToken` httpOnly cookie

Validation tests:

- invalid email format
- password too short
- missing required fields
- duplicate email

### POST /auth/login

Request body:

```json
{
  "email": "student@example.com",
  "password": "StrongPass123!"
}
```

Expected success response:

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Student User",
    "currency": "USD",
    "learningModeEnabled": false,
    "createdAt": "2026-02-18T06:00:00.000Z",
    "updatedAt": "2026-02-18T06:00:00.000Z"
  },
  "accessToken": "jwt-access-token"
}
```

Cookie behavior:

- sets `refreshToken` httpOnly cookie

Validation and error tests:

- missing `email` or `password`
- wrong password
- non-existing email

### POST /auth/logout

Request body:

```json
{}
```

Required auth header:

- `Authorization: Bearer <access_token>`

Error tests:

- call while unauthenticated
- call with expired/invalid token

### GET /me

No request body.

Expected success response (200):

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Student User",
    "currency": "USD",
    "learningModeEnabled": false,
    "createdAt": "2026-02-18T06:00:00.000Z",
    "updatedAt": "2026-02-18T06:00:00.000Z"
  }
}
```

Error tests:

- missing bearer token
- invalid bearer token

## 3) Category routes

### POST /categories

Request body:

```json
{
  "name": "Allowance",
  "type": "INCOME"
}
```

Expected success response (201):

```json
{
  "category": {
    "id": "uuid",
    "name": "Allowance",
    "type": "INCOME",
    "isArchived": false,
    "createdAt": "2026-02-18T08:20:00.000Z",
    "updatedAt": "2026-02-18T08:20:00.000Z"
  }
}
```

Validation tests:

- missing `name`
- invalid `type` (not `INCOME` or `EXPENSE`)
- empty `name`

Authorization tests:

- request without token
- request with another user token then verify isolation on `GET /categories`

### GET /categories

No request body.

Sample query:

- `/categories?type=INCOME`

Expected success response (200):

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Allowance",
      "type": "INCOME",
      "isArchived": false,
      "createdAt": "2026-02-18T08:20:00.000Z",
      "updatedAt": "2026-02-18T08:20:00.000Z"
    }
  ]
}
```

Notes:

- archived categories (`isArchived=true`) are excluded from this list

### PATCH /categories/:id

Request body:

```json
{
  "name": "Food",
  "type": "EXPENSE"
}
```

Expected success response (200):

```json
{
  "category": {
    "id": "uuid",
    "name": "Food",
    "type": "EXPENSE",
    "isArchived": false,
    "createdAt": "2026-02-18T08:20:00.000Z",
    "updatedAt": "2026-02-18T08:25:00.000Z"
  }
}
```

Error tests:

- invalid category id format
- category not found
- category owned by another user (returns 404 due user-scoped lookup)

### DELETE /categories/:id

No request body.

Expected success response (200, soft delete):

```json
{
  "category": {
    "id": "uuid",
    "name": "Food",
    "type": "EXPENSE",
    "isArchived": true,
    "createdAt": "2026-02-18T08:20:00.000Z",
    "updatedAt": "2026-02-18T08:30:00.000Z"
  }
}
```

Error tests:

- invalid id
- not found
- unauthorized
- another user attempts delete (returns 404 due user-scoped lookup)

## 4) Account routes

### POST /accounts

Request body:

```json
{
  "name": "BPI Savings",
  "type": "SAVINGS"
}
```

Expected success response (201):

```json
{
  "account": {
    "id": "uuid",
    "name": "BPI Savings",
    "type": "SAVINGS",
    "isArchived": false,
    "createdAt": "2026-02-18T09:00:00.000Z",
    "updatedAt": "2026-02-18T09:00:00.000Z"
  }
}
```

Validation tests:

- missing `name`
- invalid `type` (`CASH | BANK | SAVINGS` only)

### GET /accounts

No request body.

Sample query:

- `/accounts?type=BANK`

Expected success response (200):

```json
{
  "accounts": [
    {
      "id": "uuid",
      "name": "BPI Savings",
      "type": "SAVINGS",
      "isArchived": false,
      "createdAt": "2026-02-18T09:00:00.000Z",
      "updatedAt": "2026-02-18T09:00:00.000Z"
    }
  ]
}
```

Notes:

- archived accounts (`isArchived=true`) are excluded from this list

### PATCH /accounts/:id

Request body:

```json
{
  "name": "Wallet Cash",
  "type": "CASH"
}
```

Expected success response (200):

```json
{
  "account": {
    "id": "uuid",
    "name": "Wallet Cash",
    "type": "CASH",
    "isArchived": false,
    "createdAt": "2026-02-18T09:00:00.000Z",
    "updatedAt": "2026-02-18T09:05:00.000Z"
  }
}
```

Error tests:

- invalid id
- not found
- other-user account access

### DELETE /accounts/:id

No request body.

Expected success response (200, archive):

```json
{
  "account": {
    "id": "uuid",
    "name": "Wallet Cash",
    "type": "CASH",
    "isArchived": true,
    "createdAt": "2026-02-18T09:00:00.000Z",
    "updatedAt": "2026-02-18T09:10:00.000Z"
  }
}
```

Error tests:

- invalid id
- account not found
- unauthorized
- other-user account access (returns 404 due user-scoped lookup)

## 5) Transaction routes

### POST /transactions

Request body:

```json
{
  "accountId": "replace-with-account-uuid",
  "categoryId": "replace-with-category-uuid",
  "type": "EXPENSE",
  "amount": "250.00",
  "occurredAt": "2026-02-18T10:00:00.000Z",
  "note": "Lunch near campus"
}
```

Validation tests:

- `amount` <= 0
- `amount` not numeric string
- missing `occurredAt`
- invalid `type`
- category type mismatch

### GET /transactions

No request body.

Sample query:

- `/transactions?month=2026-02`
- `/transactions?month=2026-02&type=EXPENSE`
- `/transactions?month=2026-02&accountId=<uuid>&categoryId=<uuid>`

Notes:

- `month` is required and must use `YYYY-MM`

Validation tests:

- missing `month`
- invalid `month` format (not `YYYY-MM`)

### PATCH /transactions/:id

Request body:

```json
{
  "accountId": "replace-with-account-uuid",
  "categoryId": "replace-with-category-uuid",
  "type": "INCOME",
  "amount": "5000.00",
  "occurredAt": "2026-02-18T12:30:00.000Z",
  "note": "Part-time salary"
}
```

Error tests:

- invalid transaction id
- not found
- other-user transaction

### DELETE /transactions/:id

No request body.

Error tests:

- invalid id
- not found
- unauthorized

## 6) Journal route

### GET /transactions/:id/journal

No request body.

Sample success response:

```json
{
  "journalEntries": [
    {
      "id": "uuid",
      "transactionId": "uuid",
      "side": "DEBIT",
      "accountType": "ASSET",
      "accountRefId": "uuid",
      "label": "Cash Wallet",
      "amount": "70.00",
      "createdAt": "2026-02-18T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "transactionId": "uuid",
      "side": "CREDIT",
      "accountType": "REVENUE",
      "accountRefId": "uuid",
      "label": "Allowance",
      "amount": "70.00",
      "createdAt": "2026-02-18T12:00:00.000Z"
    }
  ]
}
```

Success checks:

- exactly 2 lines returned for MVP
- debit total equals credit total
- side/accountType mapping matches transaction type

Error tests:

- invalid transaction id
- transaction not found
- unauthorized

## 7) Report routes

### GET /reports/monthly-summary?month=YYYY-MM

No request body.

Sample query:

- `/reports/monthly-summary?month=2026-02`

Expected success response (200):

```json
{
  "summary": {
    "month": "2026-02",
    "totalIncome": "3000.00",
    "totalExpense": "200.00",
    "net": "2800.00"
  }
}
```

Validation tests:

- missing `month`
- invalid `month` format

Authorization tests:

- request without bearer token
- request with invalid token

### GET /reports/category-breakdown?month=YYYY-MM&type=EXPENSE

No request body.

Sample queries:

- `/reports/category-breakdown?month=2026-02&type=EXPENSE`
- `/reports/category-breakdown?month=2026-02` (defaults `type` to `EXPENSE`)

Expected success response (200):

```json
{
  "breakdown": {
    "month": "2026-02",
    "type": "EXPENSE",
    "total": "200.00",
    "categories": [
      {
        "categoryId": "uuid",
        "categoryName": "Food",
        "total": "120.50"
      },
      {
        "categoryId": "uuid",
        "categoryName": "Transport",
        "total": "79.50"
      }
    ]
  }
}
```

Validation tests:

- missing `month`
- invalid `month` format
- invalid `type` value (must be `INCOME` or `EXPENSE`)

### GET /reports/income-statement?month=YYYY-MM

No request body.

Sample query:

- `/reports/income-statement?month=2026-02`

Expected success response (200):

```json
{
  "statement": {
    "month": "2026-02",
    "totalIncome": "1500.00",
    "totalExpenses": "450.00",
    "netIncome": "1050.00",
    "breakdownIncome": [
      {
        "categoryId": "uuid",
        "categoryName": "Part Time",
        "total": "1500.00"
      }
    ],
    "breakdownExpenses": [
      {
        "categoryId": "uuid",
        "categoryName": "Food",
        "total": "450.00"
      }
    ]
  }
}
```

Validation tests:

- missing `month`
- invalid `month` format

Authorization tests:

- missing bearer token
- invalid bearer token

Cross-check test (required):

- call `GET /reports/monthly-summary?month=YYYY-MM`
- call `GET /reports/income-statement?month=YYYY-MM`
- assert `summary.net === statement.netIncome` for the same month

### GET /reports/balance-sheet?asOf=YYYY-MM-DD

No request body.

Sample query:

- `/reports/balance-sheet?asOf=2026-02-28`

Expected success response (200):

```json
{
  "statement": {
    "asOf": "2026-02-28",
    "assets": [
      {
        "accountId": "uuid",
        "accountName": "Campus Wallet",
        "balance": "1000.00"
      }
    ],
    "totalAssets": "1000.00",
    "equity": "1000.00",
    "equityDefinition": "CUMULATIVE_NET_INCOME_TO_DATE"
  }
}
```

Notes:

- MVP equity definition is `CUMULATIVE_NET_INCOME_TO_DATE` (cumulative income minus cumulative expense up to and including `asOf`, UTC date boundary).
- Liabilities are omitted in MVP.

Validation tests:

- invalid `asOf` format
- invalid calendar date (example: `2026-02-31`)

Authorization tests:

- missing bearer token
- invalid bearer token

## 8) Settings route

### PATCH /me/settings

Request body:

```json
{
  "learningModeEnabled": true
}
```

Expected success response (200):

```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "Student User",
    "currency": "USD",
    "learningModeEnabled": true,
    "createdAt": "2026-02-18T06:00:00.000Z",
    "updatedAt": "2026-02-20T14:30:00.000Z"
  }
}
```

Validation tests:

- non-boolean `learningModeEnabled`
- missing body

Authorization tests:

- missing bearer token
- invalid bearer token

Success check:

- call `PATCH /me/settings` with `learningModeEnabled=true`
- call `GET /me` and verify `user.learningModeEnabled === true`

## 9) Manual regression checklist

- Auth:
  - register success
  - login success
  - `/me` authorized and unauthorized
- Categories/Accounts:
  - CRUD works per user scope
- Transactions:
  - create/update/delete works
  - month filtering works
- Journal:
  - transaction creates balanced debit/credit lines
- Reports:
  - monthly totals match transaction sums
  - income statement net matches dashboard monthly net for same month
  - balance sheet returns `equityDefinition = CUMULATIVE_NET_INCOME_TO_DATE`
