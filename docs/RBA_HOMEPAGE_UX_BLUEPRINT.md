# RBA PROPERTY — Homepage UX Blueprint v1.0

**Brand direction:** Contemporary Tropical Estate  
**Experience principle:** Desire → Imagine → Trust → Explore → Inquire  
**Primary goal:** Help visitors quickly understand RBA, discover relevant properties, and initiate contact without sacrificing a premium visual experience.

---

# 1. Homepage UX Strategy

The homepage should not behave like a dense property portal. It should feel editorial and aspirational in the first screen, then progressively become more functional.

## Experience sequence

1. **Desire** — strong hero imagery and a concise positioning statement.
2. **Explore** — smart property search appears immediately after the emotional hook.
3. **Imagine** — featured listings and selected destinations help users picture possibilities.
4. **Trust** — company story, local expertise, process, and legal/transaction reassurance.
5. **Decide** — FAQ and property discovery paths remove uncertainty.
6. **Inquire** — clear WhatsApp/contact CTA at the end and on high-intent screens.

---

# 2. Global Navigation

## Desktop

Layout:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ RBA PROPERTY   Properties   Land   Villas   About   FAQ   Contact   CTA │
└─────────────────────────────────────────────────────────────────────────┘
```

### Behavior

- At top of homepage: transparent or near-transparent when hero contrast permits.
- After scroll: transitions to a subtle warm-ivory surface.
- Height: ~72–80 px.
- Logo/wordmark must remain restrained.
- Maximum one primary CTA: `Get in Touch` or `Talk to Us`.
- Avoid multiple competing CTA buttons in navigation.

### Suggested labels

- Properties
- Land
- Villas
- About
- FAQ
- Contact

Optional later:
- Locations
- Insights

## Mobile

```text
RBA PROPERTY                           [Menu]
```

- Header height around 64 px.
- Menu opens as a large sheet/full-height panel.
- Menu links remain simple; no theatrical stagger sequence.
- Primary CTA placed at bottom of menu.

---

# 3. Section 01 — Hero

## Goal

Make the visitor want to keep exploring within 3 seconds.

## Desktop composition

```text
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                                              │
│                                                                  │
│ BALI, INDONESIA                                                  │
│                                                                  │
│ Find a place                                                     │
│ worth calling yours.                                             │
│                                                                  │
│ Curated villas, land, and investment properties                 │
│ across Bali's most desirable locations.                          │
│                                                                  │
│ [ Explore Properties → ]                                         │
│                                                                  │
│                                  PROPERTY / LANDSCAPE IMAGE      │
│                                  dominant visual                 │
│                                                                  │
│                                           Uluwatu, Bali          │
└──────────────────────────────────────────────────────────────────┘
```

### Rules

- One headline only.
- No statistics, trust badges, or four service boxes inside the primary hero.
- Hero image must dominate.
- Keep copy width narrow.
- Prefer left-aligned content.
- The visual should feel architectural rather than like a hotel booking banner.

### Suggested copy direction

Eyebrow:
`BALI, INDONESIA`

Headline:
`Find a place worth calling yours.`

Supporting:
`Curated villas, land, and investment properties across Bali's most desirable locations.`

CTA:
`Explore Properties`

### Hero motion

On load:

1. Image settles from `scale(1.025)` to `1`.
2. Eyebrow fades.
3. Headline reveals by line, not by character.
4. Supporting text and CTA enter subtly.

No scroll hijacking.

---

# 4. Section 02 — Smart Search

## Goal

Turn inspiration into action without making the hero feel like a property portal.

## Desktop placement

The search panel should visually overlap the lower hero edge by a small amount.

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Location        Property Type        Price Range         [ Search ]  │
│ All Locations   All Types            Any Price                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Primary fields

1. Location
2. Property Type
3. Price Range

Optional shortcut:
- Buy / Lease toggle

Do **not** expose every possible filter here.

### Search action

Routes to:

```text
/properties?location=uluwatu&type=villa&minPrice=...
```

### Expanded filters belong on `/properties`

- Bedrooms
- Bathrooms
- Land size
- Building size
- Ownership
- Certificate
- Lease expiry
- Amenities
- Sort

---

# 5. Section 03 — Featured Properties

## Goal

Show actual inventory early enough to capture high-intent visitors.

## Structure

```text
FEATURED PROPERTIES

Exceptional properties
in remarkable locations.                    View All Properties →

[ Property ] [ Property ] [ Property ]
```

Desktop:
- 3 cards preferred.
- 4 cards only on very wide layouts if imagery remains large enough.

Tablet:
- 2 columns.

Mobile:
- One large card per row or controlled horizontal snap carousel.

## Property card hierarchy

