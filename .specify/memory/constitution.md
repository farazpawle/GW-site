<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles: none (initial definition)
- Added sections: Core Principles, Constraints & Quality Standards, Delivery Workflow & Review Process, Governance
- Removed sections: none
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md (Constitution Check references generic gates)
	- ✅ .specify/templates/spec-template.md (user stories, requirements, success criteria align with MVP‑first principle)
	- ✅ .specify/templates/tasks-template.md (tasks grouped by user story and phases, supports independence and MVP delivery)
- Deferred TODOs:
	- TODO(RATIFICATION_DATE): Set to actual initial adoption date if different from 2025-11-14
-->

# Garrit & Wulf Platform Constitution

## Core Principles

### I. Business‑First, MVP‑First Delivery

The platform exists to grow Garrit & Wulf’s business. Every change MUST
be justified by clear user or business value (e.g., lead generation,
conversion, product discovery, trust, or operations efficiency). Work is
organized as independently shippable vertical slices (MVPs) that can be
designed, implemented, tested, and deployed in isolation.

Decisions MUST prioritize:

- Clear value over speculative architecture.
- Shipping a small, coherent MVP over starting multiple unfinished tracks.
- Maintaining a working production system at all times.

### II. Safety, Security & Data Integrity (NON‑NEGOTIABLE)

Protection of user data, system integrity, and production stability is
non‑negotiable. All work MUST:

- Respect the database safety rules defined in `.github/copilot-instructions.md`.
- Avoid destructive commands and irreversible schema operations without
  explicit backup, migration, and rollback plans.
- Validate and sanitize all user‑supplied data at boundaries (API,
  forms, background jobs).
- Preserve auditability: errors and important actions MUST be logged in
  a way that is useful for debugging and incident review.

Any change that can affect data or auth MUST include a clear rollback
strategy and MUST NOT be merged without review.

### III. Test‑Backed Changes

New functionality or regressions fixes SHOULD be backed by automated
tests whenever practical. For core flows (auth, RBAC, CMS editing,
checkout/search, analytics pipelines), tests are strongly preferred and
MUST be added when work significantly alters behavior or fixes a bug.

Guidance:

- Prefer fast, focused tests near the logic being changed.
- When the repo has an existing pattern for a feature area, follow it
  (e.g., Jest tests in existing folders, integration tests in
  `__tests__/integration`).
- Tests SHOULD clearly express the user scenario and expected outcome,
  not internal implementation details.

### IV. Progressive Enhancement & UX Quality

The public site and admin experience MUST remain usable and clear
across devices and failure modes.

Changes MUST:

- Preserve or improve responsiveness and accessibility.
- Avoid breaking core navigation and content discovery flows.
- Keep admin tools understandable for non‑engineers (clear labels,
  inline help text where needed, minimal surprise in UI behavior).

UI/UX debt may be accepted temporarily but MUST be tracked explicitly
in tasks/specs and cleaned up within a reasonable timeframe.

### V. Maintainability, Clarity & Minimalism

The codebase MUST favor clarity and maintainability over cleverness.

All contributions MUST:

- Follow existing project conventions (Next.js App Router, TypeScript,
  Prisma, Tailwind, docs structure under `docs/` and `memory-bank/`).
- Keep files focused; avoid large “god objects” or files that do
  everything.
- Prefer explicit, well‑named functions and components over
  over‑general abstractions.
- Include minimal, targeted logging that aids debugging without
  exposing secrets.

Refactors are welcome when they decrease complexity, improve
consistency, or remove duplication while preserving behavior.

## Constraints & Quality Standards

This section defines cross‑cutting constraints that every change MUST
respect.

- **Database Safety**: All schema changes go through `prisma/schema.prisma`
  and safe migration commands. Forbidden operations in
  `.github/copilot-instructions.md` MUST NOT be used.
- **Documentation Discipline**: Significant features, migrations, or
  workflow changes MUST be reflected in the `docs/` hierarchy and, when
  relevant, in `memory-bank/` so future work can continue without lost
  context.
- **Performance Awareness**: Homepage, search, and key admin screens
  MUST remain performant. Obvious N+1 queries or heavy operations in
  request paths MUST be avoided or mitigated.
- **Security Hygiene**: Secrets MUST NOT be committed. Environment
  variables are configured through Docker or `.env.*` templates only.

## Delivery Workflow & Review Process

The following workflow governs how work moves from idea to production.

1. **Clarify & Specify**
   - For non‑trivial work, use Spec Kit (`/speckit.specify`,
     `/speckit.plan`, `/speckit.tasks`) to capture user stories,
     requirements, and a concrete plan.
   - Align stories and success criteria with the business‑first,
     MVP‑first principle.

2. **Plan Against the Constitution**
   - The "Constitution Check" section in `plan-template.md` MUST be
     used to record any deliberate violations of these principles,
     along with justification and alternatives considered.

3. **Implement in Vertical Slices**
   - Implement features slice‑by‑slice following the generated tasks.
   - Each story should be independently testable and, where sensible,
     independently deployable.

4. **Review & Quality Gates**
   - Every PR MUST:
     - Explain the business/user value.
     - Note any principle violations and their justifications.
     - Include tests or rationale when tests are omitted.
   - Reviewers MUST enforce alignment with this constitution and the
     database safety rules.

5. **Deploy & Document**
   - On merge, ensure deployment steps documented in `docs/06-Deployment`
     are followed.
   - Update docs and memory bank as needed so future work starts from a
     fully informed state.

## Governance

This constitution supersedes ad‑hoc practices when conflicts arise. When
in doubt, the constitution and `.github/copilot-instructions.md` are the
shared source of truth for how we work on the Garrit & Wulf platform.

- **Amendments**: Any material change to principles, constraints, or
  workflow MUST be:
  - Captured as an update to this document.
  - Accompanied by a short rationale in the PR description.
  - Version‑bumped according to semantic versioning (MAJOR/MINOR/PATCH).
- **Versioning Policy**:
  - **MAJOR**: Removal or redefinition of core principles; changes that
    significantly alter how work is governed.
  - **MINOR**: Addition of new principles or substantial expansion of
    guidance.
  - **PATCH**: Clarifications, wording tweaks, typo fixes that do not
    change meaning.
- **Compliance Review**: Reviewers are responsible for checking PRs
  against this constitution. Violations MUST be explicitly acknowledged
  and justified, not silently accepted.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Set true initial adoption date | **Last Amended**: 2025-11-14
