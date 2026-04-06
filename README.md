# Finance Data Processing and Access Control Backend

Backend assessment project built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Overview

This project implements a finance dashboard backend with:

- User management
- Role-based access control
- Financial record CRUD APIs
- Dashboard summary and analytics APIs
- Validation and consistent error handling
- PostgreSQL persistence through Prisma ORM

The implementation favors a clean service-oriented structure over unnecessary complexity. Authentication is JWT-based, and authorization is enforced at the API layer using role-aware middleware.

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod for request validation
- Vitest for unit tests

## Role Model

- `VIEWER`: Can only view dashboard summary data
- `ANALYST`: Can read records, dashboard data, and insight-oriented summaries
- `ADMIN`: Full access to users and financial records

## Main Features

### 1. User and Role Management

- Create users
- List users
- Update users
- Set role and active or inactive status
- Restrict management endpoints to admins

### 2. Financial Records Management

- Create records
- List records
- Update records
- Delete records
- Filter by type, category, and date range
- Paginated listing support

### 3. Dashboard Summary APIs

- Total income
- Total expenses
- Net balance
- Category-wise totals
- Recent activity
- Monthly trends

### 4. Validation and Error Handling

- Zod-based request validation
- `400` for invalid input
- `401` for missing or invalid tokens
- `403` for forbidden actions or inactive users
- `404` for missing resources
- `409` for unique constraint conflicts
- `500` fallback for unexpected errors

## Project Structure

```text
.
|-- prisma/
|   |-- schema.prisma
|   `-- seed.ts
|-- src/
|   |-- config/
|   |-- lib/
|   |-- middleware/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   `-- validators/
`-- tests/
```

## Data Model

### `User`

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `status`
- `createdById`
- `createdAt`
- `updatedAt`

### `FinancialRecord`

- `id`
- `amount`
- `type`
- `category`
- `recordDate`
- `description`
- `notes`
- `createdById`
- `createdAt`
- `updatedAt`

## API Endpoints

### Health

- `GET /health`

### Authentication

- `POST /api/auth/login`

Request body:

```json
{
  "email": "admin@finance.local",
  "password": "Admin@123"
}
```

### Users

- `GET /api/users` admin only
- `POST /api/users` admin only
- `PATCH /api/users/:userId` admin only

Sample create request:

```json
{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "password": "Secure123",
  "role": "ANALYST",
  "status": "ACTIVE"
}
```

### Financial Records

- `GET /api/records` analyst and admin only
- `POST /api/records` admin only
- `PATCH /api/records/:recordId` admin only
- `DELETE /api/records/:recordId` admin only

Supported query params for `GET /api/records`:

- `type`
- `category`
- `startDate`
- `endDate`
- `page`
- `pageSize`

Sample create request:

```json
{
  "amount": 2500.75,
  "type": "INCOME",
  "category": "Consulting",
  "recordDate": "2026-03-20",
  "description": "Advisory engagement",
  "notes": "Invoice settled within 7 days"
}
```

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/insights` analyst and admin only

Optional query params:

- `startDate`
- `endDate`

## Live Deployment

- Base URL: `https://zorvyn-backendtest.onrender.com`
- Health check: `https://zorvyn-backendtest.onrender.com/health`

### Reviewer Notes

- This API is deployed on Render free tier.
- The first request after inactivity may take up to 30-60 seconds due to cold start.
- `GET /` intentionally returns route not found for this API-only service.
- Use `GET /health` first to confirm uptime, then test auth and protected routes.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update values if needed.

`JWT_SECRET` is required outside test runs and should be a strong random value.

### 3. Start PostgreSQL

Use any local PostgreSQL instance and point `DATABASE_URL` to it.

If Docker is available on your machine, you can use:

```bash
docker compose up -d
```

### 4. Run Prisma migration

```bash
npx prisma migrate dev --name init
```

### 5. Seed sample data

```bash
npm run db:seed
```

### 6. Run the API

