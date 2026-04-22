# Sundown Studio Reverse-Engineering Design Doc

Inspection date: April 20, 2026
Target: https://sundown-ivory.vercel.app/

## 1. Executive Summary

This site looks premium because it combines a few high-impact visual devices:

- oversized editorial typography
- a warm neutral palette with a single hot orange accent family
- a cinematic hero video
- blurred organic "blob" shapes that keep the layout feeling alive
- a smooth-scroll wrapper that softens mouse-wheel movement
- sparse but large motion instead of dense micro-interactions

The important reverse-engineering takeaway is that the site is not driven by a complicated animation system. Most of the experience is built from straightforward HTML sections, CSS layout, CSS keyframes, a few hover interactions, and two off-the-shelf libraries:

- `locomotive-scroll` for smooth scroll behavior
- `swiper` for the client/logo carousel

`GSAP` and `ScrollTrigger` are loaded, but in the inspected script they are not actually used.

## 2. Tech Stack and Dependency Model

The deployed page is a static front end, not a framework-rendered application.

### Core stack

- HTML
- CSS
- vanilla JavaScript
- self-hosted local assets for fonts, video, and section images
- Vercel hosting and Vercel analytics scripts

### Third-party libraries loaded

- `locomotive-scroll@3.5.4`
- `swiper@11`
- `gsap@3.12.4`
- `ScrollTrigger@3.12.4`

### Actual runtime usage

- `LocomotiveScroll` is instantiated once on `#main`
- `Swiper` is instantiated once on `.mySwiper`
- `GSAP` and `ScrollTrigger` are unused in the inspected code

This matters because the site feels motion-heavy, but the implementation is comparatively lightweight in logic. The complexity is mostly in styling, not in animation orchestration.

## 3. Information Architecture

The page is one long-scroll landing page composed of stacked sections:

1. Loader
2. Hero / intro
3. Marquee + brand statement
4. Featured projects list
5. Capabilities tabs + client slider
6. Spacer section
7. Fixed footer reveal

The DOM is roughly structured like this:

```text
body
|- #loader
|- #fixed-image
|- #main
|  |- #bg4
|  |  |- #page1
|  |  |- #page2
|  |  |- #page3
|  |  |- #page4
|  |- #page5
|- #footer
```

Key architectural trick:

- `#footer` sits outside the main scroll container and is `position: fixed`
- `#page5` is an empty spacer block that creates enough scroll length for the footer to reveal at the end

That footer reveal is a classic "fake scroll reveal" pattern. The footer is not animated into place by JS; it is already fixed behind the content.

## 3.1 Selector and Section Map

| Selector | Role | Key technique | Reverse-engineering note |
| --- | --- | --- | --- |
| `#loader` | Intro overlay | fixed full-screen layer | Removed after 4 seconds with JS |
| `#main` | Scroll container | Locomotive smooth scroll target | All main content lives inside it |
| `#bg4` | Shared background wrapper | flat warm background | Groups pages 1 to 4 visually |
| `#page1` | Hero section | flex intro + video + blobs | Visual anchor of the whole site |
| `#hero-shape` | Hero decoration | absolute blurred gradients | Gives the hero ambient motion |
| `#page2` | Marquee + statement | nowrap marquee + split layout | Uses motion and editorial text balance |
| `#moving-line` / `.con` | Infinite ticker | duplicated inline blocks + keyframes | Fake infinite loop via repeated content |
| `#circle`, `#circle1`, `#circle2` | Background orb | blur + transform keyframes | Organic-looking movement from simple offsets |
| `#page3` | Featured work | hover rows + fixed preview | Premium feel comes from image detachment |
| `.elem` | Desktop project row | hover overlay + metadata split | Each row stores a preview image in `data-image` |
| `#fixed-image` | Project preview panel | fixed positioned background-image | Display toggled on hover |
| `#page4` | Capabilities + clients | black panel + slider | Most component-like section on the site |
| `#tabs` | Capabilities selector | click-based content swap | Simulates tabs without button semantics |
| `.swiper` | Client slider | Swiper drag carousel | `slidesPerView: auto` keeps it fluid |
| `#page5` | Spacer | empty vertical space | Exists only to reveal the footer properly |
| `#footer` | End-stage panel | fixed full-screen footer | Content scrolls away to expose it |

