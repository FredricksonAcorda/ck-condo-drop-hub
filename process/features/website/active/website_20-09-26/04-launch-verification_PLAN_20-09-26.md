# Phase 4 - Whole-app verification and cost-compatible launch

**Date**: 20 September 2026
**Status**: PLANNED - reviewable draft; no implementation started
**Complexity**: Complex - deployment compatibility, security, recovery and client acceptance

## Overview

Verify the complete application and prepare a launch candidate. Vercel is preferred but Hobby is non-commercial only. Recommend Netlify Free plus Firebase Spark for low usage, subject to runtime/quota proof and review. Zero recurring paid service does not promise unlimited capacity or no maintenance.

Read `website-umbrella_PLAN_20-09-26.md` and `design-review.md` in this folder. Umbrella AC identifiers below are draft requirements, not a locked SPEC.

## Dependencies and Decisions

Requires Phases 1-3 evidence, approved production content/assets/policies, actual devices and a tested recovery path. Next.js/React/TypeScript plus Firebase Spark remain proposed; the selected free commercial alternative must prove framework/runtime compatibility. No paid provisioning is authorized.

Context check: `process/context/all-context.md` and `process/context/tests/all-tests.md` were absent during planning. Recheck and follow their relevant routes before execution; do not invent installed tooling.

## Touchpoints

- `playwright.config.ts`, `tests/e2e/{full-journey,production-smoke,accessibility}.spec.ts`, `tests/integration/security-regression.test.ts`: full-app acceptance.
- `scripts/{verify-release,check-bundle,backup-firestore,restore-firestore}.mjs`: proposed verification and isolated recovery tooling.
- `package.json`, framework adapter/config files and deployment configuration: selected only after host proof; no assumed vercel.json requirement.
- `.env.example`, `.gitignore`, `docs/{deployment,operations,backup-restore,cost-limits}.md`: secret names, owner procedures and cost constraints.
- `process/context/all-context.md`, `process/context/tests/all-tests.md`: future authoritative routing and commands once implementation is authorized.
- `04-launch-verification_REPORT_20-09-26.md` in this task folder: evidence index and residual limitations; no production data copied into reports.

## Public Contracts

- Public marketing may be cached; authenticated pages/API responses must not leak through shared caches, logs or client bundles.
- Deployment must preserve auth cookie/callback behavior, route handlers, secure secrets, camera HTTPS and database authorization on the chosen runtime.
- Zero recurring paid service is a constraint within documented quotas, not a promise of unlimited capacity or zero maintenance labor.
- Vercel Hobby restriction is a blocking compatibility fact for commercial use: https://vercel.com/docs/plans/hobby . Recheck applicable terms before launch.
- Free alternative hosting, Firebase Spark quotas, email throughput, backup retention, availability/pausing and custom-domain costs must be recorded; no automatic paid upgrade.
- Launch is accepted only with reviewed production content and passing operational flows; unavailable optional integrations retain honest unavailable states.

## Blast Radius

Approximately 10-20 verification/config/runbook files plus bounded fixes in existing modules. High deployment/secrets/data-recovery risk; no new product scope, paid service activation or irreversible migration is implied by this plan.

## Implementation Checklist

- [ ] Validate proposed Netlify Free commercial hosting, 300 monthly credits and hard stop without recharge, plus Firebase Spark; record the unresolved review choice against Vercel preference.
- [ ] Recheck primary provider terms and quota limits at launch time; record source URLs, date, service owner and what happens when free quota is exhausted.
- [ ] Prove the candidate runtime supports chosen Next.js build/adapter, server routes, cookie refresh/callbacks, image handling and secret boundaries.
- [ ] Verify Firebase Spark document/read/write/auth/email quotas; use Auth/Firestore emulators for routine staging. Do not enable Blaze, Cloud Functions, App Hosting, Storage or paid managed backups.
- [ ] Verify real authentication email sending to intended users, sender/domain requirements and rate limits; no local inbox substitution for launch evidence.
- [ ] Review every visible link/CTA and optional feature state against the confirmed full-app scope; prevent fake payment, courier tracking or notification success.
- [ ] Complete desktop source comparison and responsive matrix, including real mobile Safari/Chrome, short landscape and keyboard/zoom use.
- [ ] Run public signup through profile update, admin receive, customer notification/list, scan verify, pickup and customer history using isolated staging records.
- [ ] Run the forbidden-role, foreign-customer, inactive-session, CSRF/origin, private-cache and secret-exposure checks against the deployed candidate.
- [ ] Measure public-page loading and scan activation on representative mobile conditions; keep scanner out of initial public bundle.
- [ ] Rehearse local encrypted Admin SDK JSON backup and isolated restore; preserve IDs/types/timestamps/references, document consistent capture/quiescence and quota costs; verify document counts, indexes, rules and app behavior.
- [ ] Rehearse application rollback with backward-compatible collection/index changes; no destructive data rewrite or claim that app rollback restores lost records.
- [ ] Record production contact/hours/address/social assets, pricing and deadline policies; remove reference names/counters/dates from live user contexts.
- [ ] Prepare owner runbook covering admin access, customer support, failed email/scans, quota saturation, backups, restore and maintenance tasks.
- [ ] Prepare concrete deployment summary, target resources and release evidence before any final launch approval required by the active session.
- [ ] After authorized launch, run scoped production smoke with controlled records and report factual results, known limits and rollback location.

