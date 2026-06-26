# Branch Policy Fallback (Private Repo Plan Limit)

Use this policy when GitHub branch protection is unavailable for a private repository.

## Why this exists

GitHub API returns 403 for branch protection on private repositories for the current plan.

## Required process controls

1. Do not push directly to `main` for feature work.
2. Open a pull request for every change.
3. Require at least one reviewer before merge.
4. Do not merge until CI workflow `build` job passes.
5. Resolve all review comments or explicitly document why not.
6. Use squash merge with a clear summary.

## Minimal PR checklist

Each pull request must confirm:

- [ ] CI is green
- [ ] Build/test checks were run locally where practical
- [ ] Security-impacting changes reviewed
- [ ] Launch docs updated if behavior changed

## Owner responsibilities

1. Repository owner enforces the checklist manually at merge time.
2. Repository owner blocks direct `main` pushes except emergency fixes.
3. For emergency fixes, open a follow-up PR documenting the hotfix.

## Exit criteria

When branch protection becomes available:

1. Enable required status checks (`build`).
2. Require at least one approving review.
3. Dismiss stale reviews on new commits.
4. Remove this fallback document from active policy and keep as archive.