## 4. Visual Design System

### Color system

The palette is very narrow and deliberate:

- Background: `#EFEAE3`
- Primary text: near-black / black
- Accent orange-red: `#FE330A`
- Accent orange: `#FF9831`
- Muted brown-gray borders/text: `#504A45`, `#BFBBB6`, `#917e78dc`

Design effect:

- the page feels cohesive because almost every component reuses the same warm paper background and orange accent family
- orange is reserved for energy, motion, hover state, and decorative blobs
- black is used as a high-contrast anchor, mostly in typography and the large black capabilities panel

### Typography

Two custom fonts are loaded:

- `sun-roman` from `NeueHaasDisplay-Roman.ttf`
- `sun-mediu` from `NeueHaasDisplay-Mediu.ttf`

The typography strategy is editorial:

- huge uppercase headlines
- compressed line-height for impact
- large section titles instead of dense copy
- sparse body text with generous whitespace

Notable usage:

- hero headline at `10vw`
- marquee text at `9vw`
- project titles at `3vw`
- tab labels at `4.5vw`

Most of the premium feel comes from font choice, size, and spacing more than from complicated component design.

### Shape language

The site uses rounded forms consistently:

- pill navigation buttons
- rounded video corners
- blurred circular blobs
- rounded content cards/images
- softly rounded fixed hover image

This keeps the page tactile and organic, which offsets the otherwise rigid grid and oversized typography.

## 5. Layout System

### Page 1: Hero

The hero is split into two horizontal zones:

- top nav
- bottom intro block with left copy and right giant heading

Then three stacked visual layers sit under the intro:

- decorative orange blob cluster (`#hero-shape`)
- large autoplaying video
- base background color

Layout choices:

- `#center` uses `display: flex`
- left copy is constrained to `63%` width
- right headline is right-aligned and oversized
- bottom border under the intro creates a clean transition before the video

Why it works:

- the small paragraph on the left makes the right headline feel even larger
- the visual weight sits on the right, which creates asymmetry
- the blob background adds movement before the video even begins

### Page 2: Marquee + statement

This section has two layers:

- horizontally moving marquee line
- two-column brand statement area

The layout is intentionally unbalanced:

- large headline block on the left
- smaller image + paragraph on the right
- animated blurred circle behind them

This creates depth with almost no actual 3D mechanics.

### Page 3: Featured projects

Desktop layout:

- list of horizontal rows
- each row has a project title on the left and metadata on the right
- each row has a hidden orange overlay that slides down on hover
- a fixed image preview appears elsewhere on the screen based on hovered row

Mobile layout:

- the desktop rows are hidden
- project entries switch to stacked image cards

This is an important implementation detail: the mobile version is not a fluid adaptation of the desktop hover list. It is a separate content representation.

### Page 4: Services tabs + client slider

Top half:

- a large black rounded container
- left side is text/tabs
- right side is a large image

Bottom half:

- section label
- horizontally draggable client/logo slider

This section is the strongest "productized" UI on the page because it behaves more like a component than a decorative content band.

### Footer

The footer is treated like a stage reveal:

- fixed full-screen black panel
- animated blurred red shapes at the top
- large navigational links
- newsletter prompt
- logo and legal/footer metadata

The content above scrolls away, exposing the footer rather than transitioning into it.

## 6. Motion and Animation System

The motion language is broad, soft, and atmospheric. It avoids twitchy micro-interactions.

### A. Initial loader

Behavior:

- full-screen black overlay
- three words appear one after another
- text is transparent and filled with an orange gradient via background clipping
- after 4 seconds, the loader is moved off-screen by changing `top` to `-100%`

How it is made:

