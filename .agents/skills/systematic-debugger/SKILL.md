---
name: systematic-debugger
description: Systematic root-cause investigation and debugging. Use when diagnosing bugs, unexpected errors, test failures, or performance regressions to find the root cause before changing code.
---

# Systematic Debugger Skill

> Based on Garry Tan's Investigative Methodology, YC engineering standards, and Sentry Root-Cause Analysis.

## Core Principle
**Never patch symptoms. Always find and verify the root cause first.**

A quick fix without identifying the underlying mechanism creates technical debt and introduces secondary bugs.

---

## 4-Step Debugging Protocol

### 1. Reproduce & Isolate
- Reproduce the failure consistently with the smallest possible test case or curl/command.
- Capture the exact error message, stack trace, and execution context.
- Distinguish between client-side, server-side, network, or configuration failure.

### 2. Trace the Data Flow
- Walk backwards from the point of failure:
  - What was the exact input received?
  - What state or variable mutated unexpectedly?
  - Where did the corrupted or missing data originate?
- Inspect browser devtools console, terminal logs, or network payloads.

### 3. Formulate & Test Hypotheses
- State a clear hypothesis: *"The error occurs because X component assumes Y is non-null when Z event fires."*
- Test the hypothesis with a targeted probe or log statement before making extensive code changes.
- Disprove alternative explanations.

### 4. Implement Minimal, Robust Fix & Verify
- Apply the minimal change that addresses the root cause at the architectural source.
- Verify that the reproduction case now passes.
- Check for regression across adjacent components.
- Add an automated test or defensive check to prevent recurrence.