```text
[ LARGE IMAGE ]

Villa for Sale

The Ridge Villa
Uluwatu, Bali

4 Beds · 4 Baths · 520 m²

IDR 18,500,000,000                     →
```

### Card rules

- Image carries ~60–70% of visual weight.
- Price is visually stronger than metadata but weaker than property title.
- Maximum one category badge.
- No unnecessary icon row.
- No visible shadow unless hover/floating context requires it.

### Hover

- Image zoom ~1.02.
- Arrow moves 2–4 px.
- Border or text darkens subtly.
- No card floating 10 px upward.

---

# 6. Section 04 — Brand Story / About RBA

## Goal

Transition from “beautiful properties” to “why RBA”.

## Layout

Asymmetric image + editorial copy.

```text
┌──────────────────────────┬──────────────────────────────────────┐
│                          │ ABOUT RBA PROPERTY                   │
│  architectural /         │                                     │
│  lifestyle image         │ More than properties.               │
│                          │ A better way to live in Bali.        │
│                          │                                     │
│                          │ Short, specific company story.       │
│                          │                                     │
│                          │ [ About RBA → ]                      │
└──────────────────────────┴──────────────────────────────────────┘
```

### Content direction

Avoid generic claims such as:
- unparalleled service
- luxury redefined
- elevate your lifestyle

Prefer specific statements:
- local market knowledge
- curated inventory
- property matching
- transparent support from discovery to transaction

---

# 7. Section 05 — Selected Locations

## Goal

Let users explore Bali spatially and create SEO-friendly future pathways.

Suggested initial locations:

- Canggu
- Uluwatu
- Ubud
- Seminyak
- Pererenan
- Tabanan

## Visual approach

Large editorial image grid rather than six equal cards.

Example:

```text
┌──────────────────────┬───────────────┐
│                      │ Ubud          │
│ Uluwatu              ├───────────────┤
│                      │ Canggu        │
├───────────────┬──────┴───────────────┤
│ Pererenan     │ Tabanan              │
└───────────────┴──────────────────────┘
```

Each location:
- Image
- Location name
- Property count when available
- Simple arrow

No decorative text overlay beyond what remains readable.

---

# 8. Section 06 — Why RBA / Trust

## Goal

Introduce trust without reverting to generic “four icon features”.

Instead of four equal boxes, use an editorial numbered structure.

```text
OUR APPROACH

Built on trust.
Designed for long-term value.

01  Local Expertise
    Deep understanding of Bali’s property market.

02  Curated Selection
    Properties selected for location, quality, and potential.

03  Clear Process
    Straightforward support from discovery to transaction.
```

Optional 4th:
`Long-Term Perspective`

## Styling

This can be one of the few dark sections.

Recommended:
- Espresso or Deep Teal field.
- Warm Ivory typography.
- Bronze micro-detail only.
- One material or architectural image.

---

# 9. Section 07 — Property Categories

## Goal

Support visitors who know the type of property they want.

Keep this optional if Featured Properties + Locations already feel sufficient.

Possible categories:

```text
Villas
Land
Investment Properties
```

Use 2–3 large image tiles, not six tiny category cards.

If homepage begins to feel long, remove this section rather than compress everything.

---

# 10. Section 08 — FAQ Teaser

## Goal

Reduce uncertainty without dumping all FAQ content on homepage.

Heading:
`Questions before you begin?`

Show 4–5 most important questions.

Example:

- Can foreigners buy property in Bali?
- What is the difference between freehold and leasehold?
- Can I schedule a property viewing?
- What documents are usually required?
- How does RBA assist during the transaction?

CTA:
`View all FAQs`

### Component

Border-separated accordion rows.

No boxed FAQ cards.

---

# 11. Section 09 — Final Contact CTA

## Goal

Convert visitors who have reached the end.

Recommended layout:

```text
A property should feel right
before the paperwork begins.

Tell us what you're looking for.

[ Talk to RBA on WhatsApp → ]
[ Contact Us ]
```

Use strong imagery or a restrained dark field.

WhatsApp may be the primary action.

Avoid:
- aggressive floating green WhatsApp widget covering content
- multiple contact buttons with equal hierarchy

---

# 12. Footer

## Structure

```text
RBA PROPERTY

Properties
Land
Villas
Locations

Company
About
FAQ
Contact

Contact
WhatsApp
Email
Office

Instagram / LinkedIn if relevant

Privacy
Terms
© RBA Property
```

Footer can use Espresso / dark neutral background.

---

# 13. Homepage Mobile Order

Mobile should preserve the same narrative but with lower density.

```text
01 Navbar
02 Hero
03 Smart Search Summary
04 Featured Properties
05 About RBA
06 Selected Locations
07 Trust / Approach
08 FAQ
09 Contact CTA
10 Footer
```

## Mobile hero

