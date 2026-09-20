# Phase 3 - Parcel operations and both barcode workflows

**Date**: 20 September 2026
**Status**: PLANNED - reviewable draft; no implementation started
**Complexity**: Complex - device integration, transactional parcel state and business policy

## Overview

Deliver customer-code lookup and parcel-tracking lookup as separate modes, supporting camera, USB keyboard-wedge scanner and manual entry. Connect receive, notification, verify, pickup and history to persisted records. Barcode lookup alone never authorizes a pickup or changes an account.

Read `website-umbrella_PLAN_20-09-26.md` and `design-review.md` in this folder. Umbrella AC identifiers below are draft requirements, not a locked SPEC.

## Dependencies and Decisions

Requires Phase 2 verified auth/Firestore deny-rule/admin guards; actual courier barcode labels, USB hardware and supported phones; confirmed holding/membership/claimant policies. Proposed Html5Qrcode custom UI is subject to sample-label testing; do not install multiple scan engines without evidence.

Context check: `process/context/all-context.md` and `process/context/tests/all-tests.md` were absent during planning. Recheck and follow their relevant routes before execution; do not invent installed tooling.

## Touchpoints

- `src/features/scanning/{ScannerDialog,ScanInput}.tsx`, `src/features/scanning/{scanner-state,hid-buffer,normalize-code}.ts`: unified capture and safe parsing.
- `src/features/parcels/{service,schemas,policy}.ts`, `src/features/membership/service.ts`: transactional rules and approved plan requests.
- `src/app/api/admin/lookup/route.ts`, `src/app/api/admin/parcels/receive/route.ts`, `src/app/api/admin/parcels/[id]/pickup/route.ts`: lookup and mutations.
- `src/app/api/parcels/route.ts`, `src/app/api/parcels/[id]/route.ts`, `src/app/api/admin/summary/route.ts`: ownership-scoped customer lists and admin counts.
- `firestore.indexes.json`, `tests/firestore/parcels.rules.test.ts`: customer scan codes, couriers, parcels/events, requests, policies, notifications and idempotency.
- `tests/unit/{hid-buffer,parcel-policy}.test.ts`, `tests/integration/{parcel-transactions,scan-lookup}.test.ts`, `tests/e2e/{parcel-flow,scanner}.spec.ts`: proposed automated evidence.

## Public Contracts

- POST /api/admin/lookup accepts {kind:customer|parcel,code,courierId?}; customer scan codes are opaque revocable identifiers, not credentials or embedded personal data.
- Receive accepts {customerId,courierId,trackingNumber,idempotencyKey}; create parcel, event, audit and in-app notification atomically.
- Pickup accepts {customerId,expectedVersion,idempotencyKey,claimantConfirmation}; server verifies customer, state, actor permission and current version before one transition.
- Preserve tracking leading zeros, meaningful punctuation and case; reject control characters/oversize codes and never navigate to scanned URLs.
- Core states are READY_FOR_PICKUP/PICKED_UP; overdue derives from stored deadline and current time. Store UTC, display Asia/Manila, money in integer centavos.
- Deterministic courier/tracking reservation and actor/idempotency documents prevent duplicates; reused key with changed payload fails. Policy snapshots protect historical deadlines from later edits.

## Blast Radius

Approximately 35-60 app/test files and one parcel collection/index setup; high integrity, authorization and operational risk. Scanner engine stays lazy-loaded; no camera frame upload/storage and no fee charging/payment gateway integration.

## Implementation Checklist

- [ ] Confirm both barcode use cases: customer mode selects the account; parcel mode looks up a tracking record under courier/customer context.
- [ ] Collect representative damaged/small/long labels and real camera/HID samples; document supported symbologies based on results, not library marketing.
- [ ] Resolve sample pricing/deadline inconsistency, clock/grace/rounding rules and tracking reuse policy; retain versioned policy examples.
- [ ] Create parcel, courier, membership/policy, notification, event, idempotency and scan-code collections/indexes; deny direct clients and enforce server authorization/ownership.
- [ ] Implement Firestore receive/pickup transactions with deterministic tracking/idempotency reservation documents and version checks. Callbacks can retry: read before writes and perform no external side effects inside them.
- [ ] Connect customer list/detail/history/tracking and admin counts to identical persisted state/deadline rules.
- [ ] Build branded scanner dialog and explicit Camera/USB/Manual controls; choose kind before lookup and show selected customer.
- [ ] Start camera only on user gesture over HTTPS; rear-camera preference is optional, with selectable fallback.
- [ ] Stop capture on success, close, route exit and lifecycle changes; release tracks, return focus, handle denied/revoked/busy/no-camera cases.
- [ ] Arm HID buffering only in the focused scan workflow; support configured Enter/Tab terminator and clear on blur, timeout or mode change.
- [ ] Ignore composition/modifier events; do not steal typing from other fields or use timing as scanner identity proof.
- [ ] Pause repeated scan callbacks while results are open; show not-found/ambiguous/mismatch/conflict states with manual correction.
- [ ] Require explicit receive/pickup confirmation, and apply server validation/rate limiting regardless of frontend debounce.
- [ ] Connect membership request/manual approval and in-app notifications; no paid status or SMS/email claim without real integration.
- [ ] Implement delivery/authorized-claimant flows only after operating rules are settled; otherwise keep explicitly unavailable states with clear destinations.
- [ ] Prove account-code revocation and customer/parcel mismatch handling, and test two admins picking up the same parcel concurrently.

