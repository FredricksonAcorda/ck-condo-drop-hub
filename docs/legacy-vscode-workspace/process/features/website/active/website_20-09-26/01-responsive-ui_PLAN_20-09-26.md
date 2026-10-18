# Phase 1 - Responsive visual foundation

**Date**: 20 September 2026
**Status**: PLANNED - reviewable draft; no implementation started
**Complexity**: Complex - three shells, four reference compositions and derived states

## Overview

Build a reviewable, accessible frontend matching Website Layout before connecting real accounts and operations. Full application delivery and both customer/parcel barcode modes are confirmed; this phase is its visual foundation. User requested a whole-app PDF plan first: this is a draft, not permission to scaffold or deploy.

Read `website-umbrella_PLAN_20-09-26.md` and `design-review.md` in this folder. Umbrella AC identifiers below are draft requirements, not a locked SPEC.

## Dependencies and Decisions

Source review completed; original fonts, clean assets and conflicting production content still need resolution. Proposed Next.js/React/TypeScript/Tailwind stack must pass a runtime compatibility probe against the eventual free commercial host before dependency installation. Firebase Spark integration follows in Phase 2.

Context check: `process/context/all-context.md` and `process/context/tests/all-tests.md` were absent during planning. Recheck and follow their relevant routes before execution; do not invent installed tooling.

## Touchpoints

