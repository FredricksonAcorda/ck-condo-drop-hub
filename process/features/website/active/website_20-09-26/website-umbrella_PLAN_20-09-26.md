---
name: plan:website-umbrella
description: Responsive CK Condo Drop Hub website and secure customer/admin parcel application
date: 20-09-26
feature: website
phase: umbrella
---
# CK Condo Drop Hub — website project plan

**Date**: 20 September 2026
**Status**: PLANNED — reviewable proposal; implementation has not started
**Complexity**: Complex, four dependent delivery phases

## Overview

Implement the client's exact visual direction as a responsive public website, customer portal and admin workspace. Preserve the supplied branding, typography treatment, color, layout hierarchy and content order. Deliver working registration, authentication, profiles, protected customer management, audit logs, and barcode-assisted record lookup and parcel operations. Treat the desktop compositions as the visual authority and derive accessible mobile layouts without reducing the entire desktop UI to fit.

Read [Design review](design-review.md) for the complete source inventory, layout rules, assets and conflicts. This document contains the consolidated requirements for review; no prior locked SPEC or approved architecture exists. Technical choices below are recommendations, not previously approved decisions.

Client deliverable: [16-page reviewed whole-app PDF](../../../../../output/pdf/CK-Condo-Drop-Hub-Website-Plan.pdf), created 20 September 2026. Planning is complete; per-phase executable contracts remain pending.