## Acceptance Criteria

AC-07, AC-08 and AC-09 are this phase's Acceptance Criteria. AC-05 authorization, AC-10 accessibility and AC-12 confirmed business policy remain mandatory constraints.

All checked items require observed evidence. Reference fixtures, mocked services and planned commands are not evidence of production functionality.

## Phase Completion Rules

- [ ] Phase-specific research and unresolved decisions are reconciled with the umbrella.
- [ ] Validate Contract is written and implementation is authorized for this exact phase.
- [ ] Checklist is implemented; applicable automated checks pass and manual/data evidence is recorded.
- [ ] Report identifies deviations, known gaps and next phase dependency readiness.
Use PLANNED until execution begins, CODE DONE when code exists without full proof, and VERIFIED only after required evidence and user-confirmed working acceptance. Never mark completed just because draft validation passes.

## Test Procedure and Data Verification

- `npm run test -- tests/unit/hid-buffer.test.ts tests/unit/parcel-policy.test.ts tests/integration/parcel-transactions.test.ts tests/integration/scan-lookup.test.ts`.
- `npm run test:emulators -- parcels` and `npm run test:e2e -- tests/e2e/parcel-flow.spec.ts tests/e2e/scanner.spec.ts` use isolated seeded customers/couriers.
- Data Verification: receive creates one parcel/event/audit/notification; pickup sets one immutable actor/time and appends one logical event; count/history and customer ownership agree after refresh.
- Test same-key retries, changed-payload key reuse, duplicate labels, two-admin race, wrong customer, inactive user and expired membership boundary.
- Manual Test: actual Android/iPhone camera and intended USB scanner on HTTPS; record model, browser, symbology, label condition, lighting and outcome.
- Synthetic keyboard/camera tests cover state transitions only; real hardware evidence is mandatory for camera focus/permissions and scanner configuration.
- Verify manual entry remains usable after every capture failure and that no record changes until explicit confirmation.

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Persisted receive-to-pickup customer/admin journey | Hybrid | AC-07 |
| Race, retry and idempotent event counts | Fully-Automated | AC-07 |
| Separate customer/parcel modes and mismatch | Fully-Automated | AC-08 |
| Real camera/HID/manual label matrix | Hybrid | AC-08 |
| Approved policy boundary fixtures and review | Hybrid | AC-09, AC-12 |
| Accessible capture, feedback and resource release | Hybrid | AC-02, AC-10 |

Evidence destination: the phase-named `*_REPORT_20-09-26.md` inside this same task folder. Include command/target/date, result and evidence paths; reports and screenshots must exclude secrets and unnecessary personal data.

## Test Infra Improvement Notes

Add transaction concurrency fixtures and a device evidence matrix. Browser keyboard simulation cannot establish physical HID compatibility; record device access as a known gap until tested.

## Resume and Execution Handoff

- Selected plan file: `process/features/website/active/website_20-09-26/03-parcels-scanning_PLAN_20-09-26.md`.
- Last completed phase or step: reference analysis and draft planning only.
- Validate-contract status: pending; no executable contract exists.
- Supporting context files loaded: umbrella and design-review.md; global generate-plan skill; context/test routers currently absent.
- Next step for a fresh agent: reread latest umbrella/user decisions, inspect actual repository state, resolve this phase's dependencies, then validate the exact selected plan.
- Ownership: phase scope only; do not overwrite concurrent changes or touch other phase artifacts without coordination.

## Validate Contract

(placeholder - vc-validate-agent writes this section before EXECUTE; current document is a reviewable draft only)

## Next Step

After Phase 2, validate actual labels/devices and business policy examples, then convert this exact draft into a validated execution contract. No barcode printing, migrations or operational launch during planning.
