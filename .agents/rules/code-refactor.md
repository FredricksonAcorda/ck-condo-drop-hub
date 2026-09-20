# Skill Rule: code-refactor

> **Description & Purpose**: Clean code refactoring and architecture cleanup. Use when improving code readability, reducing duplication (DRY), decoupling components, optimizing performance, or applying SOLID and Clean Architecture principles.
> **Skill Reference**: [SKILL.md](../skills/code-refactor/SKILL.md)

When this rule or skill is mentioned via `@code-refactor`, the agent must activate the **code-refactor** skill procedures and adhere strictly to its workflows.

---

# Clean Code Refactor Skill

> Inspired by Matt Pocock's Refactoring Plans, NeoLabHQ Clean Architecture (DDD), and Martin Fowler's Refactoring methodology.

## Core Principle
**Refactoring transforms the internal structure of code without changing its external observable behavior.**

---

## Refactoring Guidelines

### 1. The Boy Scout Rule
- Leave the codebase cleaner than you found it.
- Fix obsolete comments, dead code, unused imports, and `any` types as you touch each file.

### 2. Single Responsibility & Component Decomposition
- Keep components focused on one clear task:
  - Separate **Presentation** (pure UI components) from **Data Fetching / Business Logic** (hooks or server components).
  - Extract reusable widgets (e.g. badge pills, modals, table rows) when they exceed 100-150 lines or duplicate logic.
  - Colocate related helpers, types, and constants.

### 3. Strict Type Safety & Eliminating Any
- Replace loose types with precise TypeScript discriminated unions:
  ```typescript
  // Prefer:
  type ParcelStatus = "READY" | "PICKED_UP" | "OVERDUE";
  // Instead of:
  // status: string;
  ```
- Use `unknown` with type guards rather than `any`.
- Define shared interfaces in a centralized `src/types/` module.

### 4. DRY (Don't Repeat Yourself) & Shared Utilities
- Consolidate repetitive utility logic (date formatting, currency display, input sanitization).
- Use custom hooks (`useParcelFilter`, `useDebounce`) to encapsulate stateful logic shared across multiple pages.

### 5. Safe Refactoring Workflow
1. Ensure existing test suite or typecheck passes before touching code.
2. Make one discrete structural change at a time.
3. Run `npm run typecheck` and `npm run lint` immediately after each change.
4. Verify UI or behavioral parity before committing.
