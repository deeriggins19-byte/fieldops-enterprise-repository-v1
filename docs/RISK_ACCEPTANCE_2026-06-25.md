# Risk Acceptance Record

Date: 2026-06-25
Owner: Engineering
Approver: Pending Security + Product sign-off
Scope: Residual npm workspace transitive dependency risk at launch

## Summary

Launch proceeds with known residual transitive dependency risk documented in `docs/SECURITY_TRIAGE_2026-06-25.md`. Current build and regression checks pass, and forced audit remediation paths require major framework downgrades that introduce higher delivery and runtime risk than the present findings.

## Affected Advisory Families

1. NestJS + multer chain (High)
2. NestJS + js-yaml chain (Moderate/High family grouping)
3. Next.js + postcss chain (Moderate)
4. bcrypt + node-pre-gyp + tar chain (High)
5. Expo + xcode + uuid chain (Moderate)
6. Expo internal advisory cluster (Moderate)

Reference snapshot: 19 total findings (6 high, 13 moderate, 0 critical).

## Business Impact if Unmitigated

Potential outcomes include denial-of-service and dependency-chain exploit exposure in specific package paths. Given current exposure profile, exploit preconditions, and compensating controls, immediate impact is assessed as manageable for initial launch while targeted remediation is scheduled.

## Why Immediate Remediation Is Deferred

`npm audit fix --force` proposes major regressions incompatible with current production baseline:

1. Next.js downgrade to 9.3.3
2. Expo downgrade to 46.0.21
3. NestJS downgrade to 7.5.5

These downgrades are not acceptable for launch stability or feature compatibility.

## Compensating Controls

1. CI gate enforces deterministic install, build, and tests.
2. Local and pre-launch smoke checks validate auth and protected routes.
3. Auth lockout behavior is implemented and regression-tested.
4. Operational runbook and launch checklist are in place for rapid rollback/response.
5. Monthly dependency refresh and re-audit cadence is required.

## Time-Bound Plan

- Target remediation milestone: 2026-07-31
- Interim review date: 2026-07-10
- Final due date: 2026-08-15

## Approval

- Product Owner: Pending
- Engineering Lead: Pending
- Security Reviewer: Pending
