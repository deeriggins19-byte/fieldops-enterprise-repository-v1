# Security Triage Report

Date: 2026-06-25
Scope: npm workspace dependency audit
Repository: fieldops-enterprise

## Executive Summary

Current audit status:
- Total: 19
- High: 6
- Moderate: 13
- Critical: 0

Smoke test status:
- PASS (tests/smoke.js)

Current app manifests are in stable state and install/test are passing. Remaining findings are primarily transitive and are not cleanly resolved by npm audit fix without risky or regressive upgrade suggestions.

## Findings by Advisory Family

1. NestJS + multer chain (High)
- Vulnerable family: multer (DoS advisories)
- Reported package: multer 1.0.0 - 2.1.1
- Observed path:
  - @fieldops/api -> @nestjs/platform-express@11.1.27 -> multer@2.1.1
- Audit suggested fix: downgrade @nestjs/core to 7.5.5 (not acceptable; major regression)
- Recommendation:
  - Track upstream guidance for NestJS 11 + platform-express + multer patch alignment.
  - Do not accept downgrade to NestJS 7.

2. NestJS + js-yaml chain (Moderate/High family grouping)
- Vulnerable family: js-yaml advisory GHSA-h67p-54hq-rp68
- Observed paths:
  - @fieldops/api -> @nestjs/swagger@11.4.4 -> js-yaml@4.1.1
  - @fieldops/api (dev) -> @nestjs/cli@11.0.23 -> fork-ts-checker-webpack-plugin -> cosmiconfig -> js-yaml@4.1.1
  - @fieldops/mobile -> expo -> @expo/cli -> @expo/xcpretty -> js-yaml@4.1.1
- Audit suggested fix: downgrade @nestjs/swagger to 5.2.1 (not acceptable)
- Recommendation:
  - Keep NestJS 11 line.
  - Monitor and adopt upstream dependency refresh that lifts js-yaml transitively.

3. Next.js + postcss chain (Moderate)
- Vulnerable family: postcss advisory GHSA-qx2v-qp2m-jg93
- Observed path:
  - @fieldops/web -> next@16.2.9 -> postcss@8.4.31
- Audit suggested fix: downgrade next to 9.3.3 (not acceptable)
- Recommendation:
  - Stay on Next 16 line.
  - Apply next patch release when it updates the vulnerable postcss range.

4. bcrypt + node-pre-gyp + tar chain (High)
- Vulnerable family: tar advisories (multiple path traversal/symlink issues)
- Observed path:
  - @fieldops/api -> bcrypt@5.1.1 -> @mapbox/node-pre-gyp@1.0.11 -> tar@6.2.1
- Audit suggested fix: general fix available, but no safe direct workspace-level bump without package compatibility risk.
- Recommendation:
  - Evaluate bcrypt major upgrade in a dedicated compatibility branch.
  - If application allows, test bcrypt@6 migration to pick up newer transitive stack.

5. Expo + xcode + uuid chain (Moderate)
- Vulnerable family: uuid advisory GHSA-w5hq-g745-h8pq
- Observed path:
  - @fieldops/mobile -> expo@56.0.12 -> @expo/config-plugins@56.0.9 -> xcode@3.0.1 -> uuid@7.0.3
- Audit suggested fix: downgrade expo to 46.0.21 (not acceptable)
- Recommendation:
  - Keep Expo 56.
  - Track Expo and config-plugins updates that move xcode/uuid forward.

6. Expo internal advisory cluster (Moderate)
- Packages: @expo/cli, @expo/config, @expo/config-plugins, @expo/inline-modules, @expo/local-build-cache-provider, @expo/metro-config, @expo/prebuild-config
- Observed via: expo@56.0.12 dependency graph
- Recommendation:
  - Keep current Expo line.
  - Re-audit after each Expo patch release.

## Why force-fix is rejected

npm audit fix --force proposes major regressions for core frameworks in this repository, including:
- Next.js downgrade to 9.3.3
- Expo downgrade to 46.0.21
- NestJS downgrade to 7.5.5

These changes materially increase runtime risk and conflict with current app dependency baselines.

## Action Plan for PR Review

1. Accept current residual transitive risk with explicit documentation.
2. Open tracking issues for each advisory family above.
3. Schedule a monthly dependency refresh cycle focused on:
- Next patch line updates
- Expo patch line updates
- bcrypt major migration feasibility
- NestJS transitive dependency refreshes
4. Re-run:
- npm install
- npm audit --json
- node tests/smoke.js

## Reproduction Commands

- C:\Program Files\nodejs\npm.cmd install
- C:\Program Files\nodejs\npm.cmd audit --json
- C:\Program Files\nodejs\node.exe tests\smoke.js

## Current Verification Snapshot

- Install: success
- Smoke test: pass
- Vulnerabilities: 19 total (13 moderate, 6 high)
