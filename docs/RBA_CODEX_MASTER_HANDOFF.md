# RBA PROPERTY — CODEX MASTER HANDOFF

## Purpose

This file is the operating brief for Codex. It defines how the RBA Property website should be built, which documents are authoritative, which skills should influence implementation, and when Codex must stop for review instead of continuing autonomously.

## Project

**Product:** RBA Property  
**Website type:** Premium Bali property catalogue + company profile  
**Visual direction:** Contemporary Tropical Estate  
**Experience sequence:** Desire → Imagine → Trust → Explore → Inquire

The site must feel exclusive, calm, architectural, and trustworthy while remaining fast and usable on ordinary mobile devices.

---

## Source-of-truth documents

Read these before making implementation decisions:

1. `RBA_PROPERTY_DESIGN.md`
   - Brand and visual source of truth.
   - Canonical palette.
   - Typography direction.
   - Spacing, radii, motion, photography, accessibility, anti-slop rules.
   - If a generic skill recommendation conflicts with this file, **this file wins**.

2. `RBA_HOMEPAGE_UX_BLUEPRINT.md`
   - Homepage information architecture and UX source of truth.
   - Section order.
   - Search behavior.
   - Responsive behavior.
   - Component tree direction.
   - Motion map.
   - Performance targets.

3. This file: `RBA_CODEX_MASTER_HANDOFF.md`
   - Workflow and engineering governance.

Do not reinterpret accepted brand decisions unless there is a concrete usability, accessibility, performance, or implementation problem. Flag the problem instead of silently changing the design.

---

## Skill hierarchy

Skills are advisors, not equal authorities.

Priority:

```text
1. Project source-of-truth MD files
2. Accessibility / performance requirements
3. Vercel React Best Practices
4. Web Design Guidelines
5. Taste Skill v2
6. UI UX Pro Max
7. Library defaults
```

### Important conflict rule

If Taste Skill or UI UX Pro Max recommends generic luxury patterns such as:
- black + gold,
- heavy glassmorphism,
- excessive bento grids,
- serif everywhere,
- mandatory GSAP,
- decorative motion,

ignore that recommendation when it conflicts with `RBA_PROPERTY_DESIGN.md`.

---

## Intended engineering stack

Baseline:

```text
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui primitives
Motion
Motion Primitives selectively
PostgreSQL / Supabase later
Vercel deployment
```

### Architecture

- React Server Components by default.
- `"use client"` only at interactive leaves.
- Keep motion wrappers isolated.
- URL-driven property search/filter state.
- Use `next/image`.
- Use `next/font` or properly licensed self-hosted web fonts.
- Avoid global state until justified.
- Avoid heavy dependencies where browser/platform capabilities are sufficient.

### Smoothness policy

Native browser scrolling is the baseline.

Do **not** install Lenis automatically.

Lenis may be evaluated later as a progressive desktop enhancement only if:
- it provides a visible UX improvement,
- it does not degrade touch behavior,
- it respects reduced motion,
- it does not introduce scroll bugs,
- it does not meaningfully hurt performance.

Do not add GSAP, Three.js, WebGL, or autoplay hero video by default.

---

## Performance principles

The website should feel smooth because it is efficient, not because it hides inefficiency behind animation.

Targets:

```text
LCP < 2.5 s
INP < 200 ms
CLS < 0.1
```

Priorities:

1. Small client bundle.
2. Optimized responsive imagery.
3. Stable layouts.
4. Minimal font payload.
5. Transform/opacity-based animation.
6. Lazy-load non-critical media.
7. Avoid unnecessary client hydration.
8. Test on mobile, not only desktop.

---

## Typography

Production target:
- Söhne for UI / grotesk.
- Tiempos Text for selective editorial serif moments.

These are commercial fonts. Do not download, bundle, or imitate proprietary font files without valid licensing.

Until licensed assets are supplied, prototype with:
- Geist as sans fallback.
- Newsreader as serif fallback.

Do not permanently substitute a random "luxury serif" without review.

---

## Content policy for implementation

Do not invent:
- fake awards,
- fake testimonials,
- fake client counts,
- fake years of experience,
- legal guarantees,
- property ownership claims,
- fake addresses,
- fake transaction statistics.

Dummy property data is permitted only when clearly kept in development fixtures and easily replaceable.

---

## Working method

Codex should work in phases.

For each phase:

1. Read the relevant source-of-truth documents.
2. Inspect the current repository before editing.
3. State the files/components that will be touched.
4. Identify contradictions or missing inputs.
5. Make the smallest coherent implementation.
6. Run available checks/tests.
7. Summarize what changed.
8. Stop at the phase boundary when review is requested.

Do not redesign unrelated sections while implementing one feature.

---

## First interaction behavior

On the first project pass:

**DO NOT CODE YET.**

Instead:

1. Read all provided RBA markdown briefs.
2. Verify installed skills and project environment.
3. Inspect the repository if one already exists.
4. Summarize your understanding of:
   - brand direction,
   - UX architecture,
   - stack,
   - performance strategy,
   - motion strategy.
5. List any contradictions between skills and the project brief.
6. List missing inputs, separating:
   - blockers,
   - non-blocking items that can use fixtures.
7. Propose a phase-by-phase implementation plan.
8. Recommend any changes only when there is a concrete reason.
9. Wait for approval before scaffolding or writing production code.

---

## Expected first-response format from Codex

```text
A. Understanding
B. Constraints I will preserve
C. Skill / brief conflicts found
D. Missing inputs
E. Proposed architecture
F. Implementation phases
G. Performance risks
H. Questions that actually block Phase 1
I. Confirmation: no code changed yet
```

Keep questions limited to true blockers. Do not ask for information that can safely use a temporary fixture.

---

## Design acceptance rule

A page is not accepted merely because it looks attractive.

It must also:
- remain understandable without animation,
- work on mobile,
- preserve brand hierarchy,
- have proper keyboard/focus behavior,
- use real semantic HTML,
- avoid unnecessary JavaScript,
- handle long content and prices,
- keep search state shareable when applicable,
- not look like a generic AI-generated luxury template.

---

## Final principle

**The project brief defines the taste. Skills expand capability; they do not override the taste.**
