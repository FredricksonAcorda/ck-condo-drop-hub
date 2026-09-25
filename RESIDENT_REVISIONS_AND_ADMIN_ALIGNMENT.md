# CK Condo Drop Hub — Resident Portal Revisions & Staff Admin Alignment Guide

> **Document Purpose**: Comprehensive changelog of all revisions, UI/UX polish, bug fixes, and business logic applied to the **Resident Portal** (`src/app/(customer)/*`), with a direct checklist of corresponding updates and features to apply to the **Staff Admin Portal** (`src/app/(admin)/*`).

---

## 1. Executive Summary of Changes Made to Resident Portal

| Area | Changes & Fixes Made on Resident Account | Business Impact / Rules |
| :--- | :--- | :--- |
| **Side Navigation** | • Pinned `LOGOUT` to bottom-left of sidebar<br>• Removed top-left profile promo card & identity box<br>• Removed redundant `/track` link from customer nav<br>• Expanded layout to full width | Clean, focused sidebar; external `/track` reserved for public lookups |
| **Dashboard** (`/dashboard`) | • KPI stat cards made display-only<br>• Removed redundant "Packages Pickup" block<br>• Regular Plan Door Delivery Credits set to *"Not Available for Regular Plans"*<br>• Payment modal upgraded to **Option B** (side-by-side) | Eliminates confusion between Dashboard and My Parcels; enforces plan rules |
| **My Parcels** (`/parcels`) | • Removed right rail sidebar card<br>• Removed green dots & redundant claim codes<br>• Aligned desk verification badge UI<br>• Added **Overdue** status badge & calendar date filter<br>• Added 5-item pagination with auto-scroll and stable height | Smooth browsing, clear parcel lifecycle tracking, zero layout shift |
| **My Account** (`/account`) | • Removed right rail sidebar; full-width ergonomics<br>• Door Delivery tab: Regular plan shows disabled notice; Premium plan unlocks delivery window (Morning vs Afternoon)<br>• Integrated with shared `inquiriesStore`<br>• Real-time edit, update, cancel, and resolution sync with Admin | Door delivery strictly blocked for Regular plans; door delivery tickets synced live with Staff Admin |
| **Membership** (`/membership`) | • Established plan rules: Regular (15d unlimited, 3d holding grace) vs Premium (30d unlimited, 7d holding grace, 5 door deliveries)<br>• Active subscription expiry countdown reminder<br>• Payment & Billing Receipts history (`invoices`) with printable receipt modal<br>• **Option B** payment modal with full-bleed QR image & "GCash Number" label | Accurate billing records; scannable official QR code without nested box padding |
| **Help Center** (`/help`) | • Removed duplicate hotline banners & operating hours boxes<br>• Live synced ticket status with Staff Admin replies | Clean customer support interface with bi-directional ticket updates |
| **Global Terminology** | • Standardized **"Lobby"** (replacing Desk / Front Desk)<br>• Standardized **"Staff Admin"** (replacing Staff / Front Desk Staff)<br>• Standardized **"Cash at Counter"** (replacing Cash at Desk) | Uniform professional brand terminology throughout the app |

---

## 2. Chronological Revisions on Resident Account (From Side Nav to Current)

### 2.1 Side Navigation & Layout Architecture
- **Pinned Bottom Logout**: Positioned the `LOGOUT` button sticky/fixed at the bottom of the resident sidebar navigation for quick access without scrolling.
- **Removed Distractions**: Removed the redundant top-left user identity badge and promo box from the sidebar.
- **Removed Track Parcel Link**: Removed `/track` from the resident sidebar menu. Public tracking remains accessible at `/track` for external or non-authenticated lookups; authenticated residents track parcels directly via **My Parcels**.
- **Full-Width Ergonomics**: Removed narrow container constraints and removed right-rail sidebars across `/account`, `/parcels`, and `/dashboard`, creating a modern, spacious desktop layout.

### 2.2 Dashboard (`src/app/(customer)/dashboard/page.tsx`)
- **Display-Only KPI Cards**: Dashboard statistics (Ready for Pickup, Total Received, Door Delivery Credits) are now purely informational cards without confusing inner action buttons.
- **Removed "Packages Pickup" Section**: Eliminated the redundant pickup table that duplicated `/parcels`.
- **Regular Plan Door Delivery Credits**:
  - For Regular Plan: Displays `Not Available for Regular Plans` instead of `0 (Pay per trip)`.
  - For Premium VIP: Displays remaining monthly door deliveries (e.g. `5 Free / month`).
- **Payment Activation Modal (Option B)**:
  - Updated from single-column `max-w-md` to 2-column side-by-side `max-w-2xl`.
  - Left column: Full-size official GCash QR card image (`gcash-official-qr.jpg`).
  - Right column: Plan details, total amount due, and GCash Number input.
  - Header cleaned of all redundant text (removed top badge, removed duplicate amount due and 30-day subtitle).

