---
name: report:website-design-review
description: Source inventory, visual fidelity requirements, responsive design contract, and unresolved assets
date: 20-09-26
feature: website
---
# CK Condo Drop Hub — design review

All four files in Website Layout were visually inspected. Preserve their design; this is a responsive implementation project, not a rebrand. The additional root images were also inspected. No application, package manifest, test suite, Git repository, prior plans, or project context files existed at review time.

## Source authority and inventory

Base directory: `C:/Edrick/Projects/VS Code Project/CK Condo Drop Hub/`.

| File relative to base | Dimensions | Observed content |
|---|---|---|
| Website Layout/9a2a3427-7c27-4301-a6bf-9a8ad57b8efd.jpg | 736 × 1998 | Full public homepage, downscaled desktop composition |
| Website Layout/798e7f5e-2cba-4f86-885b-773d7f3c6986.jpg | 1536 × 1024 | My Parcels, history, membership rail |
| Website Layout/526a1cd3-d58a-4214-aeb1-d14b945d37aa.jpg | 1536 × 1024 | My Account form, account tabs, membership/help rail |
| Website Layout/6dfffaeb-fda4-4477-82ef-314e324237be.jpg | 1536 × 1024 | Admin dashboard, receive/verify/pickup workflows |
| file_000000003c68820bb5e4f22f571b60b2.png | Larger section artwork | How It Works |
| file_0000000043fc81faa7705f03a946b7f1.png | Larger section artwork | Why Choose Us, woman with parcel and script quotation |
| file_000000004f6881faa30f5e98da5adfe4.png | Larger section artwork | Footer variant with different contact details and hours |
| file_00000000c2bc81f5b81c4b6faeee56f4.png | Larger section artwork | Membership pricing cards |
| file_00000000cb2c81f5ba1d07733ba7d0ec.png | Standalone photo | Exterior shop photograph with left white fade |
| file_00000000eb4081fa831c9d6871dcda48.png | Larger section artwork | Community banner |
| file_00000000f130820bb98f71d20a9b1e11.png | Larger section artwork | Courier logos strip |
| IMG_20260824_133458_807.webp | Portrait image | Logo variant with extensive white margins |

No other project files were found. Ancestor instructions exist at `C:/Edrick/Projects/AGENTS.md`. Automated context discovery failed because this is not a Git repository; manual inventory supplied the evidence instead. `process/context/all-context.md`, development protocols, and existing active/completed plans are absent.

Authority: user instructions → Website Layout compositions → supporting root assets where compatible → documented responsive derivations. Do not silently replace the homepage hero with the exterior photo: these are different scenes. Do not overwrite or move original reference files.

## Desktop structure to reproduce

### Public homepage

Preserve section order: logo/navigation with Login and Sign Up; split hero with large uppercase headline, red emphasis, hub photo and right benefit panel; courier strip; five service cards; four numbered How It Works steps; red membership introduction plus three pricing cards; Why Choose Us photo/list/script composition; dark photographic community banner; three announcement cards; dark footer with logo, links, contacts and subscription form.

Preserve the distinctive red curved hero overlay, red primary buttons, outlined secondary buttons, cream premium card and crown, pale icon circles, and red heading emphasis. Keep content as semantic HTML rather than embedding entire screenshot sections as images.

### Customer shell

At the 1536px reference width: white horizontal header, logo left, navigation centrally, notification/account controls right. Left account sidebar approximately 280px, central workspace flexible, right support rail approximately 320–340px. Outer gutters around 20–24px and inter-column gaps around 16–24px. Reference proportions take priority over these initial estimates.

Sidebar: red customer identity block, black unit/building block, outline navigation icons, pale pink active item and red text, delivery callout. Footer is black with compact brand, location, social and phone blocks. Avoid duplicate focusable navigation when the header and sidebar collapse for smaller screens.

My Parcels: illustrated header; green Ready for Pickup section with count; tracking/courier/arrival/deadline/fee/status/action columns; separate history; informational banners; membership expiry/progress, plan benefits, payment marks; bottom shortcuts. My Account: illustrated heading, Account Details/Change Password/Notifications tabs, personal/address/preferences sections, Save/Cancel, membership summary, quick links and help.

### Admin shell

Approximately 305px black sidebar with stacked white/red logo, red selected item, staff portal panel and diagonal stripe decoration. Main canvas: black/red Admin Dashboard title, account/date controls, four colored KPI cards; red Receive header beside black Pickup header; recent parcels under receive; shortcuts under pickup. Keep receive and pickup actions distinct.

## Visual tokens — initial estimates, not extracted brand specifications

