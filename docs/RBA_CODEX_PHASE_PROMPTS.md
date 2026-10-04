# RBA PROPERTY — CODEX PHASE PROMPTS

Use these prompts sequentially. Do not paste all phases at once. Each phase intentionally has a review gate.

---

# PROMPT 0 — Install / Verify Skills

Use this after opening the RBA project directory in Codex.

```text
Before touching application code, verify the coding-agent skills available in this project.

The project will use:
- Taste Skill v2 / design-taste-frontend
- UI UX Pro Max for Codex
- Vercel React Best Practices
- Vercel Web Design Guidelines

Do not install gpt-taste, high-end-visual-design, Lenis, GSAP, Three.js, or extra design systems at this stage.

Verify the installed files/skill names and report:
1. which skills are active,
2. where they were installed,
3. any overlap or contradictions between them,
4. how you will resolve conflicts using RBA_CODEX_MASTER_HANDOFF.md.

Do not scaffold or edit the website yet.
```

---

# PROMPT 1 — Read the Briefs / No Code

Attach or place these files in the repository first:

- `RBA_CODEX_MASTER_HANDOFF.md`
- `RBA_PROPERTY_DESIGN.md`
- `RBA_HOMEPAGE_UX_BLUEPRINT.md`

Then send:

```text
Read RBA_CODEX_MASTER_HANDOFF.md, RBA_PROPERTY_DESIGN.md, and RBA_HOMEPAGE_UX_BLUEPRINT.md in full.

Do not write code yet.

Treat these files as accepted project decisions, not brainstorming material. Use the installed skills as supporting knowledge only.

Give me:
A. your understanding of the product and target user experience,
B. the visual/design constraints you will preserve,
C. your recommended technical architecture,
D. any conflict you found between the installed skills and our project rules,
E. performance risks you expect for an image-heavy property website,
F. missing inputs split into blockers vs non-blockers,
G. a proposed implementation sequence,
H. any recommendation you strongly believe we should change, with a concrete reason.

End by explicitly confirming that you have not changed files yet and wait for my approval.
```

### Review gate
Do not proceed until the response makes sense and preserves the accepted design direction.

---

# PROMPT 2 — Repository / Stack Bootstrap

Use only after Prompt 1 is approved.

```text
Proceed with Phase 1: repository and frontend foundation only.

Use the accepted architecture:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Server Components by default
- shadcn/ui only for primitives we actually need
- Motion available, but do not animate the page yet
- no Lenis
- no GSAP
- no database yet

Before editing, inspect the current repository and tell me whether you are extending an existing app or creating the scaffold.

Then implement only:
1. project structure,
2. global CSS/design tokens from RBA_PROPERTY_DESIGN.md,
3. prototype font setup using Geist + Newsreader unless licensed fonts already exist,
4. root layout and metadata structure,
5. base container/spacing utilities,
6. minimal Header/Footer structural placeholders,
7. lint/type/build configuration.

Do not build the homepage sections yet.

Run relevant checks. Report files changed, dependencies added, bundle-impact concerns, and any deviations from the brief. Then stop for review.
```

---

# PROMPT 3 — Property Data Model / Fixtures

```text
Proceed with the property domain model before building listing UI.

Design a typed property schema that supports:
- title / slug,
- sale or lease,
- property type,
- location and district,
- coordinates,
- price and currency,
- bedrooms / bathrooms,
- land size / building size,
- ownership,
- lease expiry where applicable,
- certificate / zoning fields where applicable,
- description,
- features / amenities,
- hero image / gallery,
- featured flag,
- availability status.

Do not connect a database yet.

Create:
1. TypeScript domain types,
2. a small development fixture dataset,
3. helper functions for price/area display,
4. clear notes identifying which fields still need business confirmation.

Do not invent legal meanings. If ownership/certificate terminology is uncertain, preserve it as neutral data fields and flag it.

Show me the proposed model and implementation summary, then stop for review.
```

---

# PROMPT 4 — Core UI Primitives

```text
Build the small reusable UI system needed for the homepage and property catalogue.

Follow RBA_PROPERTY_DESIGN.md exactly. Do not use default shadcn styling unchanged.

Implement only primitives we need, likely:
- Button,
- form field/input,
- Select or combobox foundation,
- Sheet/Drawer,
- Accordion,
- basic modal/dialog if needed,
- focus states,
- loading/skeleton treatment.

Rules:
- Warm Ivory dominant.
- Deep Teal controlled.
- Bronze nearly absent.
- restrained radius.
- minimal shadows.
- no glassmorphism.
- accessible keyboard behavior.
- no decorative animation yet.

Use shadcn/Radix as behavior foundations where appropriate, but restyle them to RBA.

Run checks and provide a component inventory plus screenshots/previews if your environment supports them. Stop for review.
```

---

# PROMPT 5 — Homepage Static Composition

