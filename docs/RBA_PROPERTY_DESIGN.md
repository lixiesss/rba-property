# RBA PROPERTY — DESIGN.md

**Status:** Brand direction accepted / source of truth v1.0  
**Direction:** Contemporary Tropical Estate  
**Core idea:** Quiet luxury rooted in Bali’s architecture, landscape, and materials.

---

## 1. Brand Read

RBA Property is a premium Bali property catalogue and company profile. The interface should feel aspirational at first glance, then become increasingly rational, trustworthy, and useful as the user moves toward search, property detail, and inquiry.

**Desired attributes**
- Aspirational
- Refined
- Architectural
- Trustworthy
- Place-driven
- Calm
- Contemporary
- Premium without looking decorative or flashy

**Avoid**
- Generic black + gold luxury
- Heavy resort styling
- Tech/SaaS visual language
- AI-purple gradients
- Excess glassmorphism
- Overuse of serif typography
- Excessive pills / rounded cards
- Decorative animation without purpose
- “Luxury” conveyed mainly through gold, glow, or shadow

---

## 2. Brand Governance

### Non-negotiables
1. One canonical palette only.
2. Warm Ivory must remain the dominant UI field.
3. Deep Teal is an accent, never the main foundation.
4. Muted Bronze is a micro-detail only.
5. Material-driven photography must carry more visual weight than decorative UI styling.
6. One focal point per section.
7. Motion must support hierarchy, storytelling, feedback, or state change.
8. The current RBA logo is treated as a placeholder brand asset and must not dictate the full visual system. A future logo rework is expected.

---

## 3. Canonical Color System

### Final palette

| Token | Name | Hex | Role |
|---|---|---:|---|
| `--ivory` | Warm Ivory | `#F3EFE7` | Primary background |
| `--sandstone` | Sandstone | `#C9B79D` | Secondary surface |
| `--espresso` | Espresso | `#332C26` | Main dark / strong heading / dark CTA |
| `--walnut` | Walnut | `#65503E` | Supporting depth / hover / detail |
| `--deep-teal` | Deep Teal | `#173F3D` | Strategic accent / selected state / primary brand accent |
| `--clay` | Clay | `#A6654E` | Character accent / editorial micro-highlight |
| `--bronze` | Muted Bronze | `#A68A68` | Luxury detail only |
| `--soft-black` | Soft Black | `#252523` | Body / UI text |

### Supporting UI neutrals

| Token | Hex | Role |
|---|---:|---|
| `--surface` | `#FBF9F5` | Elevated light surfaces |
| `--line` | `#DED8CE` | Borders / dividers |
| `--muted-text` | `#756F68` | Secondary text |
| `--white` | `#FFFFFF` | High-contrast surface where needed |

### Usage ratio

- 60% Warm Ivory
- 20% Sandstone / light stone surfaces
- 12% Espresso + Walnut
- 6% Deep Teal
- 2% Clay + Muted Bronze combined

### Color behavior

**Primary CTA:** Deep Teal on Warm Ivory / white text  
**Alternate dark CTA:** Espresso on Warm Ivory / white text  
**Secondary CTA:** Transparent or Warm Ivory with Espresso border/text  
**Selected filter / active state:** Deep Teal  
**Editorial eyebrow / small highlights:** Clay, sparingly  
**Premium separator / icon detail:** Muted Bronze, sparingly

Never use Bronze as the default button, heading, border, or icon color across the site.

### CSS tokens

```css
:root {
  --ivory: #F3EFE7;
  --sandstone: #C9B79D;
  --espresso: #332C26;
  --walnut: #65503E;
  --deep-teal: #173F3D;
  --clay: #A6654E;
  --bronze: #A68A68;
  --soft-black: #252523;

  --surface: #FBF9F5;
  --line: #DED8CE;
  --muted-text: #756F68;
  --white: #FFFFFF;
}
```

---

## 4. Typography

### Preferred type system

**Editorial serif:** Tiempos Text  
Use for:
- Selected hero statements
- Large editorial section headings
- Quotes / brand statements
- Occasional property storytelling moments

**Clean grotesk:** Söhne  
Use for:
- Navigation
- Search and filters
- Body copy
- Property metadata
- Buttons
- Form fields
- FAQ
- Contact
- Price / measurements

> Production use requires valid font licensing. Do not bundle commercial font files without a license.

### Prototype fallback if licenses are not yet available
- Serif: `Newsreader`
- Sans: `Geist`

These are temporary implementation substitutes, not the final brand typography.

### Typography principle

Premium does **not** come from mixing many fonts. Use the serif selectively. Most of the interface should remain clean, neutral, and grotesk-led.

### Type scale

```text
Hero Display      56–88 px desktop / 42–56 px mobile
Section Display   44–64 px desktop / 34–44 px mobile
H2                34–44 px
H3                24–32 px
Body Large        18–20 px
Body              16 px
UI / Label        14–15 px
Caption / Meta    12–13 px
```

### Line height / tracking

