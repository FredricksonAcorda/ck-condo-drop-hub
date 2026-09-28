# Rule: Autonomous Revision Tracking & Learning Log

> **Description & Purpose**: Enforces automatic logging of all bugs, fixes, modifications, and feature additions into `REVISION_LOG.md`.
> **Target File**: [REVISION_LOG.md](../../REVISION_LOG.md)

---

## Trigger Condition
Whenever the user sends a prompt that contains any of the following trigger keywords:
- **Bug**
- **Fix**
- **Modification**
- **Add** (or **Added** / **Additional**)
- **Remove** (or **Removed**)

---

## Mandatory Action Protocol

The agent **MUST** automatically document the change in [REVISION_LOG.md](../../REVISION_LOG.md).

Every entry must strictly adhere to the standardized 4-part structure:

### `### N. Title (Classification: Bug / Fix / Modification / Add)`
- **Current State**: Exact description of how the system/UI/code functioned before the revision.
- **The Problem**: The technical, operational, or UX failure that necessitated the change.
- **What to Do (Solution)**: The precise architectural, logic, or design solution implemented.
- **Result**: The measured outcome, error reduction, or improved experience after the change.
- **Cross-Project Takeaway (SaaS / E-Commerce)**: Generalizable principle and pattern applicable to other platforms.

---

## Autonomous Agent Instructions
1. Never omit any of the 4 structural sections.
2. Maintain sequential numbering in the Quick Reference Index and body sections.
3. Verify that the documented code changes pass typechecks and build tests before committing.
