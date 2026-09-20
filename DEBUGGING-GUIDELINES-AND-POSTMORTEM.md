# Engineering Post-Mortem & Systematic Debugging Guidelines

**Document Created:** September 20, 2026  
**Applicable Scope:** All features, bug fixes, UI/UX styling, asset pipelines, database schemas, and API routes across the CK Condo Drop Hub project.

---

## 1. Honest Post-Mortem: Why Did the Footer Logo Take So Long?

### The Incident
The user requested modifying the footer logo to have white text and white emblem parts, keep the red brand colors, and remove any background rectangle so only the logo and text float on the dark footer. It took multiple iterative turns and burned unnecessary tokens before achieving the exact requested result.

### The 3 Core Root Causes

#### 1. Symptom Patching Instead of Root-Cause Analysis (The Initial Blunder)
- Earlier in commit `e7eddcb`, an attempt was made to make the logo visible on dark backgrounds by preserving a **solid white rectangle background** on `logo-white.png`.
- This was a fundamental misunderstanding of transparent alpha channels: rather than turning the black pixels white and keeping alpha transparent, a white card was introduced.
- This created the very rectangle bug the user had to spend time complaining about.

#### 2. The Silent Cache Trap (Next.js `/_next/image` + Browser Cache)
- When `logo-white.png` was initially fixed on disk, Next.js did not serve the new file.
- Next.js's Image Optimization pipeline caches processed images in `.next/cache/images/` and serves them with `Cache-Control: public, max-age=31536000, immutable`.
- Even after replacing the file on disk:
  1. The server was serving the old cached image from `.next/cache/images/`.
  2. The user's browser retained the old 155KB image with the white rectangle in its local memory/disk cache.
- The assistant assumed *"I updated the file on disk and ran build, so it's done,"* while the user was still looking at the old cached white rectangle box.

#### 3. Verification Disconnect (Checking Disk vs. Checking User Reality)
- The assistant verified that the file existed on disk rather than verifying what the client actually receives through the network pipe.
- When the user repeated: *"use this on the footer. Remove the bg"*, the assistant should have immediately asked: *"Why is the user still seeing a background when my local script says it's transparent?"*
- Answering that question immediately exposed the Next.js image cache and the need for `unoptimized` and cache-busting.

---

## 2. Core Debugging Rules & Mandatory Protocols

To prevent token waste, repetitive back-and-forth, and shallow fixes, the following rules are **MANDATORY** for all future tasks.

### Rule 1: Always Find the Root Cause First (No Guesswork)
- Never apply a "hopeful fix" or patch a symptom.
- Walk backwards from the user's exact symptom:
  - What is the user seeing?
  - What does the DOM / HTTP response / database actually return?
  - Where in the pipeline is the discrepancy introduced?

### Rule 2: Never Trust Disk State Alone (Verify the Delivery Pipeline)
- Changing a file on disk is only Step 1.
- You must verify the entire delivery chain:
  - **Static Assets:** Is Next.js optimizing/caching it? Did `.next/cache/images` get invalidated? Does the browser cache need to be bypassed (`unoptimized`, cache-busting query, or hard refresh)?
  - **API / Database:** Did the query return live data or cached ISR/SSG data? Are security rules (RLS) blocking the payload?
  - **State / UI:** Did the component re-render? Did React state update or is it stale?

### Rule 3: Zero-Token-Waste Protocol (Investigate Deeply on Turn 1)
When a user reports that an issue persists or is not right:
1. **STOP.** Do not repeat the same action that failed before.
2. **Formulate a clear, testable hypothesis:** *"The file on disk is transparent, so the user must be receiving a cached response or an overlapping CSS background."*
3. **Run a targeted diagnostic script:**
   - Inspect pixel values, headers, database rows, or DOM elements programmatically.
4. **Prove or disprove the hypothesis with data** before touching production code.
5. **Apply the architectural fix and verify end-to-end.**

---

## 3. Domain-Specific Debugging Checklists

### A. UI, Images & Static Assets
- [ ] **Transparency Audit:** Check alpha channel (`data[i+3]`). Ensure background pixels have `alpha = 0`.
- [ ] **Next.js Image Pipeline:** If an asset was modified, check if `<Image />` is routing through `/_next/image`. Clear `.next/cache/images` and use `unoptimized` if direct asset fidelity is required.
- [ ] **CSS Background Checks:** Verify that parent containers (`<a>`, `<div>`, `<Link>`) do not have residual background utility classes (`bg-white`, `bg-brand-surface`).
- [ ] **Contrast Check:** When creating white text/assets, verify how they render on both dark backgrounds (`bg-brand-dark`) and light backgrounds.

### B. Database & Backend (Supabase / Firebase / Server Actions)
- [ ] **Schema & Types:** Ensure TypeScript interfaces match the actual database column names and types exactly.
- [ ] **Security Rules & RLS:** When queries return empty arrays or 403s, immediately check Firestore Security Rules or Supabase RLS policies before rewriting query logic.
- [ ] **Network Latency & Error Handling:** Ensure all mutations handle loading states, network failures, and optimistic rollbacks gracefully.

### C. Responsive Layout & Mobile Viewports
- [ ] **Touch Targets & Overflow:** Test `min-w`, `max-w`, `overflow-x-hidden`, and padding across mobile (`<640px`), tablet (`768px-1024px`), and desktop (`>1024px`).
- [ ] **Standard UI Proportions:** Avoid stretching buttons to 100% full width on large desktop cards unless explicitly designed as a mobile bottom sheet. Keep buttons centered with standard padding and min-width constraints.

---

## 4. Commitment to the User

Every interaction must adhere to these standards:
- **Honesty over deflection:** Admit mistakes directly and explain the exact technical cause.
- **Thoroughness over speed:** Take the extra 30 seconds to run a diagnostic script and verify the live server output before declaring a task completed.
- **Preserve tokens:** Deliver complete, permanent, bug-free solutions on the first pass so the user never has to repeat a request twice.