- Hero serif: `0.96–1.05`
- Display sans: `1.00–1.08`
- Body: `1.55–1.70`
- UI: `1.35–1.45`
- Meta uppercase: modest tracking, `0.08–0.14em`
- Avoid exaggerated letter spacing

### Weight usage

Keep the system restrained:
- Regular
- Medium
- Semibold

Avoid defaulting to bold 700 for hierarchy.

---

## 5. Layout System

### Container

```text
Maximum content width: 1280–1360 px
Desktop side padding: 40–64 px
Tablet side padding: 28–36 px
Mobile side padding: 18–24 px
```

### Spacing scale

Use an 8-point rhythm with 4 px micro-spacing.

```text
4
8
12
16
24
32
48
64
80
96
112
128
```

### Section rhythm

Desktop:
- Standard section: 96–128 px vertical
- Major storytelling section: 128–160 px
- Utility section: 64–80 px

Mobile:
- Standard section: 64–88 px
- Major storytelling section: 88–112 px
- Utility section: 48–64 px

### Composition

Prefer:
- Large image + text split
- Editorial offset compositions
- Asymmetric but calm image grids
- Full-bleed visual chapters where photography deserves it
- Clear visual hierarchy

Avoid:
- Three identical cards for every section
- Dense boxed sections
- Decorative bento grids without a content reason
- Centering every section

---

## 6. Surfaces, Radius, Border, Shadow

### Radius

```text
Buttons          8–10 px
Inputs           8–10 px
Property cards   10–12 px
Large media      12–16 px
Filter chips     pill allowed
```

Do not use 24–32 px rounded corners everywhere.

### Borders

Use quiet structural lines.

```text
1 px solid var(--line)
```

Avoid strong gray outlines around every object.

### Shadows

Default: none.

Use only for:
- Floating hero search
- Dropdown menus
- Modal / morphing dialog
- Sticky mobile actions

Shadow should be broad, soft, and low-opacity.

---

## 7. Iconography

Preferred characteristics:
- Thin to medium stroke
- Geometric
- Precise
- Minimal
- One icon family per project

Suggested:
- Phosphor
- Radix Icons
- Tabler if needed

Standardize icon sizing and stroke weight.

Avoid:
- Emoji
- Mixed icon families
- Decorative custom icons unless part of the brand identity
- Gold icons by default

---

## 8. Photography Direction

Photography is one of the strongest brand assets.

### 8.1 Hero / Emotional
Focus on:
- Architecture integrated with landscape
- Ocean, cliff, rice field, jungle
- Natural light
- Golden hour without excessive orange grading
- Strong depth and calm composition

### 8.2 Architectural Detail
Use crops of:
- Limestone
- Stone
- Timber
- Concrete
- Linen
- Water
- Shadow
- Local craftsmanship

### 8.3 Lifestyle
People should feel natural and contextual:
- Walking through property
- Looking outward from balcony
- Entering a garden
- Sitting in an architectural space

Avoid stock-photo behavior and direct-to-camera posing.

### Image treatment
- Natural warm grade
- Moderate contrast
- Controlled greens
- No excessive HDR
- No oversaturated turquoise
- No permanent dark overlay on all images

The site should sell **what it feels like to live there**, not just room dimensions.

---

## 9. UI Components

### Navigation
Desktop:
- Minimal horizontal navigation
- Logo small and controlled
- One primary CTA
- Transparent over hero only when contrast is guaranteed
- Solid / blurred surface after scroll if necessary

Mobile:
- Compact logo
- Menu button
- Full-height or large-sheet navigation
- No excessive animated menu choreography

### Buttons

Primary:
```text
Deep Teal background
Warm Ivory / White text
8–10 px radius
```

Secondary:
```text
Transparent / Warm Ivory
Espresso text
1 px Espresso or Line border
```

Interaction:
- subtle color shift
- optional arrow translation 2–4 px
- active scale around 0.98
- no glow

### Search
Desktop:
- High-priority hero utility
- Location
- Property type
- Price range
- Optional expanded filters

Mobile:
- Search summary + “Filters”
- Filters open in bottom sheet / drawer
- Do not compress many dropdowns into a narrow horizontal row

### Property card
Must prioritize:
1. Property image
2. Property name
3. Location
4. Essential facts
5. Price

Avoid:
- Large colored card backgrounds
- Too many badges
- Excess icons
- Repeating “premium/luxury” labels

### FAQ
- Border-separated rows
- No boxed cards for every item
- Simple plus/minus or chevron
- Smooth height/opacity transition

### Property Detail
Priority:
- Cinematic gallery
- Name + location
- Price
- Key facts
- Narrative
- Property details
- Location
- Similar properties
- Inquiry CTA

Desktop: inquiry CTA may be sticky.  
Mobile: persistent bottom CTA is acceptable if unobtrusive.

---

## 10. Motion Language

### Principle

Motion should feel calm, weighted, and almost invisible.

Use Motion Primitives / Motion only when it improves:
- hierarchy
- storytelling
- feedback
- state transition

### Core easing

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

