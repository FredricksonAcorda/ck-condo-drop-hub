---
name: nextjs-app-router
description: Next.js App Router and React 19 architecture patterns. Use when building or optimizing routes, layouts, server vs client components, data fetching, server actions, route handlers, or caching in Next.js applications.
---

# Next.js App Router Best Practices Skill

> Authored from Vercel Labs Engineering patterns and React 19 architectural standards.

## Core Rules

### 1. Server Components by Default
- Keep components as React Server Components (RSC) unless interactivity is required.
- Only add `"use client"` at the boundary where:
  - React hooks are used (`useState`, `useEffect`, `usePathname`, `useRouter`).
  - Browser DOM events are handled (`onClick`, `onChange`, `onSubmit`).
  - Browser APIs are accessed (`window`, `localStorage`, navigator).
- Move `"use client"` down the component tree so parent layouts and page wrappers remain lightweight server components where possible.

### 2. Layouts and Route Groups
- Use route groups `(group-name)` to organize routes into separate layouts without altering the URL path:
  - `src/app/(public)/`: Public marketing pages with header/footer.
  - `src/app/(customer)/`: Authenticated resident portal with customer sidebar & rail.
  - `src/app/(admin)/`: Staff operations portal with staff sidebar & diagnostics.
  - `src/app/(auth)/`: Authentication flows (login, register, reset password).
- Avoid placing interactive event listeners in layout wrappers that wrap server-rendered routes without `"use client"`.

### 3. Data Fetching & Caching
- Fetch data where it is consumed to minimize waterfall requests.
- Use `fetch` with Next.js cache options (`cache: 'no-store'` or `revalidate: 60`) for dynamic endpoints.
- Avoid duplicate fetches by leveraging Next.js request deduplication.

### 4. Navigation & Image Optimization
- Always use `next/link` for client-side transitions; never use `<a href>` for internal routes.
- Use `next/image` with explicit `width`, `height`, and `priority` for above-the-fold hero imagery.
- Ensure all images have descriptive `alt` attributes for accessibility and SEO.

### 5. Build & Type Checking
- Run `npm run typecheck` and `npm run build` to validate route manifests and static prerendering.