Quick links: [Scope](#scope-and-functional-requirements) · [Architecture](#architecture-and-security) · [Data](#data-model) · [Phases](#program-status-table) · [Acceptance](#acceptance-criteria) · [Open decisions](#open-decisions-and-assumptions).

## Context Envelope

| # | Field | Value |
|---|---|---|
| 1 | feature | website |
| 2 | phase | PLAN |
| 3 | session-goal | Review client layouts and save a concrete website project plan; no persistent goal was requested |
| 4 | branch | None — directory is not a Git repository |
| 5 | worktree | C:/Edrick/Projects/VS Code Project/CK Condo Drop Hub |
| 6 | context-group | None at review time |
| 7 | blast-radius-packages | Proposed app, UI, server services, collection/index changes, tests |
| 8 | active-plan | process/features/website/active/website_20-09-26/website-umbrella_PLAN_20-09-26.md |
| 9 | test-runner | None installed; proposed Vitest and Playwright |
| 10 | validate-contract | Pending per-phase validation before execution |

Current repository: four JPG layouts, seven PNG assets and one WEBP logo. No source code, manifest, database, test infrastructure or existing plan. `process/context/all-context.md` and `process/context/tests/all-tests.md` do not exist. Ancestor `C:/Edrick/Projects/AGENTS.md` supplies workflow conventions. The setup skill's detection found no project manifest or local harness; installation/bootstrap is a future foundation dependency, not a reason to withhold this requested plan. No harness installer was run and no application scaffolding was created.

## Open Decisions and Assumptions

The user confirmed the full application and both customer/parcel barcode types. They requested the whole-app PDF first, free tools with no recurring paid service, and prefer Vercel. Technical choices below are proposals for review; implementation has not begun.

| Decision | Working assumption | When it must be resolved |
|---|---|---|
| Delivery scope | CONFIRMED full application; responsive UI first | PDF plan review precedes implementation |
| Stack | Next.js App Router, React, TypeScript, Tailwind CSS, Firebase Spark Auth/Firestore | Validate Netlify runtime and packages before installation |
| Scans | Both parcel tracking codes and customer ID codes, separate modes | Before scanner contracts and printed code production |
| Roles | Customer and admin; optional staff role requires a separate permission decision | Before Firestore deny-rule migrations |
| Hub scope | One condo hub, English UI, PHP currency, Asia/Manila display timezone | Before data model migrations |
| Membership | Manual admin assignment/renewal with audit history; no checkout | Before membership UI is connected |
| Notifications | In-app events; authentication emails required; business SMS/email optional later | Before operational launch |
| Delivery/claimants | Request and management screens planned; identity/fulfillment rules need business confirmation | Before enabling pickup by others or delivery completion |
| Fonts/assets | Confirm original fonts and clean assets; candidates must be compared before acceptance | Before claiming visual fidelity |
| Business content | Prices, fee rules, hours, phone and address in artwork are reference content | Before publication or financial calculation |
| Hosting | Netlify Free proposed; local Firebase emulators for routine testing and controlled staging | Vercel Hobby is non-commercial only; review alternative before implementation |

Missing decisions do not prevent reviewing the UI or this plan. They prevent treating a prototype, placeholder font or assumed business rule as production-approved.

Proposed Netlify Free plus Firebase Spark can meet low-usage commercial launch needs inside current quotas. Netlify Free permits commercial projects, provides 300 monthly credits, and stops at the free limit without recharge. See [Netlify Free](https://www.netlify.com/blog/introducing-netlify-free-plan/), [credit plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) and [Next.js runtime support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/). [Vercel Hobby](https://vercel.com/docs/plans/hobby) cannot satisfy free commercial hosting as requested. Vercel remains the user's preference, with this conflict explicitly pending review.

Use Firebase Spark without billing upgrade: no Firebase Cloud Functions, App Hosting, paid Storage, phone auth/SMS or paid managed backups. Next.js server handlers run on Netlify. Built-in Firebase verification/reset emails avoid a custom SMTP/domain service. Validate [Firebase pricing](https://firebase.google.com/pricing), [auth/email limits](https://firebase.google.com/docs/auth/limits) and [Firestore quotas](https://firebase.google.com/docs/firestore/pricing). A free subdomain avoids optional domain fees. Zero recurring paid service is limited by quotas and does not mean unlimited capacity, no outages or no owner maintenance.

## Scope and Functional Requirements

| Area | Must deliver | Boundary |
|---|---|---|
| Public website | All homepage sections; anchor navigation for About/Services/Pricing/How It Works/Contact; Login/Sign Up; FAQ/help and contact details | No unrelated marketing redesign |
| Accounts | Registration, email verification, login/logout, refresh/expiry handling, password recovery/reset, change password, own profile/preferences | Passwords handled by auth provider; never stored in profiles |
| Customer portal | Dashboard, My Parcels, parcel detail/history, authenticated tracking, My Account tabs, membership summary, in-app notifications | Track hub events; no unimplemented courier-network tracking claims |
| Admin accounts | Indexed prefix search by selected name/customer code/mobile/unit; view, create pending enrollment, edit and deactivate/reactivate; view account/parcel logs | Verified normal registration claims pending enrollment; no custom invite email or plaintext password |
| Parcel operations | Receive for selected customer and courier; verify scanned parcel belongs to selected customer; confirm pickup; lists, filters, counts and history | Code alone is not proof of claimant identity |
| Scanner | Branded camera interface plus USB keyboard-wedge input and manual entry; customer/parcel lookup with deliberate update | Neither scan mode automatically mutates records |
| Membership | Display plan/expiry/benefits; submit plan/renewal request; admin records approved membership | Payment logos informational until a provider is integrated; no fake paid status |
| Additional visible links | Help/contact, membership requests, basic reports/counts, admin settings, notifications, announcements | Specify every link destination; no silent dead buttons |
| Delivery and claimants | Customer delivery request and authorized-claimant management; staff queues if enabled | Separate identity, eligibility, quota and fulfillment rules required before activation |
| Subscription form | Store consented subscription request, deduplicate, explain confirmation/status | No marketing email sending until provider and unsubscribe flow are implemented |

Later extensions: online payment gateway and refunds, SMS/business email delivery, live courier APIs, advanced analytics/exports, multi-hub tenancy, offline mutation queues, native apps and remittance transactions. Preserve visible service marketing; do not imply these services are online transactions.

## Route and Component Map

| Routes | Layout / main components |
|---|---|
| `/`, `/help`, `/contact` | PublicShell, PublicHeader, Hero, CourierStrip, Services, HowItWorks, Pricing, WhyChooseUs, CommunityBanner, Announcements, PublicFooter |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/callback` | AuthShell, accessible forms and provider callback |
| `/dashboard`, `/parcels`, `/parcels/[id]`, `/track` | CustomerShell, Header, AccountSidebar, ParcelTable/ParcelCard, StatusBadge, detail timeline |
| `/account`, `/membership`, `/notifications` | AccountForm, PasswordForm, NotificationPreferences, MembershipSummary |
| `/delivery-requests`, `/claimants` | Derived screens, gated by confirmed operating rules |
| `/admin`, `/admin/receive`, `/admin/pickup`, `/admin/parcels` | AdminShell, AdminSidebar, StatCard, ReceiveForm, PickupVerification, RecentParcels |
| `/admin/customers`, `/admin/customers/[id]`, `/admin/logs` | CustomerSearchTable, ProfileEditor, DeactivationDialog, AuditLogTable |
| `/admin/reports`, `/admin/notifications`, `/admin/settings` | Basic operational summaries, notification list, permitted business settings |

Shared primitives: branded button variants, input/select/checkbox, field errors, tabs, drawer/dialog, toast/live region, pagination, empty/error/skeleton states. Public, customer and admin shells remain distinct compositions. Use semantic HTML and shared data views for tables/cards; no whole-page screenshot implementation.

## Architecture and Security

Proposed architecture: one Next.js application on Netlify Free, with small client components for forms/navigation/scanning. Firebase Spark supplies Authentication and Firestore. Next.js route handlers call Firebase Admin SDK; no Firebase paid function service is required. Pin versions only after actual Netlify/runtime/SDK compatibility is proven.

Client Firebase login exchanges a recent ID token through CSRF-protected POST /api/auth/session for an HttpOnly Secure SameSite session cookie; clear client auth persistence after exchange. Every protected request verifies the cookie with revocation checks and reads current active role. Follow [Firebase sessions](https://firebase.google.com/docs/auth/admin/manage-cookies). Private responses never enter shared caches; logout clears cookies and deactivation revokes tokens and blocks every protected operation.

Firestore rules deny every direct browser/client read and write, including admin users. Admin SDK bypasses these rules, so server services must enforce identity, active status, role, ownership, allowlists and version on every operation. Deny rules cannot secure an unsafe server route. Test both server access isolation and direct-client denial independently.

Admin account creation stores pending enrollment with a deterministic email reservation. A normal Firebase registration verifies email and claims the pending profile transactionally; never link an unverified email. Share the ordinary registration URL; no custom invite-email provider is assumed. Exact pending-profile/UID mapping is a validation gate. Admin search uses selectable indexed prefix fields and cursors; no paid full-text engine or unrestricted customer download.

Customer permissions: read/write allowlisted own profile/preferences; read own parcels/events/membership; manage own notification read state and approved claimant/request fields. Admin: account and parcel management, operational summaries, read audit logs. Public signup cannot set role, customer code, membership status or account activation state. Store roles in protected records, not editable signup metadata. Provision initial admin using a reviewed server-side operation; no public role-management endpoint in initial scope.

Validate role and active-account state on every protected operation. Deactivation blocks new operations even with an old session; revoke sessions where provider supports it. Prevent removal of the last active administrator. Password/email changes require appropriate reauthentication/provider verification. Recovery responses do not disclose whether an email exists. Apply rate limits to auth, search and scans; restrict callback URLs; use secure cookie settings and origin/CSRF protections appropriate to the selected endpoints. Service secrets remain server-only. Avoid exposing personal information in client errors, URLs, analytics or logs.

Profile edits use field allowlists and version checks. Audit events are append-only from trusted transactions, with actor, action, entity, timestamp, request ID and limited field-level changes; exclude passwords, tokens and unnecessary full addresses. Admin can search/view logs but cannot edit/delete evidence. Privacy/retention and account erasure policies must be settled before launch; initial Delete UI uses explicit deactivation with preserved parcel history.

## Data Model

Firestore collections below are proposed, not created. Claimed accounts use Firebase UID; other entities use stable document IDs. Store UTC timestamps and integer centavos; display Asia/Manila. Firestore has no SQL uniqueness/foreign-key constraints: enforce references and deterministic reservations within server transactions. Treat the table below as collection/document fields, not relational SQL schema.

| Collection | Main fields and invariants |
|---|---|
| profiles | Firebase UID or validated pending-to-claimed mapping; reserved customer_code, full_name, mobile, alternate_mobile, unit, building, address, contact_preference, delivery_preference, marketing_opt_in, status, version, timestamps |
| user_roles | user_id, role; protected from customer updates; initially customer/admin |
| pending_enrollments | normalized-email reservation, pending profile, state, creator, claimed UID; claim only after verified matching email |
| unique_reservations | deterministic hashed customer-code/email/courier-tracking/scan-code keys, entity reference; reserve atomically with entity |
| admin_guards | active-admin count/version; transactionally prevent removal of last admin |
| customer_scan_codes | profile_id, unique opaque lookup_code, revoked_at; no personal data embedded; separate from display code and credentials |
| couriers | id, name, code unique, active |
| membership_plans | code, name, price_centavos, duration_days, free_holding_days, delivery_quota, active, policy_version |
| memberships | customer_id, plan_id, starts_at, expires_at, status, approved_by; snapshot plan terms for history |
| membership_requests | customer_id, requested_plan_id, type, status, reviewed_by, timestamps |
| parcels | customer_id, courier_id, tracking_number text, state, received_at, pickup_deadline, picked_up_at, received_by, picked_up_by, policy snapshot, version; transactional courier/tracking reservation initially |
| parcel_events | parcel_id, type, actor_id, occurred_at, safe event data; append-only |
| audit_logs | actor_id, action, entity_type/id, request_id, safe changes, occurred_at; append-only |
| mutation_requests | actor_id, idempotency_key, operation, request_hash, result; unique actor/key; rejects reused key with different payload |
| notifications | recipient_id, event_id unique per recipient, type, safe payload, read_at, created_at |
| authorized_claimants | customer_id, name, relationship/contact as needed, active; policy-gated |
| delivery_requests | customer_id, parcel_id, address snapshot, requested_at, state; policy-gated |
| newsletter_subscriptions | normalized email, consent timestamp/source, status; separate marketing list access |

Declare composite indexes in firestore.indexes.json for selectable normalized prefix account search, customer/state/date parcels, audit entity/time/actor and unread notifications. Cursor pagination is mandatory. Prefix search is not substring/full-text search. Measure quota cost for indexed count queries; no unbounded scanning/live subscriptions. Confirm tracking reuse before reservation lifetime is finalized. Receive/pickup transact entity, reservation/idempotency, event, audit and notification documents as applicable. Transaction callbacks can retry: perform reads before writes and no external email or other side effect inside callbacks.

Persist parcel state `READY_FOR_PICKUP` or `PICKED_UP` for the core flow. Derive OVERDUE from current time > stored deadline and not picked up, so labels/counts stay consistent without a fragile scheduled status flip. Extensions such as delivered/cancelled require explicit state transitions. Pickup timestamps/actor are immutable through routine editing; corrections append a documented event.

Holding fees need a confirmed clock rule: calendar days versus elapsed 24-hour periods, grace period, holidays, membership expiry during holding, and partial days. Snapshot policy at receipt so later plan edits cannot silently change existing deadlines. Do not activate fees until examples at the boundary are agreed.

## Public Contracts

Use same-origin route handlers for the following proposed API; auth forms call supported provider/server wrappers. Requests validate typed schemas; responses return `{data}` or `{error: {code, message, fieldErrors?, requestId}}`. Use 401 unauthenticated, 403 forbidden/inactive, 404 inaccessible or missing entity, 409 conflict/duplicate/version mismatch, 422 invalid input, 429 throttled, 503 unavailable. No sensitive payloads in errors.

| Contract | Access / behavior |
|---|---|
| GET/PATCH `/api/me` | Verified customer; own allowlisted fields; PATCH requires expectedVersion |
| GET/POST `/api/admin/customers` | Admin indexed prefix search / idempotent pending enrollment |
| GET/PATCH `/api/admin/customers/[id]` | Admin view/update allowlist; expectedVersion; audit |
| POST `/api/admin/customers/[id]/deactivate` or `/reactivate` | Admin with reason; revoke/deny sessions; audit |
| GET `/api/admin/logs` | Admin, bounded filters/cursor; immutable results |
| POST `/api/admin/lookup` | `{kind: customer|parcel, code, courierId?}`; authorized result only; ambiguity requires courier selection |
| GET `/api/parcels` and `/api/parcels/[id]` | Customer-owned results; admin queries use admin service scope |
| POST `/api/admin/parcels/receive` | `{customerId,courierId,trackingNumber,idempotencyKey}`; create + event + audit + in-app notification atomically |
| POST `/api/admin/parcels/[id]/pickup` | `{customerId,expectedVersion,idempotencyKey,claimantConfirmation}`; verify ownership/state, update + event + audit atomically |
| GET `/api/admin/summary` | Derived counts from same rules as lists; no static screenshot numbers |

Membership/claimant/delivery/settings routes are designed within their phase once business rules are resolved; they follow the same auth, validation, version and audit conventions. No unauthenticated name/address lookup by tracking code.

## Scanner Contract

Provide Camera, USB Scanner and Manual Entry controls styled to match the source. Prefer the lower-level `Html5Qrcode` class for custom UI; lazy-load it only when needed. Its API supports starting/stopping cameras and custom interfaces ([official guide](https://scanapp.org/html5-qrcode-docs/docs/intro)). Select supported symbologies after testing actual client labels; initial candidates include Code 128 and QR, not an unverified promise of every courier format. Evaluate QuaggaJS/maintained alternatives only if sample-label testing proves a gap; do not ship multiple engines by default.

Camera begins only after a user gesture on HTTPS and requires browser permission ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)). Prefer rear camera with a selectable fallback. Stop tracks on success/close/navigation/background as appropriate, release resources, restore focus. Handle denied/revoked permission, no camera, busy camera, unreadable label and unsupported format with manual entry. Frames are processed locally and not stored/uploaded by default.

USB HID scanners in keyboard mode enter text into the focused scan field. Optional buffer listening is active only in explicitly armed scanner mode, never globally stealing input. Support configured Enter/Tab terminator; clear partial buffers on blur/timeout/mode change; ignore composition/modifier events. Preserve leading zeros and meaningful case/punctuation. Timing is a configurable aid, not proof that input came from a scanner. Validate length/control characters on client and server; never navigate to a scanned URL or execute its contents.

Common state flow: idle → capturing → validating → looking up → found/not-found/ambiguous/error → explicit action confirmation → saving → success/conflict. Pause repeated camera callbacks while a result is open. Display who/what will be changed. Reject customer/parcel mismatch. Rate-limit and deduplicate scans; transaction idempotency and transactional reservation documents protect writes even when client debounce fails. Two staff members attempting the same pickup must produce one transition and one logical event.

## Program Status Table

| Phase | Plan | Dependencies | Status / proof boundary |
|---|---|---|---|
| 1 | [Responsive UI](01-responsive-ui_PLAN_20-09-26.md) | Source/asset decisions | PLANNED — visual/interaction prototype, no production security claim |
| 2 | [Accounts and admin](02-accounts-admin_PLAN_20-09-26.md) | Phase 1 | PLANNED — real isolated accounts and audited account management |
| 3 | [Parcels and scanning](03-parcels-scanning_PLAN_20-09-26.md) | Phase 2; policy and device samples | PLANNED — persisted parcel flow with verified scanner hardware |
| 4 | [Launch verification](04-launch-verification_PLAN_20-09-26.md) | Phases 1–3; deployment inputs | PLANNED — integrated staging evidence and release readiness |

## Phase Completion Rules

PLANNED means unstarted; CODE DONE means implementation exists; TESTING means verification is underway; VERIFIED requires integration/manual/error checks, persisted-state evidence where applicable, and user confirmation; BLOCKED means an explicit unresolved dependency. Build success alone is not completion. Store each phase's report beside its plan; never fabricate evidence or mark a hardware test passed from a mocked browser event.

Before each phase: read its plan and prior report, inspect actual runtime/dependency state, resolve its blocking decisions and write a Validate Contract. Then implement, run scoped tests, record manual/database evidence and present what is functional and what remains. Existing user authorization governs routine continuation; obtain new decisions for material scope or business changes. Reviewable planning is complete independently of subsequent implementation authorization.

## Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | All four source compositions reproduced with documented font/asset fidelity; client accepts desktop comparison |
| AC-02 | Main pages/actions work from 320 to 1920px and intermediate widths; no page overflow or inaccessible fields/actions |
| AC-03 | Public navigation, auth and every enabled visible CTA have correct functional destinations and honest states |
| AC-04 | Register/verify/login/recovery/reset/logout/session expiry work; account A cannot access account B |
| AC-05 | Customer cannot invoke admin APIs, alter roles or bypass deactivation; server ownership/role checks and deny-all direct-client Firestore rules are exercised |
| AC-06 | Admin pending enrollment/search/view/edit/deactivate/reactivate works with pagination, validation, conflict handling and immutable audit |
| AC-07 | Receive → customer list/notification → verify → pickup → history/counts works with persisted data and no duplicate transition |
| AC-08 | Customer and parcel scans are separate; real camera/HID/manual paths work; bad/duplicate/mismatched scans are safe |
| AC-09 | Membership/deadlines/fees reflect agreed rules and current data; unresolved integrations never show false success |
| AC-10 | Keyboard, labels, focus, dialogs, contrast, status announcements and zoom checks pass; mobile target controls are usable |
| AC-11 | Staging has passing build/type/lint/scoped tests, protected secrets, restore/rollback evidence and no unresolved critical flow defects |
| AC-12 | Production content, original assets or accepted substitutes, business rules and enabled integrations are recorded and reviewed |

## Touchpoints

Read-only: `Website Layout/*`, root images, ancestor instructions. Proposed new implementation: `src/app/`, `src/components/`, `src/features/`, `src/lib/`, `public/brand/`, `public/images/`, `scripts/data/`, `tests/`, root package/config and deployment files. Planning writes are confined to this task folder. No external service was modified.

## Blast Radius

Greenfield project; likely dozens of files, final count established per phase. Visual foundation is reversible and low risk. Auth/RBAC, profile data, schema changes and transaction/audit integrity are high-risk surfaces requiring negative tests and database evidence. Online billing remains outside the default launch scope.

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Desktop reference comparison and client review | Hybrid | AC-01, AC-12 |
| Responsive viewport, overflow and keyboard checks | Hybrid | AC-02, AC-03, AC-10 |
| Two-user isolation, forbidden role changes and inactive sessions | Fully-Automated | AC-04, AC-05 |
| Customer CRUD/invitation and audit integration | Fully-Automated | AC-06 |
| Receive/pickup concurrency and idempotency | Fully-Automated | AC-07 |
| Physical camera/HID label tests | Hybrid | AC-08 |
| Membership/fee boundary fixtures plus business review | Hybrid | AC-09, AC-12 |
| Staging browser-to-database workflow and restore rehearsal | Hybrid | AC-11 |

## Test Infra Improvement Notes

No test tooling exists. Phase 1 establishes Vitest, Playwright and meaningful scripts; Phase 2 adds disposable database/auth fixtures and Firestore deny-rule tests. Physical cameras/HID devices and recovery-email delivery cannot be fully proven by mocked tests. Record device/browser/version and outstanding known gaps. Do not add redundant implementation-mirroring tests.

## Risks, Operations and Change Management

Main schedule risks: missing fonts/clean imagery, uncertain membership/claimant rules, actual scanner hardware and service access. Resolve assets before extensive CSS tuning, business rules before schema lock, and hardware feasibility before scanner rollout. Avoid inventing a fixed delivery date before these dependencies are known.

Use local Firebase Auth/Firestore emulators, controlled staging and isolated production with synthetic demo accounts. Version collection/index changes and configure action URLs, built-in email delivery and server secrets. Rehearse local encrypted Admin SDK JSON backup/restore without paid managed backup/export, preserving IDs/types/references and documenting capture consistency/read-write quota costs. Rehearse application rollback with backward-compatible data changes; app rollback cannot recover deleted records. Record minimal safe request diagnostics, retention and owner maintenance.

For changes, record requirement, reason, affected ACs/routes/schema, risk, verification and dependency impact in this plan and the active phase. New payment providers, staff permissions or multi-hub scope require explicit revised contracts. Do not silently fold them into visual work.

## Current Execution State

All phases PLANNED. Only layout review and planning artifacts exist. No tests of the application have run because no application exists. Plan artifact validation is separate from the substantive per-phase Validate Contract.

## Resume and Execution Handoff

- Selected plan: `process/features/website/active/website_20-09-26/website-umbrella_PLAN_20-09-26.md`.
- Last completed step: visual source review and reviewable project planning.
- Validate-contract status: pending; all direct plans have placeholders.
- Supporting context: `design-review.md`, four source JPGs, eight root assets, ancestor AGENTS.md, context-discovery/planning/frontend-design skills; no pre-existing context router.
- Next step: review decisions, then validate [Phase 1](01-responsive-ui_PLAN_20-09-26.md) against confirmed assets and stack before implementing the responsive UI.

## Validate Contract

Planning does not constitute execution validation. Each direct phase requires its own non-placeholder contract before code begins.

## Next Step

Review the whole-app PDF first, including proposed Netlify/Firebase and the free-commercial Vercel conflict. After review, validate Phase 1 as the single execution anchor. No implementation, paid provisioning or deployment is authorized by this draft.