```bash
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Demo Credentials

After seeding:

- Admin: `admin@finance.local` / `Admin@123`
- Analyst: `analyst@finance.local` / `Analyst@123`
- Viewer: `viewer@finance.local` / `Viewer@123`

## Example Response

`GET /api/dashboard/summary`

```json
{
  "totalIncome": 8600,
  "totalExpenses": 2750,
  "netBalance": 5850,
  "categoryTotals": [
    { "category": "Consulting", "total": 6200 },
    { "category": "Subscriptions", "total": 2400 },
    { "category": "Infrastructure", "total": 1800 },
    { "category": "Payroll", "total": 950 }
  ],
  "monthlyTrends": [
    { "month": "2026-03", "income": 8600, "expense": 2750, "net": 5850 }
  ],
  "recentActivity": []
}
```

## Design Notes

- Prisma is used as the persistence boundary, while service modules own business logic.
- Middleware handles authentication, authorization, validation, and error shaping.
- Aggregation logic is kept in a dedicated utility so it is easy to test without a live database.
- Amounts are stored as decimal values in PostgreSQL to avoid floating-point storage issues.
- The role matrix is centralized in one permission utility to keep authorization rules explicit.

## Assumptions

- Only admins can mutate financial records and manage users.
- Viewers are dashboard-only and cannot read or mutate raw records.
- JWT authentication is sufficient for this assessment and avoids session infrastructure.
- Hard delete is used for records to keep the implementation straightforward.

## Testing

Run:

```bash
npm test
```

Current tests cover:

- Permission matrix behavior
- Dashboard summary aggregation logic
- API auth behavior and route-level RBAC checks
- Date range validation for dashboard and records filters

## Assignment Mapping

This section maps the assessment requirements to concrete implementation areas.

### 1) User and Role Management

- User CRUD-style management is provided through `/api/users` endpoints.
- Role and status are modeled directly in Prisma (`Role`, `UserStatus`).
- Role-based restrictions are enforced via authentication + authorization middleware.

### 2) Financial Records Management

- Record CRUD operations are available under `/api/records`.
- Filters are supported for type, category, and date range.
- Pagination is supported with `page` and `pageSize`.

### 3) Dashboard Summary APIs

- `/api/dashboard/summary` returns totals, balance, category totals, trends, and recent activity.
- `/api/dashboard/insights` returns insight-focused aggregates for analyst/admin roles.

### 4) Access Control Logic

- JWT authentication identifies the caller and user status.
- Permission checks are centralized in middleware and a role-permission utility.
- Endpoints enforce role behavior consistently (viewer/analyst/admin).

### 5) Validation and Error Handling

- Request shape validation uses Zod schemas per endpoint.
- Structured HTTP errors are used for validation, auth, forbidden access, not found, conflict, and fallback failures.

### 6) Data Persistence

- PostgreSQL persistence is implemented via Prisma ORM.
- Migrations and seed flow are included for reproducible local setup.

## Quick Verification Checklist

Use this checklist before sharing the repository:

1. Start DB and confirm `DATABASE_URL` in `.env` points to it.
2. Run `npx prisma migrate dev --name init`.
3. Run `npm run db:seed`.
4. Run `npm run dev` and confirm the server logs `Finance backend listening on port 4000`.
5. Call `GET /health` and verify response is `{ "status": "ok" }`.
6. Call `POST /api/auth/login` using admin demo credentials and verify token response.
7. Run `npm test` and confirm tests pass.

For production verification (Render):

1. Open `https://zorvyn-backendtest.onrender.com/health` and verify `{ "status": "ok" }`.
2. Ensure production `DATABASE_URL` points to Render Postgres (never `localhost`).
3. Run production migration with `npx prisma migrate deploy`.
4. Seed data once with `npm run db:seed` if reviewer demo credentials are needed.
5. Call `POST /api/auth/login` using seeded admin credentials.

## Submission Notes

This project is designed for assessment readability:

- Clear route and service separation
- Explicit validation and authorization rules
- Practical PostgreSQL schema
- Simple setup path with seeded demo data

If I were extending this further, I would add refresh tokens, audit logs, Swagger/OpenAPI documentation, and integration tests backed by a disposable PostgreSQL test database.