- `src/app/(public)/page.tsx`, `src/app/(public)/help/page.tsx`, `src/app/(public)/contact/page.tsx`: public pages.
- `src/app/(auth)/{login,register,forgot-password,reset-password}/page.tsx`: proposed auth presentation routes.
- `src/app/(customer)/layout.tsx`, `src/app/(customer)/{dashboard,parcels,account,track,membership,notifications}/page.tsx`: customer shell and screens.
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/{ui,layout}/`, `src/features/{marketing,accounts,parcels,admin}/`: admin shell, reusable components and view models.
- `src/styles/tokens.css`, `public/brand/`, `public/images/`, `tests/fixtures/visual.ts`, `tests/e2e/{visual,responsive,navigation,a11y}.spec.ts`: brand assets and acceptance checks.
- `package.json`, `tsconfig.json`, `playwright.config.ts`, `vitest.config.ts`: proposed foundation configuration; all paths are planned, not existing code.

## Public Contracts

- Preserve source section order, branding, heading treatment, colors and logo lettering; approximate fonts remain explicitly unresolved until accepted.
- Semantic text and controls remain HTML. Images supply artwork only; never embed full interface screenshots as the implementation.
- All enabled navigation has a destination. Prototype actions use explicit demonstration states and must not claim saved data, secure authentication or completed payment.
- Use typed presentation models for customer, parcel, membership and admin summaries so Phase 2/3 replaces fixtures without changing page composition.
- Share status and field semantics between desktop tables and mobile cards; every field and action survives reflow.

## Blast Radius

Approximately 45-75 new files in one proposed app plus test/config/assets; medium visual/accessibility risk. No collection/index change, live account change, paid provisioning or production deployment belongs to this phase.

## Implementation Checklist

- [ ] Record an asset manifest with source filename, intended use, dimensions and unresolved licensing/originals; preserve all originals.
- [ ] Compare condensed heading and body font candidates using reference text; record client-approved substitute if originals remain unavailable.
- [ ] Create a host compatibility proof covering build output, server routes, cookie integration and image serving; record adapter/runtime limits before committing to Next.js.
- [ ] After implementation authorization, bootstrap package scripts, TypeScript and the test baseline using pinned compatible versions.
- [ ] Define calibrated red/black/white/cream/status tokens, spacing, radii, control sizes and accessible focus states.
- [ ] Build PublicShell, CustomerShell and AdminShell to retain their distinct source geometry; implement one accessible compact navigation drawer per shell.
- [ ] Build homepage sections in source order, including curved hero treatment, courier strip, services, steps, pricing, community and footer.
- [ ] Build My Parcels and My Account with deterministic synthetic fixtures matching the 1536x1024 sources.
- [ ] Build admin KPI, receive and pickup presentation with distinct red/black headers and explicit inactive persistence states.
- [ ] Derive missing auth, list/detail, modal and scanner chooser screens using the same system; document which have no supplied reference.
- [ ] Implement homepage grids 5/4 columns to 2 to 1; portal rails move below tasks; account fields 3 to 2 to 1; admin workflows stack.
- [ ] Add loading, empty, validation, permission, expired-session, network and conflict presentations without fake operational success.
- [ ] Verify original 1536x1024 portal compositions and agree a homepage desktop baseline because its export viewport is unknown.
- [ ] Complete keyboard/focus, readable labels, 44px targets, text zoom, reduced motion and long-content checks.
- [ ] Save visual comparison evidence and outstanding variances; do not approve first automated screenshots as proof of source fidelity.

## Acceptance Criteria

AC-01, AC-02, AC-03 and AC-10 are this phase's core Acceptance Criteria; AC-12 asset/content decisions remain visible. Security and persistence are deliberately unverified until later phases.

All checked items require observed evidence. Reference fixtures, mocked services and planned commands are not evidence of production functionality.

## Phase Completion Rules

- [ ] Phase-specific research and unresolved decisions are reconciled with the umbrella.
- [ ] Validate Contract is written and implementation is authorized for this exact phase.
- [ ] Checklist is implemented; applicable automated checks pass and manual/data evidence is recorded.
- [ ] Report identifies deviations, known gaps and next phase dependency readiness.
Use PLANNED until execution begins, CODE DONE when code exists without full proof, and VERIFIED only after required evidence and user-confirmed working acceptance. Never mark completed just because draft validation passes.

## Test Procedure and Data Verification

- `npm run typecheck`, `npm run lint`, `npm run build` are proposed scripts; no command is executable until the authorized scaffold exists.
- `npm run test:e2e -- tests/e2e/visual.spec.ts tests/e2e/responsive.spec.ts tests/e2e/navigation.spec.ts tests/e2e/a11y.spec.ts` checks the four main screens and derived routes.
- Manual comparison uses all four references, overlays and typography/spacing inspection. Test 320, 360, 390, 430, 768, 1024, 1280, 1440, 1536, 1920px and breakpoint-adjacent widths.
- Data Verification: fixture IDs/names remain synthetic; confirm no production credentials, database connections or browser persistence misrepresent a live account.
- Inspect short landscape, 200% text zoom, 320 CSS-pixel reflow, drawer focus restoration, form errors and all enabled CTA destinations.

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| Source layout and asset comparison | Hybrid | AC-01, AC-12 |
| Viewport and long-content reflow | Hybrid | AC-02 |
| Enabled links and honest prototype states | Fully-Automated | AC-03 |
| Keyboard, dialog, labels, focus and contrast | Hybrid | AC-10 |
| Proposed host/runtime build probe | Agent-Probe | AC-11 |

Evidence destination: the phase-named `*_REPORT_20-09-26.md` inside this same task folder. Include command/target/date, result and evidence paths; reports and screenshots must exclude secrets and unnecessary personal data.

## Test Infra Improvement Notes

No runner or application currently exists. Establish only scoped Playwright checks and deterministic visual fixtures; human reference review is required before snapshot baselines are accepted.

## Resume and Execution Handoff

- Selected plan file: `process/features/website/active/website_20-09-26/01-responsive-ui_PLAN_20-09-26.md`.
- Last completed phase or step: reference analysis and draft planning only.
- Validate-contract status: pending; no executable contract exists.
- Supporting context files loaded: umbrella and design-review.md; global generate-plan skill; context/test routers currently absent.
- Next step for a fresh agent: reread latest umbrella/user decisions, inspect actual repository state, resolve this phase's dependencies, then validate the exact selected plan.
- Ownership: phase scope only; do not overwrite concurrent changes or touch other phase artifacts without coordination.

## Validate Contract

(placeholder - vc-validate-agent writes this section before EXECUTE; current document is a reviewable draft only)

## Next Step

Review this draft with the whole-app PDF; resolve font/asset and hosting compatibility decisions, then select this exact phase for validation. No implementation begins from this draft.