- each heading is absolutely positioned
- a shared keyframe animates opacity in and out
- stagger is handled with different animation delays on the three headings
- JS uses `setTimeout` to remove the loader from view after the sequence

Why it feels smooth:

- no complex sequencing library
- only opacity and positional transition
- the loader hides any initial page rendering or asset loading imperfections

### B. Smooth scroll

Behavior:

- the main content wrapper uses `LocomotiveScroll` with `smooth: true`

How it is made:

- one scroll instance is created on `#main`
- no custom scroll-triggered scenes are wired up

Real implication:

- the perceived smoothness mostly comes from softened scrolling inertia, not from advanced scroll choreography

Important observation:

- `ScrollTrigger` is loaded, but there is no `scrollerProxy` setup and no GSAP timeline integration
- that means this is not a GSAP-driven scroll storytelling build

### C. Hero blob animation

Behavior:

- large orange gradient shape behind the hero
- one circular blob visibly drifts around

How it is made:

- absolutely positioned divs
- gradient fills
- large blur filters
- CSS keyframes animate `transform: translate(...)`

Why it works:

- blur softens edge quality
- slow linear alternate motion makes the shape feel ambient rather than attention-seeking

Observation:

- HTML includes `#hero-3`, but its CSS block is commented out
- this suggests the hero originally intended a second moving circle, then simplified or partially removed it

### D. Marquee / ticker line

Behavior:

- repeated "EXPERIENCES / CONTENT / ENVIRONMENTS" loops continuously from right to left

How it is made:

- multiple duplicated `.con` groups are placed inline
- each group uses a `moving` keyframe from `translateX(0)` to `translateX(-100%)`
- `white-space: nowrap` prevents wrapping

Why it feels smooth:

- transform-based movement
- consistent linear timing
- repeated content prevents empty gaps

This is a classic illusion: duplicate enough content, move each block uniformly, and the brain reads it as an infinite marquee.

### E. Statement background orb

Behavior:

- a large soft orange/red circle sits behind the page 2 content and gently morphs

How it is made:

- one absolute parent blob
- two child circles with separate blur values and keyframes
- one keyframe includes `skew(...)`, which adds a subtle organic distortion

This is one of the page's best examples of fake complexity. It looks organic, but it is just two blurred layers moving a few percentage points.

### F. Project row hover animation

Behavior:

- when a project row is hovered, an orange layer slides down over the row
- a fixed preview image appears elsewhere on the page

How it is made:

- each `.elem` contains an absolutely positioned `#overlay`
- overlay starts at `top: -100%`
- on hover it transitions to `top: 0`
- each row stores an image URL in `data-image`
- JS reads that URL on hover and sets it as the background image of `#fixed-image`

Why it feels premium:

- the row itself remains simple
- the "big image follows the hovered item" interaction suggests a portfolio system without building full cards
- the image is detached from the list, which creates editorial tension

Technical note:

- the preview image is fixed, not cursor-following
- that keeps the interaction stable and cheaper to run than a mouse-tracking preview

### G. Capabilities tabs

Behavior:

- clicking `Design`, `Project`, or `Execution` changes:
  - descriptive copy
  - right-side image
  - tab emphasis

How it is made:

- three headings act as pseudo-tabs
- each heading stores a local image path in a `data-img` attribute
- click handlers replace the `#desc` text and `#page4-img` source
- active styling is simulated by changing text color and shifting the clicked heading `right: 2vw`

Why it works:

- no framework state system needed
- one image + one paragraph swap gives enough change to feel interactive
- the left border and offset text make the active tab feel selected without drawing an actual tab component

### H. Client carousel

Behavior:

- horizontal slider of brand logos and descriptions
- swipe/drag capable

How it is made:

- `Swiper` with `slidesPerView: "auto"` and `spaceBetween: 50`
- CSS controls slide widths per breakpoint

Why it feels smooth:

- Swiper handles inertia and dragging well
- slide content is visually simple
- cards are not overdesigned, so the movement stays readable

### I. Footer atmosphere

Behavior:

- two blurred red blocks behind the footer rotate subtly

How it is made:

- absolutely positioned blocks with heavy blur
- simple `rotate(...)` keyframes alternating between two angles

This is another recurring pattern in the site: static layout plus slow background transform.

## 6.1 Animation Inventory

| Pattern | Selector(s) | Trigger | Timing | Technique | Effect |
| --- | --- | --- | --- | --- | --- |
| Loader word cycle | `#loader h1` | page load | `1s`, staggered at `1s`, `2s`, `3s` | opacity keyframes | Cinematic intro sequence |
| Loader exit | `#loader` | JS timeout | 4-second delay, 1-second CSS transition | set `top: -100%` | Clears intro and reveals page |
| Hero blob drift | `#hero-2` | automatic | `3s`, linear, alternate, infinite | `transform: translate(...)` | Ambient motion behind hero |
| Unused hero blob | `#hero-3` | none in current CSS | n/a | HTML exists, CSS commented out | Leftover or abandoned layer |
| Marquee loop | `.con` | automatic | `12s`, linear, infinite | `translateX(0 -> -100%)` | Endless ticker band |
| Statement orb motion | `#circle1` | automatic | `3s`, ease-in, alternate, infinite | translate + skew | Soft organic movement |
| Statement orb glow | `#circle2` | automatic | `3s`, ease-in, alternate, infinite | translated blurred layer | Adds depth and heat |
| Project row overlay | `#overlay` inside `.elem` | hover | `0.2s`, ease | `top: -100% -> 0` | Fast color flood on row |
| Fixed project preview | `#fixed-image` | hover | immediate | JS display toggle + background-image swap | Editorial hover preview |
| Tab active shift | `#Design`, `#Project`, `#Execution` | click | immediate | inline style changes to `right` and `color` | Mimics selected tab state |
| Footer background rotation | `#shape1`, `#shape2` | automatic | `3s` and `4s`, linear, alternate, infinite | subtle `rotate(...)` | Keeps footer from feeling static |

## 7. UI Smoothness: What Actually Creates the Feeling

The site feels smoother than it really is because several decisions support perception:

### The real smoothness contributors

- `LocomotiveScroll` dampens harsh wheel movement
- most animation is transform-based rather than layout-heavy
- large sections reduce interaction density
- transitions are slow enough to hide imprecision
- the palette and spacing are consistent, so visual rhythm feels controlled

### The fake complexity contributors

- blurred gradients imply depth
- a fixed image preview makes the project list feel more sophisticated than a plain hover state
- a full-screen loader creates the impression of a polished sequence
- a fixed footer reveal feels cinematic even though the mechanic is simple

### What is not driving the experience

- no advanced GSAP timeline work
- no scene-by-scene scrollTrigger choreography
- no WebGL or canvas rendering
- no cursor physics or high-frequency mouse tracking
- no dynamic state model beyond simple DOM event handlers

## 8. Responsive Behavior

The responsive system is direct rather than elegant.

### Under 600px

Main changes:

- nav pills are hidden
- a `Menu` pill is shown instead
- hero becomes vertically stacked
- video is constrained taller and narrower with `object-fit: cover`
- page 2 becomes a vertical flow
- desktop project rows are removed
- mobile project cards are shown instead
- black tab section becomes vertical
- carousel cards widen significantly
- footer layout stacks

This is not a subtle responsive transition. It is a deliberate mobile rewrite for several sections.

### 600px to 800px and 800px to 1100px

Adjustments are mostly:

- footer spacing/placement
- font sizing
- swiper slide widths
- newsletter/footer proportions

The strongest breakpoint logic is around mobile, not tablet.

## 9. Performance and Asset Strategy

### Good choices

- transform-based CSS animation
- static hosting on Vercel
- WebP used for at least some section images
- relatively small local section image inspected: about 104 KB for `page4-1.webp`
- local font inspected: about 100 KB for `NeueHaasDisplay-Roman.ttf`

### Expensive choices

- hero video inspected at about 16.99 MB (`video.mp4`)
- multiple full-size remote images in project and client sections
- repeated heavy `filter: blur(...)` on large elements
- full-screen fixed loader and fixed footer layers

