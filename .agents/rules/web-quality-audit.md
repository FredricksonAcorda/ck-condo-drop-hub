# Skill Rule: web-quality-audit

> **Description & Purpose**: Web quality, performance, accessibility, and SEO audit. Use when evaluating Core Web Vitals (LCP, INP, CLS), auditing WCAG AA accessibility, optimizing bundle sizes, or verifying SEO metadata.
> **Skill Reference**: [SKILL.md](../skills/web-quality-audit/SKILL.md)

When this rule or skill is mentioned via `@web-quality-audit`, the agent must activate the **web-quality-audit** skill procedures and adhere strictly to its workflows.

---

# Web Quality & Audit Skill

> Based on Addy Osmani's Web Quality Audit standards and Google Lighthouse guidelines.

## Core Audit Pillars

### 1. Core Web Vitals & Performance
- **Largest Contentful Paint (LCP)**: Target < 2.5s. Preload hero imagery, avoid render-blocking CSS/JS, and leverage Next.js image optimization.
- **Interaction to Next Paint (INP)**: Target < 200ms. Keep event handlers lean, avoid heavy blocking computations on the main thread, and debounce search inputs.
- **Cumulative Layout Shift (CLS)**: Target < 0.1. Always provide explicit aspect ratios or `width`/`height` on images, embeds, and dynamic placeholders.

### 2. Accessibility (WCAG 2.1 Level AA)
- **Keyboard Navigation**: Ensure every interactive button, input, link, and modal can be navigated and triggered via `Tab`, `Enter`, `Space`, and `Escape`.
- **Screen Reader Support**: Use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`). Include descriptive `aria-label` on icon-only buttons.
- **Color Contrast**: Verify that text against backgrounds passes 4.5:1 ratio for standard text and 3:1 for large display headers. Never rely solely on color to convey status.

### 3. SEO & Metadata
- Provide descriptive, unique `<title>` and `<meta name="description">` on every route.
- Implement Open Graph and Twitter Card tags for social preview unfurls.
- Generate valid structured data (`schema.org`) for local business / community hub.

### 4. Code & Bundle Hygiene
- Eliminate unused npm dependencies and dead code.
- Prevent heavy third-party libraries (e.g., barcode scanner SDKs) from inflating the initial public page bundle by lazy-loading them dynamically.