### Timing

```text
Micro interaction      140–180 ms
Hover / UI state       180–240 ms
Card / menu transition 260–360 ms
Section reveal         500–700 ms
Hero image settle      800–1100 ms
```

### Approved motions

**Section reveal**
```text
opacity: 0 → 1
translateY: 18–24 px → 0
```

**Property card stagger**
```text
60–90 ms between items
```

**Hero image**
```text
scale: 1.02–1.03 → 1
opacity: .92 → 1
```

**Hover image**
```text
scale: 1 → 1.02
```

**Dialog / gallery**
Use morphing or layout transition where it explains continuity.

### Avoid

- Scroll hijacking
- Forced smooth-scroll library by default
- Endless marquee
- Text shimmer
- Spinning typography
- Heavy parallax
- Animating width/height/top/left when transform/opacity can be used
- Animating every section just because it exists

Respect `prefers-reduced-motion`.

---

## 11. Responsive Behavior

### Breakpoints

```text
sm   640
md   768
lg   1024
xl   1280
2xl  1536
```

### Responsive principles

- Mobile is not a shrunk desktop layout.
- Reduce visual density before reducing text size.
- Stack editorial split layouts below tablet where necessary.
- Property grids:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3–4 columns depending on context
- Use `min-height: 100dvh` for full-height hero behavior.
- Avoid horizontal overflow.
- Ensure long property names and prices reflow gracefully.

---

## 12. Accessibility

Required:
- Text contrast meets WCAG AA where applicable.
- Visible keyboard focus.
- Full keyboard access for filters, dialogs, navigation, FAQ.
- Semantic buttons/links/forms.
- `aria` only where native semantics are insufficient.
- `prefers-reduced-motion` respected.
- Images use meaningful alt text when informative.
- Decorative imagery can use empty alt.
- Touch targets should generally be at least 44 × 44 px.
- Do not use color as the only indicator of state.

---

## 13. Information Architecture

### Core pages

```text
/
├── /properties
│   └── /properties/[slug]
├── /about
├── /faq
└── /contact
```

Potential later expansion:
```text
/locations/[slug]
/property-type/[slug]
/insights
```

### Homepage order

1. Hero + primary statement
2. Smart search
3. Featured properties
4. Brand / company positioning
5. Selected destinations or property categories
6. Trust / process
7. FAQ teaser
8. Contact / inquiry CTA
9. Footer

The homepage should not display every possible trust icon or service above the fold.

---

## 14. Search UX

Search state should be URL-addressable.

Example:

```text
/properties?location=canggu&type=villa&minPrice=5000000000&maxPrice=15000000000
```

Benefits:
- Shareable results
- Browser back/forward works
- SEO-friendly state
- Easier deep linking

MVP filtering can be powered by PostgreSQL / Supabase. Dedicated search infrastructure is unnecessary until inventory and requirements justify it.

---

## 15. Recommended Frontend Stack

```text
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui primitives
Motion
Motion Primitives
PostgreSQL / Supabase
```

### Architecture rules

- Server Components by default.
- Add `"use client"` only at interactive leaves.
- Motion components should be isolated client components.
- Avoid global client state unless genuinely necessary.
- Use `next/image`.
- Use `next/font` for licensed/self-hosted fonts where permitted.
- Lazy-load maps and heavy secondary media.
- Keep JavaScript minimal.

No Lenis / GSAP / Three.js by default. Add only if a specific approved interaction requires them.

---

## 16. Anti-Slop Rules

Do not generate:
- AI-purple glow
- Generic black + gold luxury
- Playfair + generic sans pairing by default
- Repeated eyebrow-pill-heading-card section formula
- Glass cards across the page
- Every CTA as a pill
- Excessive rounded rectangles
- Random bento grids
- Decorative gradients without concept
- Multiple competing accent colors
- Too many trust badges
- Copy such as “Elevate your lifestyle”, “Unparalleled luxury”, “Seamless experience” unless specifically justified
- Fake awards or unverifiable claims

Use plain, specific copy.

---

## 17. Page Design Test

Before a page is approved, ask:

1. Is there one clear focal point?
2. Is the property imagery doing enough work?
3. Is Deep Teal being used sparingly?
4. Is Bronze barely noticeable?
5. Is the serif being used intentionally rather than decoratively?
6. Does the page remain premium without animation?
7. Does mobile preserve hierarchy instead of merely shrinking?
8. Can the user understand what to do next?
9. Is the interface trustworthy enough for a high-value property decision?
10. Does the page feel rooted in Bali without becoming a resort cliché?

If several answers are “no”, revise before adding more visual effects.

---

## 18. Brand Essence Summary

**RBA PROPERTY**  
**Contemporary Tropical Estate**

> Quiet luxury rooted in Bali’s architecture, landscape, and materials.

**Visual hierarchy:**  
Ivory dominates. Stone warms. Espresso anchors. Teal directs. Bronze whispers.

**Experience hierarchy:**  
Desire → Imagine → Trust → Explore → Inquire.
