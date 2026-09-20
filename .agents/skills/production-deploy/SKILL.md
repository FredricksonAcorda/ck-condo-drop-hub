---
name: production-deploy
description: Production build, deployment, and hosting configuration. Use when preparing Next.js apps for deployment on Netlify or Vercel, managing environment variables, configuring redirects/headers, setting up custom domains, or managing zero-downtime rollbacks.
---

# Production Deployment Skill

> Specialized for Netlify and Vercel hosting with Next.js App Router applications.

## Core Rules

### 1. Pre-Deployment Build Gate
Before triggering any production deploy, all 3 checks must pass locally:
1. `npm run typecheck` — 0 TypeScript errors.
2. `npm run lint` — 0 ESLint errors and 0 warnings.
3. `npm run build` — Clean production compilation with valid static and dynamic route manifests.

### 2. Environment Variables & Secrets Hygiene
- Never commit `.env.local` or API secret keys to Git.
- Define environment schemas and fail-fast validation (`src/env.mjs` or similar) so missing keys abort the build early with clear guidance.
- Configure separate environment variables for **Staging** and **Production**:
  - `NEXT_PUBLIC_FIREBASE_API_KEY` (publicly exposed)
  - `FIREBASE_ADMIN_PRIVATE_KEY` (server-only secret)
  - `NEXT_PUBLIC_APP_URL`

### 3. Netlify Configuration (`netlify.toml`)
- Configure Next.js runtime plugin and security headers:
  ```toml
  [build]
    command = "npm run build"
    publish = ".next"

  [[plugins]]
    package = "@netlify/plugin-nextjs"

  [[headers]]
    for = "/*"
    [headers.values]
      X-Frame-Options = "DENY"
      X-Content-Type-Options = "nosniff"
      Referrer-Policy = "strict-origin-when-cross-origin"
  ```

### 4. Zero-Downtime Rollback Procedure
- If a production incident or bug is detected post-launch:
  - Instant rollback via Netlify / Vercel Deploy Dashboard to the previous green deployment with 1 click.
  - Revert the offending commit in Git: `git revert <commit-hash>`.
  - Re-run automated tests before re-deploying.