| Token | Starting value / rule |
|---|---|
| Primary red | Approximately #CC0000; calibrate against flat screenshot areas |
| Dark | Approximately #050B09; retain actual black where used in logos |
| Surface / canvas | #FFFFFF / approximately #F7FAF8 |
| Border | Approximately #E6E9E7, usually 1px |
| Selected background | Approximately #FCECE7 |
| Success | Dark green text/icon with pale green background |
| Warning / premium | Orange or gold accents, pale cream panel; red expiry badge |
| Card radius | Approximately 8–12px; inputs/buttons around 4–6px |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64px, adjusted to reference geometry |
| Headings | Heavy, condensed sans-serif; uppercase with selected words red |
| Body | Neutral sans-serif, regular/medium weights |
| Desktop sizes | Heading roughly 30–40px in portal; body 13–16px in reference |
| Responsive control text | At least 16px; tap areas target 44 × 44px |
| Icons | Consistent outline stroke, black/red; supplied brand marks remain images/vectors |
| Effects | Subtle shadows/borders and source red gradients; no new decorative animation |

Exact font families cannot be established from flattened JPEGs. Build a comparison specimen for candidate condensed headings and body families, then obtain font files/name or client agreement on the closest match. Do not claim typography is exact while this remains open. Keep logo lettering intact rather than typing an approximation. Use approved script artwork or confirmed script font for the quotation.

## Responsive contract

All breakpoints below are proposed, since no mobile reference is supplied. The 736px homepage file contains desktop navigation and five-column services; it is not evidence of a mobile layout.

| Available width | Required adaptation |
|---|---|
| 1440px and above | Match three-column customer shell and two-workflow admin composition; constrain extra-wide canvas around 1600–1680px initially |
| 1024–1439px | Collapse secondary rail below primary content when space is insufficient; reduce or drawer-collapse sidebar before squeezing forms/tables |
| 768–1023px | Compact header and drawer navigation; two-column cards/forms where readable; admin workflows usually stack |
| 320–767px | One main content column, drawer navigation, full-width key actions, labeled parcel cards, single-column form fields |

Use content fit, not device names, to finalize transitions. Use CSS Grid/Flexbox, `minmax(0, 1fr)`, intrinsic wrapping and fluid type with bounded sizes. No fixed-height content panels or page-wide horizontal overflow. Preserve every field/status/action when reflowing.

Homepage: hero copy/actions first, image then benefits; couriers wrap; services 5→2→1; steps remain numbered in reading order; pricing intro and plans 4→2→1; Why Choose Us and community content stack; announcements 3→1; footer 4→2→1. Avoid tiny scaled-down desktop artwork.

Customer: compact identity summary and one accessible drawer; tasks before membership/help; parcel tables become labeled cards at narrow widths; bounded table scrolling is acceptable at intermediate widths if labeled. Account fields 3→2→1, preferences 2→1; tabs wrap or scroll only in their own strip. Save/Cancel stay associated with the form and visible above the mobile keyboard when focused, without covering fields.

Admin: drawer sidebar; KPI cards 4→2→1; Receive then Pickup stacked; scan inputs and actions full width; recent rows become cards. Camera dialog fits short landscape viewports and safe areas; closing returns focus to its trigger.

## Assets and content decisions

Larger root images help inspect source details, but most contain baked-in headings, buttons, or text. Recreate text and controls in HTML; use only clean visual crops where available and adequate. Clean original hero photo, logo variants, header illustrations, courier/payment logos and font files are still needed for best fidelity. Do not stretch, redraw or generate substitute brand artwork without documenting the variance.

The standalone logo has a different word/color arrangement from the website logo. Standalone footer gives 0956 345 4219 and Mon–Fri 10AM–10PM / weekend 10AM–7PM; layouts show 0917 123 4567 and Mon–Sun 8AM–9PM. Confirm production contact details, business hours, social URLs and building spelling. Preserve layout visually while using clearly marked reference content in the prototype.

Pricing reference: per parcel ₱15 with three free holding days; regular ₱149/15 days with three free holding days; premium ₱299/30 days with seven holding days and five free deliveries. My Parcels uses three-day deadlines on a premium customer while Admin implies seven days. ₱10/day holding fees and membership expiry numbers are illustrative until policy is confirmed. Do not implement financial rules by copying inconsistent labels.

## Missing design states to derive

Auth screens (register, verification, login, forgotten/reset password); customer dashboard/tracking/details; admin customer list/invite/detail/edit/deactivate/logs; scanner mode chooser/camera/result/error; membership request/renewal; notifications; authorized claimants and delivery request workflow. Include loading, empty, invalid input, forbidden, expired session, network error, stale edit and success states. These must reuse the source system and be labeled derived designs.

## Visual verification

Capture the three portal pages at 1536 × 1024 with fixed synthetic fixtures matching the screenshot content. Compare side by side and with overlays for logo, geometry, type metrics, spacing, image crops, borders and color. For homepage compare section proportions against the scaled reference; first agree a full-width desktop baseline because its original CSS viewport is unknown. Automated screenshot tests guard the accepted implementation after human comparison; they cannot establish fidelity by approving their own initial baselines.

Test 320, 360, 390, 430, 768, 1024, 1280, 1440, 1536 and 1920px plus widths immediately around each breakpoint. Include short landscape, long names/tracking IDs, 200% text zoom, keyboard-only use and browser zoom producing a 320 CSS-pixel viewport. All content/actions remain usable; no page overflow. Status text accompanies color. Contrast, visible focus, accessible dialogs, real labels and reduced-motion preferences are required. Document any accessibility-driven departure from reference rather than silently redesigning.