### 2.3 My Parcels (`src/app/(customer)/parcels/page.tsx`)
- **Visual Polish**:
  - Removed green indicator dots and redundant claim passcodes from history rows.
  - Verification badges match exact parcel lifecycle states (`READY FOR PICKUP`, `CLAIMED / RELEASED`, `OVERDUE`).
- **Overdue Detection & Grace Periods**:
  - Highlights parcels exceeding the resident's free holding grace period.
- **Filter Controls**:
  - 5 Status Filters: `ALL`, `READY`, `PICKED_UP`, `IN_TRANSIT`, `OVERDUE`.
  - Added Calendar date picker for parcel arrival filtering.
- **Ergonomic Pagination**:
  - 5 items per page with automatic scroll-to-top on page change and min-height container to eliminate visual page jumping.

### 2.4 My Account & Door Delivery Concierge (`src/app/(customer)/account/page.tsx`)
- **Plan-Based Door Delivery Access**:
  - **Regular Plan**: Door delivery is disabled. Displays a clean notice: *"Your Regular plan does not include Door Delivery concierge runner service. Upgrade to Premium VIP to unlock free doorstep deliveries."* Redundant upgrade buttons, icons, and nested boxes were removed.
  - **Premium VIP Plan**: Displays delivery window selector (`Morning 10:00 AM - 12:00 PM` or `Afternoon 2:00 PM - 5:00 PM`) and drop-off instructions.
- **Pending Request Controls**:
  - Residents can edit delivery preferences (e.g., switch from Afternoon to Morning) or cancel a pending door delivery request.
- **Bi-Directional Resolution Sync**:
  - When Staff Admin resolves an inquiry or completes a delivery in the Admin Portal, the status in the Resident's Door Delivery tab automatically updates from *"Pending Staff Admin Action"* to *"Resolved / Completed"*.

### 2.5 Membership & Subscriptions (`src/app/(customer)/membership/page.tsx`)
- **Core Plan Rules**:
  1. **Per Parcel (Free Tier)**:
     - ₱20 per claimed parcel.
     - 2 days holding grace period.
     - 0 door deliveries.
  2. **Regular Plan (₱149 / 15 days)**:
     - **15 Days Unlimited Parcels**.
     - **3 Days Free Holding Grace** (Overdue fee ₱20/day after 3 days).
     - Doorstep delivery **NOT available** (Exclusive to Premium).
  3. **Premium VIP (₱299 / 30 days / month)**:
     - **30 Days Unlimited Parcels**.
     - **7 Days Extended Free Holding Grace**.
     - **5 Free Door Deliveries per month**.
     - Priority Lobby shelving and dedicated Staff Admin hotline.
- **Subscription Expiry Countdown Reminder**:
  - Added an active subscription reminder banner showing days remaining, expiry date, and quick renewal button.
- **Payment & Billing Receipts History**:
  - When a resident pays, renews, or switches plans, an official receipt is automatically generated and added to `invoices` history.
  - Interactive **"View Receipt"** printable modal showing Invoice #, Date, Resident Name & Code, Plan, Amount, Payment Method, and Status (`PAID` or `PENDING LOBBY CASHIER`).
- **Option B GCash & Counter Modal**:
  - Side-by-side 2-column layout (`max-w-2xl`).
  - Cropped official QR card image (`gcash-official-qr.jpg`) fills the left column directly without nested padding or double boxes.
  - Label changed to: **`GCash Number (if QR can't be scanned)`** with sample number helper.
  - Streamlined header with action title only (`RENEW PREMIUM`, `SWITCH TO REGULAR`, `SETTLE REGULAR PLAN`).
  - Cash at Counter tab with matching clean header and ground-floor reception instructions.

### 2.6 Help Center (`src/app/(customer)/help/page.tsx`)
- Removed redundant banner graphics, repetitive hotlines, and duplicate operating hour cards.
- Integrated inquiries table connected directly with the Admin inquiries database.

---

## 3. Staff Admin Account Alignment Checklist

To ensure complete parity, operational consistency, and seamless end-to-end workflows between residents and staff, the following changes should be applied to the **Staff Admin Account** (`src/app/(admin)/*`):

### 3.1 Side Navigation (`src/app/(admin)/layout.tsx`)
- [ ] **Navigation Label Update**:
  - Change `"DESK INQUIRIES"` to `"LOBBY INQUIRIES"` or `"RESIDENT INQUIRIES"` to match the new Lobby terminology.
- [ ] **Remove `/track` from Admin Sidebar (or reposition)**:
  - Staff Admin already has `/admin/parcels` and `/admin/scanner` for deep search. `/track` is the resident-facing/public lookup.
