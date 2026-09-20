---
name: webapp-testing-playwright
description: Playwright end-to-end and responsive UI testing. Use when writing automated browser tests, verifying user workflows (login, parcel claim, intake scanning), checking multi-viewport responsiveness, or running regression audits.
---

# Web Application Testing with Playwright Skill

> Inspired by Anthropic's webapp-testing skill and TestMu AI Playwright engineering practices.

## Core Rules

### 1. Resilient Locator Strategies
- Prefer user-visible locators over fragile CSS selectors:
  ```typescript
  // Prefer accessible role locators:
  page.getByRole('button', { name: /confirm release/i });
  page.getByLabel(/tracking number/i);
  page.getByText(/ready for pickup/i);
  // Avoid:
  // page.locator('.btn-primary.w-full');
  ```
- Use `data-testid` only when no accessible role or label exists.

### 2. Viewport Matrix Testing
- Always validate the core application across standard breakpoint widths:
  - Mobile portrait: 390 × 844 (iPhone)
  - Mobile compact: 320 × 568
  - Tablet: 768 × 1024 (iPad)
  - Desktop: 1280 × 800, 1440 × 900, 1536 × 1024
- Assert that no page generates horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`).

### 3. Assertions & Flakiness Prevention
- Always use auto-retrying web assertions:
  ```typescript
  await expect(page.getByText(/claim code/i)).toBeVisible();
  await expect(page).toHaveURL('/parcels');
  ```
- Never use arbitrary `page.waitForTimeout(3000)` sleeps; wait for specific DOM states, API responses, or URL changes.

### 4. Headless Execution & Test Artifacts
- Run tests in headless mode by default in CI/CD: `npx playwright test`.
- Configure trace recording on retry and screenshots on failure to diagnose regressions quickly.