## Acceptance Criteria

All AC-01 through AC-12 must have linked proof or an explicitly unresolved decision. AC-11/AC-12 govern release acceptance; commercial eligibility and zero-paid-service feasibility are additional confirmed user constraints.

All checked items require observed evidence. Reference fixtures, mocked services and planned commands are not evidence of production functionality.

## Phase Completion Rules

- [ ] Phase-specific research and unresolved decisions are reconciled with the umbrella.
- [ ] Validate Contract is written and implementation is authorized for this exact phase.
- [ ] Checklist is implemented; applicable automated checks pass and manual/data evidence is recorded.
- [ ] Report identifies deviations, known gaps and next phase dependency readiness.
Use PLANNED until execution begins, CODE DONE when code exists without full proof, and VERIFIED only after required evidence and user-confirmed working acceptance. Never mark completed just because draft validation passes.

## Test Procedure and Data Verification

- `npm run verify:release` is proposed to run typecheck, lint, build and scoped unit/integration/E2E checks; scripts must exist and be documented before execution.
- `npm run test:e2e -- tests/e2e/full-journey.spec.ts tests/e2e/accessibility.spec.ts`; run production-smoke.spec.ts only against the explicit approved target.
- `npm run check:bundle` inspects public route output for scanner code and server secrets; performance budgets are agreed and recorded during validation.
- Data Verification: inspect controlled journey records, immutable audit/parcel events, roles, fee snapshots and notification ownership after refresh/re-login.
- `npm run data:backup` / `npm run data:restore -- --target isolated-test` are proposed guarded scripts; verify restoration without exposing personal data or overwriting production.
- Manual Test: actual phone camera, USB scanner, email delivery, source fidelity, screen reader basics and owner receive/pickup workflow.
- Cost gate: record recurring cost as zero only for the selected configuration inside current free quotas, excluding already-owned hardware and optional custom domain; report any unmet requirement.

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Complete staging browser-to-database journey | Hybrid | AC-03, AC-04, AC-06, AC-07 |
| Source acceptance and responsive/accessibility matrix | Hybrid | AC-01, AC-02, AC-10, AC-12 |
| Deployed isolation, secrets and private-cache checks | Hybrid | AC-05, AC-11 |
| Real scanner and email delivery matrix | Hybrid | AC-04, AC-08 |
| Backup restore and app rollback rehearsal | Hybrid | AC-11 |
| Commercial terms, free quotas and runtime compatibility | Agent-Probe | AC-11, AC-12 |
| Business policy, content and enabled integration review | Hybrid | AC-09, AC-12 |

Evidence destination: the phase-named `*_REPORT_20-09-26.md` inside this same task folder. Include command/target/date, result and evidence paths; reports and screenshots must exclude secrets and unnecessary personal data.

## Test Infra Improvement Notes

Current repository has no CI or deploy target. Prefer local free verification and eligible free CI quotas. Establish reproducible seed/cleanup and target guards; known device/provider gaps remain launch blockers rather than simulated passes.

## Resume and Execution Handoff

- Selected plan file: `process/features/website/active/website_20-09-26/04-launch-verification_PLAN_20-09-26.md`.
- Last completed phase or step: reference analysis and draft planning only.
- Validate-contract status: pending; no executable contract exists.
- Supporting context files loaded: umbrella and design-review.md; global generate-plan skill; context/test routers currently absent.
- Next step for a fresh agent: reread latest umbrella/user decisions, inspect actual repository state, resolve this phase's dependencies, then validate the exact selected plan.
- Ownership: phase scope only; do not overwrite concurrent changes or touch other phase artifacts without coordination.

## Validate Contract

(placeholder - vc-validate-agent writes this section before EXECUTE; current document is a reviewable draft only)

## Next Step

Review the whole-app PDF first. Resolve hosting/cost feasibility before implementation architecture is locked; after Phases 1-3, validate this phase and prepare a reviewable launch candidate without paid provisioning.