### Likely runtime behavior

On a decent desktop, the site should feel smooth because the interactions are simple and the scroll smoothing hides a lot.

On lower-powered mobile devices or slower networks, the biggest risk is not JavaScript complexity. It is:

- media weight
- blur compositing cost
- a large autoplay hero video

## 10. Accessibility and UX Gaps

The design is visually strong, but the implementation has several weak points.

### Accessibility issues

- nav links use empty `href` values
- tab headings are not semantic buttons
- active tab state is visual only
- hover-dependent project preview has no keyboard equivalent
- no evident reduced-motion handling
- loader forces a fixed 4-second wait regardless of readiness
- the mobile `Menu` button appears decorative; no menu logic is present in the inspected script

### Structural/code issues

- duplicate IDs are used for repeated elements such as `#mob-elem`, `#gol`, and `#navbut`
- event listeners for `#fixed-image` are attached repeatedly inside the project loop
- `GSAP` and `ScrollTrigger` are loaded without being used
- `#hero-3` exists in HTML but its styling is commented out

These issues do not stop the page from looking good, but they reduce robustness and maintainability.

## 11. Rebuild Blueprint

If you wanted to recreate this cleanly, the best approach is to treat it as a component system with a small motion layer.

### Recommended component map

- `LoaderSequence`
- `SiteHeader`
- `HeroIntro`
- `HeroBlobBackground`
- `HeroVideo`
- `MarqueeBand`
- `StatementSplitSection`
- `FeaturedProjectList`
- `ProjectHoverPreview`
- `CapabilitiesTabs`
- `ClientCarousel`
- `FooterReveal`

### Recommended data model

- `projects[]`
  - title
  - client
  - category
  - previewImage
- `capabilities[]`
  - label
  - description
  - image
- `clients[]`
  - logo
  - description

### Recommended implementation strategy

- use semantic buttons and links
- keep hover previews data-driven
- use CSS custom properties for the warm palette
- replace duplicate IDs with reusable classes
- use one motion primitive per section, not many
- lazy-load non-critical images
- compress or replace the hero video with adaptive sources

### If rebuilding in React or Next.js

Use:

- CSS modules or a scoped styling system
- a dedicated `Marquee` component
- `framer-motion` or GSAP only if you actually need timeline control
- native scroll plus `scroll-behavior` or a modern scroll utility unless smooth-scroll damping is a core brand requirement

The current site proves you do not need a heavy framework animation stack to produce this aesthetic.

## 12. Why the Design Works So Well

This site succeeds because it is disciplined.

- It reuses one visual language relentlessly.
- It makes everything large enough to feel intentional.
- It uses motion mostly as atmosphere, not as spectacle.
- It leaves a lot of empty space, which makes the few animated moments feel important.
- It avoids cluttered UI patterns and instead treats the page like an exhibition wall.

In short: the experience feels expensive not because it is technically elaborate, but because it is visually edited well.

## 13. If You Want to Build Something Similar

Use this formula:

1. Start with a restrained palette and one strong accent color family.
2. Use an editorial typeface with oversized headings.
3. Build sections as broad horizontal bands, not dense cards.
4. Add 3 to 5 ambient animations using blurred shapes and marquee movement.
5. Use one strong interactive pattern, such as hover-to-preview or click-to-swap content.
6. Add one cinematic asset, usually a video or oversized photography.
7. Keep the rest of the UI mechanically simple.

That is essentially the structure this site follows.

## 14. Sources Inspected

- Homepage: https://sundown-ivory.vercel.app/
- Stylesheet: https://sundown-ivory.vercel.app/style.css
- Script: https://sundown-ivory.vercel.app/script.js
- Representative assets checked on April 20, 2026:
  - https://sundown-ivory.vercel.app/video.mp4
  - https://sundown-ivory.vercel.app/NeueHaasDisplay-Roman.ttf
  - https://sundown-ivory.vercel.app/page4-1.webp
