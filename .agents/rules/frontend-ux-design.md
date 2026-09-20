# Skill Rule: frontend-ux-design

> **Description & Purpose**: Modern UI/UX design and frontend visual polish. Use when designing user interfaces, creating layouts, improving typography hierarchy, adding micro-interactions, or ensuring responsive ergonomics that match client design references.
> **Skill Reference**: [SKILL.md](../skills/frontend-ux-design/SKILL.md)

When this rule or skill is mentioned via `@frontend-ux-design`, the agent must activate the **frontend-ux-design** skill procedures and adhere strictly to its workflows.

---

# Frontend UX & Design Skill

> Inspired by Anthropic's Frontend Design principles and Garry Tan's Designer Who Codes standards.

## Core Rules

### 1. Match Visual Hierarchy & Reference Geometry
- Respect client-provided design compositions (proportions, color distribution, typography weights).
- Never replace high-impact headlines with weak, generic typography.
- Use uppercase condensed display fonts for section headlines and clean neutral sans-serif for body copy.
- Highlight key value words in brand accent colors (e.g. `<span className="text-brand-red">PARCEL</span>`).

### 2. Spacing & Grid System
- Follow a consistent 4px/8px geometric spacing scale: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px).
- Avoid erratic custom padding.
- Maintain breathing room around high-density data tables and forms.

### 3. Micro-Interactions & State Feedback
- Provide immediate visual feedback for all interactive elements:
  - Hover states on links and buttons (`hover:bg-brand-red/90`, `transition-colors duration-150`).
  - Active and focus states for keyboard and mouse focus.
  - Interactive status badges (pulsing green dot for online, warning pill for overdue).
  - Modal animations with subtle fade-in and scale transitions.

### 4. Form Ergonomics
- Clear, prominent labels above inputs.
- Meaningful placeholder text and input types (`type="email"`, `type="tel"`, `type="password"`).
- Accessible inline error messages and confirmation banners.
- Group related fields logically (Personal Info, Unit Address, Emergency Contact).
