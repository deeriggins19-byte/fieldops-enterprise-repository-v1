# FieldOps Enterprise Repository v1

This is the clean source-of-truth repository for FieldOps.

It replaces the many staged ZIPs with one organized monorepo.

## Apps

- `apps/api` — NestJS backend
- `apps/web` — Next.js dashboard
- `apps/mobile` — Expo mobile app

## Services

- `services/ai-engine` — AI troubleshooting and forecasting
- `services/workers` — background worker foundation

## Packages

- `packages/shared` — shared types
- `packages/sdk` — FieldOps API SDK

## Infrastructure

- `infra/docker` — local Docker Compose
- `.github/workflows` — CI starter

## Run Locally

```bash
cp .env.example .env
npm install
npm run docker:up
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
npm run dev:core
npm run dev:ready
npm run dev:stop
npm run smoke:dev
npm run test:auth-lockout
```

`npm run smoke:dev` checks API health, web reachability, auth login, and one authenticated API route.
`npm run dev:core` starts API + web together for day-to-day local development.
`npm run dev:ready` ensures API + web are running, waits for health, then executes `smoke:dev`.
`npm run dev:stop` stops local API/web listeners on ports 3001/3000 when they match expected dev processes.
`npm run test:auth-lockout` validates login lockout behavior (expected sequence: 401 x5, then 429).
`npm run dev:api` starts the API on port 3001 and automatically restarts stale API listeners.
`npm run dev:web` starts the web app in webpack mode on port 3000, which is the most stable option if Turbopack hits runtime manifest errors. If a stale Next.js process is already using port 3000, this command will restart it automatically.

## Default Login After Seed

```txt
admin@fieldops.local
FieldOps2026!
```

You can override seed credentials with `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD` in `.env`.

## Product Goal

FieldOps helps field-service teams scan assets, track labor, manage work orders, forecast completion, and use AI for troubleshooting.

## Security

For current dependency security status and remediation guidance, see [docs/SECURITY_TRIAGE_2026-06-25.md](docs/SECURITY_TRIAGE_2026-06-25.md).

## Launch Readiness

- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) - operational go-live checklist.
- [docs/RISK_ACCEPTANCE_TEMPLATE.md](docs/RISK_ACCEPTANCE_TEMPLATE.md) - residual risk sign-off template.
- [.env.production.example](.env.production.example) - production environment variable template.
