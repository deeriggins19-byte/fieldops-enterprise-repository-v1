# Runbook

## Daily Dev Start

1. Start infra: `npm run docker:up`
2. Ensure DB schema: `npm run db:migrate`
3. Seed demo data (rerunnable): `npm run seed`
4. Start/verify API+Web in one step: `npm run dev:ready`
5. Open web: `http://localhost:3000/login`
6. Login with seeded account from `.env`

## Daily Dev Stop

1. Stop API+Web listeners safely: `npm run dev:stop`
2. Stop infra if needed: `npm run docker:down`

## Validation Commands

1. Smoke readiness: `npm run smoke:dev`
2. Auth lockout: `npm run test:auth-lockout`
3. Full build: `npm run build`
