# Phase 2 - Secure accounts and customer administration

**Date**: 20 September 2026
**Status**: PLANNED - reviewable draft; no implementation started
**Complexity**: Complex - authentication, RBAC, profile data and immutable audit

## Overview

Connect the approved UI to real customer accounts and protected administration. Implement registration through recovery, own-profile management, admin customer CRUD and audit search. Use free tools within documented service quotas; no paid resources or email delivery commitments are assumed.

Read `website-umbrella_PLAN_20-09-26.md` and `design-review.md` in this folder. Umbrella AC identifiers below are draft requirements, not a locked SPEC.

## Dependencies and Decisions

Requires Phase 1 accepted shells and Netlify Free runtime proof; Firebase Spark built-in verification/reset email limits and actual delivery must be validated. No locked SPEC exists. Initial roles are customer/admin. No Firebase Cloud Functions, App Hosting, Storage or billing upgrade is proposed.

Context check: `process/context/all-context.md` and `process/context/tests/all-tests.md` were absent during planning. Recheck and follow their relevant routes before execution; do not invent installed tooling.

## Touchpoints

- `src/lib/firebase/{client,admin}.ts`, `src/lib/auth/{require-user,require-admin}.ts`: provider sessions and server authorization.
- `src/app/api/auth/session/route.ts`, `src/app/auth/callback/route.ts`, auth page actions, `src/features/accounts/{schemas,service}.ts`: session exchange, action codes and account identity.
- `src/app/api/me/route.ts`, `src/app/api/admin/customers/route.ts`, `src/app/api/admin/customers/[id]/route.ts`: own/admin account APIs.
- `src/app/api/admin/customers/[id]/{deactivate,reactivate}/route.ts`, `src/app/api/admin/logs/route.ts`: account lifecycle and audit views.
- `firestore.rules`, `tests/firestore/accounts.rules.test.ts`, `scripts/bootstrap-admin.mjs`: proposed schema/policies and reviewed admin bootstrap.
- `tests/e2e/{auth,account-profile,admin-customers}.spec.ts`, `tests/integration/{accounts,authorization,audit}.test.ts`, `scripts/test-emulators.mjs`: security and data evidence.

## Public Contracts

- GET/PATCH /api/me accepts only own allowlisted profile fields; PATCH requires expectedVersion. Clients cannot set role, customer code or activation state.
- GET/POST /api/admin/customers provides selectable-field indexed prefix search and idempotent pending enrollment; GET/PATCH /api/admin/customers/[id] is admin-only with version conflict handling.
- POST deactivate/reactivate requires admin role and reason; active status is checked on every protected request, including old sessions.
- GET /api/admin/logs is read-only and paginated; trusted audit append stores actor/action/entity/time/request ID without passwords, tokens or unnecessary personal data.
- Responses follow umbrella {data} / {error:{code,message,fieldErrors?,requestId}}; 401/403/404/409/422/429/503 semantics are consistent.
- Deny every direct Firestore client read/write. Admin SDK bypasses rules: server services explicitly verify current role/active state/ownership for every request. Signup metadata cannot promote a user; initial admin bootstrap is reviewed.

## Blast Radius

Approximately 30-50 app/test files plus accounts collection/rule setup and provider configuration; high risk for authentication, authorization, personal data and schema. Use isolated test data; never migrate or seed production during draft planning.

## Implementation Checklist

- [ ] Confirm profile allowlist, deactivation/erasure, audit retention, pending enrollment wording and transactional last-admin protection.
- [ ] Validate selected hosting runtime supports provider cookie sessions, secure server secrets, callback redirects and no shared cache of private responses.
- [ ] Configure isolated local/test auth and database fixtures; record free project quotas and whether separate remote staging consumes available allowance.
- [ ] Create profiles/user_roles/audit collections, deterministic email/customer-code reservations and an admin-count guard; transactions enforce uniqueness, versions and safe audit; deny all direct client access.
- [ ] Verify Firebase Admin session cookies with revocation checks and current active role on every protected operation; enforce ownership explicitly because Admin SDK bypasses rules.
- [ ] Implement Firebase register/verification/recovery, sign-in and CSRF-protected recent-ID-token exchange for HttpOnly Secure SameSite cookie; clear client persistence, handle logout, password changes and expiry.
- [ ] Validate recovery redirects and generic recovery responses; add appropriate rate limits and origin/CSRF controls.
- [ ] Implement own-profile editing with server validation, normalization, version checks and audit field redaction.
- [ ] Implement admin cursor pagination/selectable prefix search/view/pending enrollment/edit/deactivate/reactivate; deny inactive sessions and revoke tokens.
- [ ] Pending enrollment reserves normalized email; verified normal registration claims its profile transactionally. Share ordinary registration URL, with no custom invite mail transport or unverified email linking.
- [ ] Prevent last-active-admin removal through a transactionally guarded count; initial admin provisioning is a reviewed one-time server operation.
- [ ] Append audit in the Firestore account transaction; callback retries have no external side effects. Deny client audit access and provide no server audit edit/delete route.
- [ ] Implement admin logs with bounded filtering; prevent names, addresses, recovery links and auth secrets entering browser diagnostics.
- [ ] Prove customer A/B ownership isolation through server APIs; independently assert all direct Firestore SDK reads/writes are denied for customers and admins.
- [ ] Exercise enrollment-claim and verification/recovery email failure without false completion; concurrent edits preserve newer data.
- [ ] Replace Phase 1 account fixtures only after real loading/error/empty paths are connected and verified.

