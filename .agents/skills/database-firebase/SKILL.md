---
name: database-firebase
description: Firebase Firestore, Authentication, and Security Rules architecture. Use when designing NoSQL schemas, configuring Firebase Auth, writing Firestore security rules, setting up real-time listeners, or optimizing Spark free-tier quotas.
---

# Firebase Architecture & Security Skill

> Specialized for Firebase Firestore, Firebase Authentication, and Cloud Functions.

## Core Rules

### 1. Firestore Schema & Document Modeling
- Model data around query patterns, not relational normalization:
  - `residents/{residentId}`: User profile, unit number, tower, contact number, active plan, notification preferences.
  - `parcels/{parcelId}`: Tracking number, courier, recipient resident ID, shelf slot, arrival timestamp, pickup deadline, status (`READY`, `PICKED_UP`, `OVERDUE`), holding fee, claim code.
  - `logs/{logId}`: Audit trail for parcel intake, verification, release, and staff actions.
- Denormalize frequently read summary fields (e.g. `residentName`, `unit`) onto the parcel document to avoid multi-read joins.

### 2. Spark Tier Quota & Read/Write Optimization
- Firestore Spark free tier limits: 50,000 reads/day, 20,000 writes/day.
- Cache static or infrequent queries with local persistence (`enableIndexedDbPersistence`).
- Avoid wide real-time collection listeners where a simple paginated `getDocs(query(..., limit(20)))` suffices.
- Disconnect snapshot listeners (`unsubscribe()`) on React component unmount (`useEffect` cleanup).

### 3. Security Rules (RBAC)
- Never use `allow read, write: if true;` in production.
- Enforce strict role-based access control (RBAC):
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      function isAuthenticated() {
        return request.auth != null;
      }
      function isAdmin() {
        return isAuthenticated() && request.auth.token.role == 'admin';
      }
      function isOwner(userId) {
        return isAuthenticated() && request.auth.uid == userId;
      }

      match /parcels/{parcelId} {
        allow read: if isAdmin() || (isAuthenticated() && resource.data.residentId == request.auth.uid);
        allow create, update, delete: if isAdmin();
      }

      match /residents/{residentId} {
        allow read: if isAdmin() || isOwner(residentId);
        allow write: if isAdmin() || isOwner(residentId);
      }
    }
  }
  ```

### 4. Authentication & Session State
- Use Firebase Auth for Email/Password and Phone SMS authentication.
- Sync auth state with React Context / Hook (`onAuthStateChanged`).
- Protect server-side and client-side routes against unauthenticated access.
