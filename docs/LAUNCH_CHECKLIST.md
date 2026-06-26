# Launch Checklist

## Code and Build Gates

- [x] `npm run dev:ready` passes
- [x] `npm run test:auth-lockout` passes
- [x] `npm run build` passes
- [x] CI workflow uses deterministic install (`npm ci`) and build/test checks

## Security and Secrets

- [ ] All production secrets are stored in secret manager (not in git)
- [ ] Values from `.env.production.example` are set in deployment environment
- [ ] Seed credentials are disabled or rotated after initialization
- [x] Residual dependency risks are reviewed and approved
- [x] Risk approval record created from `docs/RISK_ACCEPTANCE_TEMPLATE.md`

## Platform and Operations

- [ ] Branch protection enabled and required checks configured
- [x] Fallback PR policy in place when private-repo branch protection is unavailable
- [ ] Backup schedule defined for production database
- [ ] Restore drill executed and documented
- [ ] Health check monitors configured for API and web endpoints
- [ ] Alerting configured for API 5xx and auth failure spikes

Note: GitHub returned 403 for branch protection on this private repository due to plan limits.
Use `docs/BRANCH_POLICY_FALLBACK.md` until branch protection can be enabled.

## Go Live Validation

- [ ] API health endpoint returns 200 in production
- [ ] Web login page returns 200 in production
- [ ] Auth login succeeds with intended production account
- [ ] Auth lockout behavior validated in production-like environment
- [ ] Critical routes render (`/dashboard`, `/projects`, `/assets`, `/work-orders`, `/amara`)
