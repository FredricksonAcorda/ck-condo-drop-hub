---
name: spec-driven-planning
description: Spec-driven planning and architecture design. Use when scoping features, planning multi-phase projects, designing data models, breaking down complex tasks, or aligning requirements before writing code.
---

# Spec-Driven Planning Skill

> Inspired by NeoLabHQ Spec-Driven Development (SDD), Garry Tan's Autoplan, and YC Product Planning.

## Core Principle
**Code is cheap to write, but expensive to change. Lock in the spec, data contracts, and failure modes before writing implementations.**

---

## 5-Phase Planning Framework

### 1. Requirements & User Intent Alignment
- Define the user persona, primary use cases, and acceptance criteria (AC).
- Clarify assumptions, constraints (free tiers, offline behavior, latency limits).
- Formulate the Definition of Done (DoD) for each phase.

### 2. Architecture & Data Contracts
- Sketch component hierarchy and data flow (Unidirectional Data Flow).
- Specify exact TypeScript interfaces, entity schemas, and API request/response payloads.
- Map state boundaries: What lives in URL params? React state? Global context? Server database?

### 3. Edge-Case & Risk Matrix
- Identify failure modes:
  - Network disconnection / timeout
  - Unauthenticated / unauthorized access
  - Corrupted or partial input
  - Third-party rate limits or quotas (e.g. Firebase Spark, SMS API)
- Define user-facing fallback states for each failure (Empty, Loading, Error, Offline).

### 4. Phased Implementation Roadmap
- Break the implementation into sequential, verifiable milestones:
  - Phase 1: Foundation, UI layout & design system
  - Phase 2: Auth, state management & CRUD logic
  - Phase 3: Hardware / Third-party service integrations
  - Phase 4: Production verification, performance & deployment
- Mark critical-path dependencies between tasks.

### 5. Verification Gate
- Define exact verification steps for each milestone:
  - Automated typechecking & linting commands
  - E2E / integration test cases
  - Manual UI & responsive inspection checklist