- Image aspect ratio should not create a massive 100vh dead zone.
- Use `min-height` strategically, not blindly.
- Headline around 42–52 px depending on viewport.
- CTA visible without requiring excessive scroll.

## Mobile smart search

Do not show three desktop dropdowns squeezed horizontally.

Recommended:

```text
Where are you looking?

[ Location                ]
[ Property Type           ]
[ Price Range             ]

[ Search Properties      ]
```

Or:

```text
[ Search properties... ]

[ Filters ]
```

If expanded, open in bottom sheet.

---

# 14. Component Tree

Suggested initial Next.js structure:

```text
app/
├── page.tsx
├── properties/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── about/
│   └── page.tsx
├── faq/
│   └── page.tsx
└── contact/
    └── page.tsx

components/
├── layout/
│   ├── Header.tsx
│   ├── MobileMenu.tsx
│   └── Footer.tsx
│
├── home/
│   ├── Hero.tsx
│   ├── HeroMotion.tsx
│   ├── PropertySearch.tsx
│   ├── FeaturedProperties.tsx
│   ├── BrandStory.tsx
│   ├── Locations.tsx
│   ├── Approach.tsx
│   ├── FaqPreview.tsx
│   └── ContactCTA.tsx
│
├── property/
│   ├── PropertyCard.tsx
│   ├── PropertyGrid.tsx
│   ├── PropertyGallery.tsx
│   └── PropertyMeta.tsx
│
└── ui/
    ├── Button.tsx
    ├── Select.tsx
    ├── Sheet.tsx
    ├── Accordion.tsx
    └── ...
```

Server Components remain default.

Only interactive components become client leaves:
- Search controls
- Mobile menu
- Accordion
- Gallery interaction
- Filter drawer
- Motion wrappers where required

---

# 15. Motion Map

## Header
- Background transition after scroll.
- No continuous heavy calculations.

## Hero
- Image settle.
- Text line reveal.
- CTA fade.

## Search
- Soft entry after hero.
- Dropdown state animation.

## Property Cards
- Small stagger on first viewport entry only.
- Hover image scale.

## About
- Image/text reveal independently.

## Locations
- Gentle opacity/translate entrance.
- No parallax by default.

## FAQ
- Height/opacity state animation.

## Dialog / Gallery
- Morphing transition where useful.

---

# 16. Native Scroll vs Lenis Test

Baseline must be native scroll.

Create two prototype branches:

### A. Native
- CSS `scroll-behavior` only where appropriate.
- Motion tied to viewport entry, not scroll position.

### B. Lenis desktop enhancement
Enable only for:
- fine pointer devices
- non-reduced-motion users
- adequate browser support

Pseudo-strategy:

```text
if pointer=fine
and prefers-reduced-motion=no-preference
then optionally initialize Lenis
else native scroll
```

Acceptance criterion:

Lenis stays only if:
- scroll actually feels better
- no touch regressions
- no accessibility regression
- no measurable meaningful performance penalty

Otherwise remove it.

---

# 17. Homepage Performance Budget

## Initial page

Targets:

```text
LCP < 2.5 s
INP < 200 ms
CLS < 0.1
```

## Media

Hero:
- one responsive hero image
- AVIF/WebP where supported
- preload only the true LCP image

Featured cards:
- lazy load below initial viewport
- correct `sizes`

Avoid:
- autoplay video hero by default
- large map on homepage
- oversized original camera assets

## Fonts

Maximum:
- 2 families
- 2–3 practical weights each
- self-hosted only with valid licensing

Prototype:
- Newsreader
- Geist

Production target:
- Tiempos
- Söhne

---

# 18. Copy Tone

The copy should be:

- concise
- calm
- specific
- informed
- never overexcited

Use:
`Properties selected for location, quality, and long-term potential.`

Avoid:
`Discover unparalleled luxury and elevate your lifestyle in paradise.`

---

# 19. Homepage Success Criteria

The homepage is ready for production when:

- Brand is recognizable without relying on the old logo.
- Hero is visually strong without animation.
- Property search is understandable in under 5 seconds.
- Featured listings expose real inventory quickly.
- RBA's role is clear.
- Mobile feels designed, not collapsed.
- No section feels like a generic AI landing-page block.
- Photography is doing more visual work than decoration.
- Search, cards, menu, FAQ, and CTA work with keyboard/touch.
- The experience still feels premium on a mid-range mobile device.

---

# 20. Next Production Inputs

To move from blueprint → implementation, collect:

1. 6–10 representative properties
2. 15–25 representative property images
3. RBA company profile copy
4. WhatsApp number / email / contact route
5. Areas served
6. Initial FAQ content
7. Language decision: EN, ID, or bilingual
8. Preferred CMS workflow
9. Commercial font licensing status
10. Temporary/final logo asset
