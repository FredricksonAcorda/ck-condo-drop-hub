---
name: tailwind-v4-styling
description: Tailwind CSS v4 styling, CSS-first design tokens, and responsive layout patterns. Use when creating UI components, configuring brand color palettes, defining typography tokens, or handling multi-breakpoint responsive reflow.
---

# Tailwind CSS v4 Styling Skill

> Specialized for Tailwind CSS v4 CSS-first configuration, modern design tokens, and fluid responsive design.

## Core Rules

### 1. CSS-First Design Tokens (`@theme`)
- In Tailwind v4, configure tokens directly in `src/app/globals.css` inside the `@theme` block:
  ```css
  @import "tailwindcss";

  @theme {
    --color-brand-red: #CC0000;
    --color-brand-dark: #050B09;
    --color-brand-surface: #F7FAF8;
    --color-brand-border: #E6E9E7;
    --font-heading: "Bebas Neue", sans-serif;
    --font-body: "Inter", sans-serif;
  }
  ```
- Use semantic token names rather than arbitrary hex values (`bg-brand-red` instead of `bg-[#CC0000]`).

### 2. Responsive Mobile-First Design
- Always style the mobile base first, then apply breakpoint modifiers:
  - Default: Mobile (320px – 639px, 1 column, full-width buttons, collapsible drawers)
  - `sm:`: 640px+ (tablets / large phones)
  - `md:`: 768px+ (tablets landscape, two-column grids)
  - `lg:`: 1024px+ (laptops, multi-column desktop layouts)
  - `xl:`: 1280px+ (widescreen, 3-column shells)
- Ensure no horizontal scrollbar occurs on any viewport width (`overflow-x-hidden` or responsive container padding).

### 3. Reusable Component Classes (`@layer components`)
- Encapsulate common button, input, and card patterns in `@layer components` to keep HTML clean:
  - `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`, `.btn-lg`
  - `.input`, `.card`
- Ensure interactive buttons have a minimum touch target size of 44×44px on mobile devices.

### 4. Visual Contrast & Accessibility
- Maintain WCAG AA contrast ratios (at least 4.5:1 for normal body text, 3:1 for large headers).
- Provide visible focus rings for keyboard navigation: `focus:outline-none focus:ring-2 focus:ring-brand-red`.