```text
Build the homepage visual composition from RBA_HOMEPAGE_UX_BLUEPRINT.md.

For this phase, prioritize static design and responsive layout. Do not add Lenis or complex motion.

Implement:
1. Header
2. Hero
3. Smart Search shell
4. Featured Properties using fixture data
5. RBA brand story section
6. Selected Locations
7. Trust / Approach section
8. FAQ preview
9. Final contact CTA
10. Footer

Use actual fixture content, not lorem ipsum.

Important:
- one focal point per section,
- property photography should carry visual weight,
- do not turn every section into cards,
- do not center every section,
- do not overuse serif,
- do not add generic luxury copy,
- mobile must be intentionally composed.

After implementation, audit the result against Taste Skill and UI UX Pro Max, but do not automatically apply their suggestions. Only recommend changes consistent with our source-of-truth brief.

Run build/type/lint checks and stop for visual review.
```

---

# PROMPT 6 — Motion Pass

```text
The static homepage has been visually approved. Now add the motion layer.

Use Motion / Motion Primitives selectively according to RBA_PROPERTY_DESIGN.md.

Approved behavior includes:
- hero image settle,
- line-based hero text reveal,
- gentle section entrance,
- small property-card stagger,
- subtle image hover scale,
- FAQ state transition,
- restrained menu/dialog transitions.

Do not:
- animate every element,
- use text shimmer,
- use spinning text,
- use marquee,
- add scroll hijacking,
- add GSAP,
- add Lenis yet,
- animate layout properties when transform/opacity works.

Respect prefers-reduced-motion.

After implementation, report every animation added and justify each one in one sentence. Include performance implications and stop for review.
```

---

# PROMPT 7 — Native Scroll vs Lenis Evaluation

```text
Do not install Lenis yet.

First audit the current homepage scrolling and animation performance.

Tell me:
1. whether native scrolling currently feels technically sufficient,
2. what specific UX issue Lenis would solve,
3. expected bundle/runtime cost,
4. touch/mobile risks,
5. reduced-motion implications,
6. whether Lenis is justified at all.

If and only if you recommend testing it, propose an isolated progressive-enhancement experiment for fine-pointer desktop devices. Do not implement it until I approve the experiment.

Native mobile scrolling must remain the baseline.
```

---

# PROMPT 8 — Properties Catalogue + Smart Filters

```text
Build /properties using the accepted property schema.

Requirements:
- URL-driven filters,
- shareable/deep-linkable state,
- desktop filter bar,
- mobile filter sheet/drawer,
- property grid,
- result count,
- sorting,
- empty state,
- responsive behavior,
- keyboard accessibility.

Initial filters:
- location,
- property type,
- listing type,
- price range.

Prepare the architecture so bedrooms, size, ownership, etc. can be added later without redesigning the page.

Do not add a dedicated search service unless the fixture/data size demonstrates a real need.

Run the Vercel React Best Practices and Web Design Guidelines review after implementation. Fix high-impact issues, summarize remaining findings, and stop for review.
```

---

# PROMPT 9 — Property Detail

```text
Build /properties/[slug].

Priority order:
- cinematic but optimized image gallery,
- name/location/price,
- essential facts,
- narrative description,
- property detail table/list,
- location section,
- similar properties,
- inquiry CTA.

Desktop may use a restrained sticky inquiry area.
Mobile may use a bottom inquiry CTA if it does not obstruct content.

Optimize images aggressively and avoid loading the full gallery eagerly.

Add motion only where it clarifies continuity, such as gallery/dialog transitions.

Run performance/accessibility review and stop for approval.
```

---

# PROMPT 10 — About / FAQ / Contact

```text
Implement About, FAQ, and Contact using the same design system.

These pages should be simpler than the homepage and property detail page.

Avoid inventing company history, claims, team members, statistics, awards, legal assurances, addresses, or testimonials.

Use placeholders only where clearly marked as content needed from RBA.

Keep Contact conversion-focused, with WhatsApp as the likely primary CTA if the supplied business details confirm that choice.

Run checks and stop for content review.
```

---

# PROMPT 11 — Final Audit

```text
Perform a production-readiness audit without redesigning the accepted visual direction.

Use:
- Vercel React Best Practices,
- Web Design Guidelines,
- the project performance targets,
- RBA_PROPERTY_DESIGN.md.

Audit:
- bundle/client JS,
- Server vs Client Component boundaries,
- image loading,
- fonts,
- LCP/CLS/INP risks,
- keyboard/focus behavior,
- reduced motion,
- responsive overflow,
- URL filter state,
- semantic markup,
- metadata/SEO basics,
- broken/empty/loading states.

Return findings prioritized as:
P0 blocker
P1 high impact
P2 improvement
P3 optional polish

Fix P0/P1 issues that are safe and clearly within scope. List anything needing human/business input separately.

Do not add new animation libraries or redesign sections during the audit.
```