- [ ] **Station Indicator**:
  - Verify station indicator reads `"Lobby Counter"` (consistent with `"Lobby Staff Admin"`).
- [ ] **Pinned Bottom Logout**:
  - Ensure Admin layout also features a clean, pinned bottom identity and logout dock.

---

### 3.2 Inquiries & Door Delivery Management (`src/app/(admin)/admin/inquiries/page.tsx`)
- [ ] **Door Delivery Category Recognition**:
  - Highlight Door Delivery requests clearly with badge (`DOOR DELIVERY`).
  - Display delivery window (`Morning 10:00 AM - 12:00 PM` vs `Afternoon 2:00 PM - 5:00 PM`) and drop-off notes prominently.
- [ ] **Plan Eligibility Badge**:
  - Show the resident's active plan tag (`PREMIUM VIP` vs `REGULAR` vs `PER PARCEL`) next to door delivery inquiries.
  - Flag or warn Staff Admin if a resident on a `REGULAR` plan submits a door delivery inquiry without upgrading.
- [ ] **Real-Time Resolution Sync**:
  - When Staff Admin clicks **"Resolve"** or replies with status `RESOLVED`, ensure the action immediately dispatches the event (`ck_inquiries_updated` / `ck_db_updated`) so the resident's Door Delivery tab updates instantly.
- [ ] **Terminology Audit**:
  - Ensure all headers and tooltips say `"Lobby Counter"` and `"Staff Admin"`, not `"Desk"`.

---

### 3.3 Residents & Customers Management (`src/app/(admin)/admin/customers/page.tsx`)
- [ ] **Accurate Plan Display**:
  - Update plan badges and details:
    - **Regular Plan**: Show `15 Days Unlimited • 3 Days Free Holding • No Door Delivery`.
    - **Premium VIP**: Show `30 Days Unlimited • 7 Days Free Holding • 5 Free Door Deliveries`.
    - **Per Parcel**: Show `₱20 / Parcel Claim • 2 Days Free Holding`.
- [ ] **Subscription Status & Expiry Date**:
  - Display remaining days on active subscriptions for each resident (e.g. `Expires in 12 days`).
- [ ] **Lobby Counter Cash Payment Confirmation**:
  - Add an action for Staff Admin to **"Confirm Cash Payment"** when a resident pays at the counter:
    - Sets subscription status from `PENDING` to `ACTIVE`.
    - Updates resident's billing receipt status from `PENDING LOBBY CASHIER` to `PAID`.
    - Dispatches update event to resident portal.

---

### 3.4 Hub Inventory & Overdue Logic (`src/app/(admin)/admin/parcels/page.tsx`)
- [ ] **Plan-Specific Free Holding Grace Calculation**:
  - When calculating whether a parcel is **OVERDUE**:
    - If resident is on **Regular Plan**: Grace period is **3 days**. Overdue fee begins on Day 4.
    - If resident is on **Premium VIP**: Grace period is **7 days**. Overdue fee begins on Day 8.
    - If resident is on **Per Parcel**: Grace period is **2 days**. Overdue fee begins on Day 3.
- [ ] **Release Parcel Workflow**:
  - Ensure Staff Admin release modal displays:
    - Claim code verification.
    - Overdue fees (if holding days exceeded resident's plan grace period).
    - Recipient name recording (resident or authorized proxy).
- [ ] **Door Delivery Quick Filter**:
  - Add a quick filter for parcels flagged for `Doorstep Concierge Delivery` so runners can batch deliveries by morning/afternoon window.

---

### 3.5 Parcel Scanner Station (`src/app/(admin)/admin/scanner/page.tsx`)
- [ ] **Intake Notification & Shelf Priority**:
  - For **Premium VIP** residents: Flag as `Lobby Priority Shelf` during intake scan.
  - Display resident's plan upon scan so Staff Admin knows holding limits immediately.
- [ ] **SMS Notification Text**:
  - Ensure automated intake SMS reflects accurate free holding days (3 days for Regular, 7 days for Premium).

---

## 4. Shared State & Storage Keys Reference

| Key / Event | Purpose | Shared Between |
| :--- | :--- | :--- |
| `ck_inquiries` / `inquiriesStore` | Door delivery requests, proxy authorizations, and support tickets | Resident (`/account`, `/help`) & Staff Admin (`/admin/inquiries`) |
| `ck_residents` | Resident profiles, plan type, subscription expiry, door delivery credits | Resident (`/account`, `/membership`) & Staff Admin (`/admin/customers`) |
| `ck_parcels` | Inbound, ready, overdue, and released parcel records | Resident (`/parcels`, `/dashboard`) & Staff Admin (`/admin/parcels`, `/admin/scanner`) |
| `ck_db_updated` | Global window custom event for real-time multi-tab cross-sync | Dispatched on any mutation across both portals |

---
*Generated for CK Condo Drop Hub — Master Reference Document*