## Acceptance Criteria

AC-04, AC-05 and AC-06 are this phase's Acceptance Criteria; AC-03/AC-10 remain regression constraints. Passing mocked auth tests cannot substitute for Firestore deny-rule and real delivery evidence.

All checked items require observed evidence. Reference fixtures, mocked services and planned commands are not evidence of production functionality.

## Phase Completion Rules

- [ ] Phase-specific research and unresolved decisions are reconciled with the umbrella.
- [ ] Validate Contract is written and implementation is authorized for this exact phase.
- [ ] Checklist is implemented; applicable automated checks pass and manual/data evidence is recorded.
- [ ] Report identifies deviations, known gaps and next phase dependency readiness.
Use PLANNED until execution begins, CODE DONE when code exists without full proof, and VERIFIED only after required evidence and user-confirmed working acceptance. Never mark completed just because draft validation passes.

## Test Procedure and Data Verification

- `npm run typecheck`, `npm run lint`, `npm run build`; run scoped `npm run test -- tests/integration/accounts.test.ts tests/integration/authorization.test.ts tests/integration/audit.test.ts`.
- `npm run test:emulators -- accounts` invokes proposed scripts/test-emulators.mjs against an explicitly isolated local database; it must reject production targets.
- `npm run test:e2e -- tests/e2e/auth.spec.ts tests/e2e/account-profile.spec.ts tests/e2e/admin-customers.spec.ts` covers verified customer/admin sessions.
- Data Verification: inspect two synthetic customers, an admin and inactive user; confirm one own profile per user, protected roles, correct version increments and exactly one safe audit event per successful edit.
- Manual Test: receive actual Firebase built-in verification/recovery emails; check expiry/reuse and generic recovery responses. Emulator mail is not production delivery proof; custom invitation email is not part of this approach.
- Probe unauthenticated, forged role, foreign ID, expired session, direct SDK access, inactive old session, duplicate enrollment and stale-version requests.

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Auth lifecycle and recovery delivery | Hybrid | AC-04 |
| Two-user isolation and forbidden role mutation | Fully-Automated | AC-04, AC-05 |
| Inactive old-session denial and last-admin guard | Fully-Automated | AC-05 |
| Admin CRUD, search, pagination, conflicts and audit | Fully-Automated | AC-06 |
| Secrets, callback and private-cache inspection | Hybrid | AC-11 |

Evidence destination: the phase-named `*_REPORT_20-09-26.md` inside this same task folder. Include command/target/date, result and evidence paths; reports and screenshots must exclude secrets and unnecessary personal data.

## Test Infra Improvement Notes

No database harness exists. Add reproducible auth fixtures, direct Firestore deny-rule tests and production-target guards. Separate browser tests from provider delivery probes to identify the exact missing proof.

## Resume and Execution Handoff

- Selected plan file: `process/features/website/active/website_20-09-26/02-accounts-admin_PLAN_20-09-26.md`.
- Last completed phase or step: reference analysis and draft planning only.
- Validate-contract status: pending; no executable contract exists.
- Supporting context files loaded: umbrella and design-review.md; global generate-plan skill; context/test routers currently absent.
- Next step for a fresh agent: reread latest umbrella/user decisions, inspect actual repository state, resolve this phase's dependencies, then validate the exact selected plan.
- Ownership: phase scope only; do not overwrite concurrent changes or touch other phase artifacts without coordination.

## Validate Contract

(placeholder - vc-validate-agent writes this section before EXECUTE; current document is a reviewable draft only)

## Next Step

After Phase 1 evidence, settle provider email and role/data decisions; validate this exact draft before any accounts collection/rule setup or live provider configuration.
