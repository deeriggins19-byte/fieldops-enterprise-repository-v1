# Next Steps

## Completed

- Local environment bootstrap (Node, Docker, DB migrate/seed).
- Stable startup commands (`dev:ready`, `dev:stop`, `dev:web`, `dev:core`).
- UI modernization and Amara-to-AI routing.
- Auth login lockout guard (401 x5 then 429).
- CI hardening (`npm ci`, check/build/test).

## Launch Blockers (Manual/Operational)

- Replace all default/local secrets before production deploy (use `.env.production.example`).
- Enable branch protection requiring passing CI.
- Define backup + restore runbook for production database.
- Create owner-approved risk acceptance for residual transitive vulnerabilities (use `docs/RISK_ACCEPTANCE_TEMPLATE.md`).

## Launch Checklist

- Follow `docs/LAUNCH_CHECKLIST.md` for final go-live validation.

## Recommended Next Engineering Tasks

- Add API rate-limit integration test coverage in CI (with controlled API startup in job).
- Add structured logging + alerting for auth failures and 5xx errors.
- Replace dashboard placeholder metrics with real backend aggregates.
