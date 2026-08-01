# Avatar Scene Research — Browser Capabilities 2026

*Researched 2026-07-19. PRD ref: §14 "LANDING PAGE v2 AMBITION".*

---

## Architectural note on the existing codebase

Before the four questions: the current `index.astro` already separates concerns cleanly. The Cape Town scene is three `<svg class="scene">` elements. The character avatar is a `<svg class="avatar">` inside `<main class="card">`, which is completely outside the scene SVGs. This matters enormously for questions 1 and 3 — several hard isolation problems disappear if the avatar remains a separate element positioned over the scene rather than embedded inside it.

---

## 1. Programmatic Character Rendering

### The honest ceiling first

A "human-like avatar" in pure vectors is primarily an art problem dressed as a technical one. The browser can render whatever paths you give it with full fidelity. The question is who draws those paths and how long it takes. Every approach below hits the same wall: someone has to make the character look good, and flat-vector human figures that read as videogame-styled (not primitive) require a lot of careful authoring.

---

### 1a. Hand-authored SVG figures

**What's achievable:** An SVG character is just a collection of `<path>`, `<circle>`, `<rect>`, `<ellipse>` elements. The browser renders them exactly. There is no technical ceiling — the ceiling is authoring time and artistic skill.

**Practical tiers:**

- **Stick-figure / geometric abstraction** (~20–60 elements): head circle, body rect, limb lines. Recognisably human but stylistically primitive. Can be done in an hour. The existing placeholder avatar in the card is already in this tier.
- **Flat-vector game character** (~150–400 elements): distinct silhouette, clothing suggestion, hair shape, simple face with expression. Think Fire Emblem or Persona social links. Achievable with a vector illustration tool (Inkscape, Figma, Illustrator) by someone who can draw. Export to SVG. Realistically 4–12 hours of illustration work for a non-professional.
- **Production-quality character portrait** (400–1000+ elements, complex paths): distinct face, shading via gradient fills, expressive details. Think Disco Elysium character art. This is weeks of work even for a skilled illustrator.

**Reuse patterns:** [`<symbol>` + `<use>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol) (Baseline since July 2015) let you define the character once and instantiate it at different sizes or positions. Useful if the character appears at different scales (scene-embedded silhouette and close-up portrait view).

**Animation hooks:** Individual SVG elements can be targeted by CSS class or `id`. The blink animation already in the codebase (CSS `transform: scaleY` on an `.eyes` group) is a direct template for what's possible — limb movement, expression changes, idle bounce all work the same way.

**Relevant spec:** [SVG 2 — Document structure](https://www.w3.org/TR/SVG2/struct.html)

---

### 1b. CSS-drawn characters

**What's achievable:** CSS `clip-path`, `border-radius`, `box-shadow` stacking, and `::before`/`::after` pseudo-elements can produce character-shaped elements without SVG paths. Diana Smith's [Pure CSS Francine](https://diana-adrianne.com/purecss-francine/) is the ceiling demonstration — a baroque portrait built entirely in CSS divs.

**Real limitations:**
- Everything is rectangular at its core; curves come from `border-radius` which only handles convex shapes
- No arbitrary `<path>` equivalent — you cannot produce a natural hair silhouette or a clenched hand in CSS
- `clip-path: polygon()` gets you angular shapes; `clip-path: path()` (Baseline 2022) gives arbitrary paths but they're hard to author in pure CSS
- Hundreds of `box-shadow` stacked layers (the CSS art technique) produce the impression of smooth gradients but it's not scalable or maintainable
- Interactive pose changes (arm raising, leaning) are near-impossible without re-authoring the entire figure

**Verdict for this repo:** CSS-only characters top out at geometric abstractions or heavily stylised (non-human-readable) art. Not appropriate for a "human-like avatar with videogame graphical style."

---

### 1c. Canvas 2D

**What's achievable:** `ctx.arc()`, `ctx.bezierCurveTo()`, `ctx.moveTo()` give you everything SVG paths give you, drawn programmatically. A Canvas 2D character is effectively hand-authored SVG translated into draw-call sequences. You can also import and render an SVG onto a canvas via `drawImage(svgImage)`.

**Advantages over raw SVG:** Procedural generation (randomise hair colour, accessories, body proportions), pixel-perfect sprite-sheet-style animation (draw-call swap per frame).

**Disadvantages for this repo:**
- No DOM elements — CSS custom properties do not apply to canvas content; lighting isolation (question 3) has no CSS mechanism
- Not accessible without manual `aria` implementation on the wrapping element
- Playwright tests that inspect DOM structure won't see canvas internals
- Blurs at high DPI unless you scale the canvas context by `window.devicePixelRatio`

**Verdict:** Canvas 2D is better suited to game engines than portfolio sites. Adds significant complexity for no functional gain over SVG if the character is hand-authored anyway.

---

### 1d. WebGL / Three.js

**What's achievable:** A 2D-orthographic Three.js scene can render flat-shaded polygonal characters at 60fps with zero paint cost (everything is GPU-side). This is how many indie games achieve the videogame aesthetic. With `OrthographicCamera` and `MeshBasicMaterial` (unlit flat colour), you get the exact look of a 16-bit era RPG.

**Costs:**
- Three.js minified: ~650KB, gzipped ~165KB. For a portfolio landing page that is a significant bundle weight.
- Full rewrite of the existing SVG scene into Three.js meshes, or a hybrid where Three.js renders the avatar on top of the SVG scene (viable via canvas overlay, but adds rendering pipeline complexity)
- No CSS custom properties for theming — all colour changes require JavaScript material updates
- Playwright testing of canvas-rendered content requires screenshot comparison, not DOM assertions

**Verdict:** Appropriate only if the entire scene is being ported to WebGL. Overkill for an avatar on an otherwise SVG scene.

---

### Summary table

| Approach | Visual ceiling (videogame-style) | Authoring effort | Fits existing codebase |
|---|---|---|---|
| Hand-authored SVG | High (limited by art skill) | M–XL (illustration time) | Yes — drop in naturally |
| CSS art | Low (geometric only) | High (CSS authoring hell) | No |
| Canvas 2D | High (but no DOM) | L (same art problem, less ergonomic) | Partial |
| WebGL / Three.js | Very high | XL (scene rewrite) | No |

**Honest verdict:** Hand-authored SVG is the only approach that fits the repo constraints and can achieve a videogame-styled look. The bottleneck is always the same: someone has to draw the character. A stylised flat-vector portrait in the Persona/Fire Emblem register (distinct silhouette, readable face, limited palette) is achievable by an illustrator using Inkscape/Figma in 4–16 hours. Below that investment, you get a placeholder that doesn't look like a character.

---

## 2. Camera Zoom

"Oblivion dialogue cutscene" feel: camera slowly pushes in on the character when clicked — typically from a mid-shot to a close-up over 0.8–1.5s with an ease-out.

---

### 2a. SVG viewBox animation

**Mechanism:** Interpolate the SVG `viewBox` attribute from a wide value (full scene) to a narrow value (character region). MDN confirms viewBox is animatable ([SVG viewBox spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox) — "Animatable: yes"). SMIL `<animate attributeName="viewBox">` is supported in all three engines in our matrix but is legacy technology with a history of deprecation threats in Chromium. JavaScript `setAttribute` in a `requestAnimationFrame` loop works universally.

**Performance characteristics:**
- viewBox changes are NOT compositor-promoted. Every frame triggers a layout-equivalent recalculation of the SVG coordinate system plus a repaint of the entire SVG element
- For the existing scene (hundreds of `<rect>`, `<polygon>`, `<circle>` elements), this paint cost is meaningful — expect jank on mid-range mobile
- No `will-change` property will promote this to the compositor

**prefers-reduced-motion treatment:** Jump cut — set viewBox to final value with no animation, or skip zoom entirely and show close-up in-place via opacity fade.

**Cross-browser caveats:**
- SMIL interpolation of viewBox works but `calcMode="spline"` (for cubic easing) has inconsistent support across engines; JS lerp is safer
- Web Animations API does not reliably animate SVG presentation attributes; `element.animate({})` targets CSS properties, not SVG attributes — stick to JS `setAttribute` in a rAF loop

---

### 2b. CSS transform scale/translate (recommended)

**Mechanism:** Apply `transform: scale(N) translate(X, Y)` to the SVG element or a wrapper `<div>`. The browser scales the already-painted SVG content without repainting it.

**Performance characteristics:**
- `transform` and `opacity` are the only two CSS properties that run purely on the compositor thread ([web.dev animations guide](https://web.dev/articles/animations-guide))
- No layout recalculation, no paint — entirely GPU-side once the layer is promoted
- `will-change: transform` on the container promotes it to a compositor layer ahead of the click; remove after animation ends to avoid holding GPU memory unnecessarily (per [MDN will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change))
- With `transform-origin` set to the character's approximate position, scale() pushes the character toward the viewer naturally

**What this actually does:** It scales the SVG render target — all scene elements scale together. To isolate the zoom to the character, you need either: (a) the character in a separate positioned element over the scene, or (b) the character in a `<g>` that you transform independently of the scene background.

**prefers-reduced-motion treatment:** `@media (prefers-reduced-motion: reduce)` — instant cut to close-up state (no transition, opacity toggle only). Per [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), zoom/scale animations are specifically called out as vestibular motion triggers.

**Progressive enhancement / no-JS:** CSS `transform` is applied via JS (click handler). Without JS, no zoom occurs — the scene is static, which is the correct no-JS fallback (character is still visible, just no dialogue-cutscene effect).

**Cross-browser caveats:**
- `transform` on `<svg>` elements: all modern browsers handle this correctly; SVG elements are CSS-transformable since 2015
- Safari WebKit: historically had issues with `transform-origin` on SVG elements; test with a fixed `transform-origin` value rather than `center center`

---

### 2c. Canvas 2D camera

**Mechanism:** `ctx.setTransform(scale, 0, 0, scale, tx, ty)` followed by `ctx.clearRect()` and full scene redraw each rAF frame.

**Performance:** Main thread, single-threaded redraw. Fast if the scene is simple; expensive for complex scenes. Gives full control over easing and camera matrix.

**For this repo:** Would require porting the SVG scene to canvas draw calls. Not viable without a scene rewrite.

---

### 2d. WebGL camera

**Mechanism:** Animate an `OrthographicCamera` z-position or projection matrix scale. GPU-side, compositor-independent.

**For this repo:** Overkill. Three.js bundle weight alone rules this out unless the whole scene moves to WebGL.

---

### Zoom recommendation

**Use CSS `transform: scale()` on a positioned container.** Approach: the avatar is a separate `<svg>` or `<div>` element absolutely positioned over the scene. On click, add a class that triggers a CSS transition or a Web Animations API call using `element.animate([{transform: 'scale(1)'}, {transform: 'scale(3) translate(-20%, 10%)'}], {duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)'})`. The easing curve (expo-out) produces the Oblivion slow-push-in feel. Reverse the animation on dialogue close.

The `cubic-bezier(0.16, 1, 0.3, 1)` is a fast-start/slow-settle curve (similar to Oblivion's camera push). The Web Animations API ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)) is Baseline widely available and handles all the orchestration without a library.

---

## 3. Time-of-Day Lighting on a Fixed Character

### Existing architecture

The current toggle sets `data-time="day"` on `:root`. Day/night-specific layers use `.day-only` / `.night-only` CSS classes (`display: none` swap). Scene element colours are driven by CSS custom properties (`var(--sky)`, `var(--mountain)`, etc.) defined per theme on `:root`.

The current card avatar is already completely outside the scene SVGs — it's in `<main class="card">`. If the "big" avatar for the zoom effect is also a separate element (recommended), the isolation problem is trivial: just don't reference day/night custom properties in the avatar's fills.

### If the avatar is embedded in the scene SVG

Three viable strategies, from simplest to most complex:

---

#### Strategy A: Hardcoded fills on the character group (simplest)

Give every element in the character `<g>` an explicit `fill="#hex"` attribute (SVG presentation attributes) rather than `var()` references. SVG presentation attributes have lower specificity than CSS style attributes but higher than inherited CSS — character elements won't pick up the theme's custom property values if they have explicit fills.

```xml
<g id="avatar" fill="#c2956b" stroke="none">
  <!-- all child elements inherit explicit fills or have their own -->
</g>
```

**Risk:** If the author later adds `fill: var(--mountain)` to a character element via CSS, the explicit attribute loses. Use `style="fill: #hex"` (inline style) if specificity must be guaranteed.

**Verdict:** Correct for static characters. Zero filter cost, zero complexity.

---

#### Strategy B: isolation: isolate + character-scoped custom properties

Wrap the character in `<g style="isolation: isolate">`. Then define character-specific custom properties on that `<g>` that don't change with the theme:

```xml
<g id="avatar" style="--skin: #c2956b; --hair: #3a2010; isolation: isolate;">
  <circle fill="var(--skin)" ... />
</g>
```

The day/night `:root` overrides only change `--sky`, `--mountain`, etc. — never `--skin` or `--hair`. So the character colours stay fixed.

[MDN `isolation`](https://developer.mozilla.org/en-US/docs/Web/CSS/isolation): Baseline since January 2020, works on SVG container elements per spec. The `isolation: isolate` creates a new stacking context, which also prevents `mix-blend-mode` on scene elements from bleeding into the character group.

**Verdict:** Clean, explicit, and CSS custom properties are already the established pattern in this codebase. Recommended if the avatar is embedded.

---

#### Strategy C: SVG filter on the scene layer (most powerful, highest cost)

Apply a `feColorMatrix` tint filter to the scene background layer `<g>` for day/night colour cast, while leaving the character group unfiltered. This allows ambient colour shifts (golden-hour warmth, cool moonlight) without recolouring character fills at all.

```xml
<defs>
  <filter id="night-cast">
    <feColorMatrix type="matrix" values="
      0.7 0   0   0 0
      0   0.8 0   0 0.05
      0   0   1.1 0 0.05
      0   0   0   1 0" />
  </filter>
</defs>
<g id="scene-bg" filter="url(#night-cast)"> ... buildings, mountains ... </g>
<g id="avatar"> ... character ... </g>
```

**Performance:** SVG filter chains run on the GPU in modern browsers but require a rasterisation step — the filtered `<g>` is painted to an offscreen surface, the filter applied, then composited. For a large SVG with many elements, this adds meaningful GPU memory pressure. [W3C Filter Effects spec](https://www.w3.org/TR/filter-effects-1/) — filter on a `<g>` applies to the group's painted result, not per-element.

**feColorMatrix** ([MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix)) supports: `matrix` (5×4 matrix), `saturate`, `hueRotate`, `luminanceToAlpha`. Cannot target specific sub-regions of the filtered element — it applies uniformly. To vary the tint across the scene (e.g. brighten sky differently from foreground), you'd need separate filters on separate groups.

**Verdict:** Worthwhile for mood/colour-cast effects beyond simple colour token swaps. Overkill if all you need is the character to stay fixed — Strategy A or B is cheaper.

---

#### mix-blend-mode overlay approach

Apply a coloured overlay `<rect>` on top of the scene (but below the avatar) that changes opacity/colour with the theme, using `mix-blend-mode: multiply` or `mix-blend-mode: screen`. The character `<g>` uses `isolation: isolate` to be excluded from the blend.

[MDN mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode): Baseline widely available since January 2020. SVG element support confirmed; MDN documentation includes SVG circle examples. Safari: listed as "some parts may have varying support" — test complex blend mode stacks in WebKit.

**Verdict:** Interesting for soft lighting overlays (a subtle warm colour at dawn). Not necessary for this repo's current binary day/night toggle.

---

### WCAG AA contrast when background changes

When scene brightness shifts from dark (night) to light (day), the character's fixed colours must maintain ≥4.5:1 contrast against whatever is behind them in both states.

The current design tokens show:
- Night sky: `#14121f` (near-black)
- Day sky: `#cfe6e3` (light teal)

A mid-tone character colour (e.g. skin at `#c2956b`) will have very different contrast ratios against these two backgrounds. If the character overlaps sky, ensure the character silhouette has sufficient contrast in both themes. A dark outline stroke on the character (using an explicit dark colour not tied to theme) guarantees readability across both states.

---

## 4. Prior Art

### Hand-authored SVG character work

**Cassie Evans — SVG animation work**
Site: [cassie.codes](https://cassie.codes) — verified 2026-07-19: the site is
now a farewell note (she has retired her personal portfolio and points
visitors to her GSAP work). Her animation output lives on in her CodePen
([codepen.io/cassie-codes](https://codepen.io/cassie-codes)) and GSAP
community material. Hand-authored SVG characters with CSS/GSAP animation —
her illustrated demos showed the practical quality ceiling for a skilled SVG
illustrator. The technique: Inkscape/Illustrator-authored paths exported as
SVG, keyframe animations on named groups.

**Sarah Drasner — SVG animation work**
Her book *SVG Animations* (O'Reilly) and associated code examples at [github.com/sdras/svg-animation-book-examples](https://github.com/sdras/svg-animation-book-examples) demonstrate scene-scale SVG with character elements, viewBox pan/zoom, and GSAP orchestration. Relevant for camera movement patterns.

**Rive runtime** (not pure hand-SVG, but vectors + programmatic)
Site: [rive.app](https://rive.app)
Rive uses a custom binary vector format (not SVG) with a browser runtime (~100KB). It powers the interactive character/scene work on many modern portfolio sites. The Rive editor is free for individuals; the runtime is open source. Relevant as a "what the pro solution looks like" reference — its state machine model is exactly the Oblivion-dialogue-style interaction pattern.

---

### CSS art at production quality

**Diana Smith — Pure CSS Francine**
URL: [diana-adrianne.com/purecss-francine/](https://diana-adrianne.com/purecss-francine/)
A baroque portrait rendered entirely in CSS box-shadows, pseudo-elements, and clip-path. The canonical ceiling demonstration for CSS art. Several hundred divs, thousands of box-shadow values. Demonstrates what's possible; also demonstrates why it's not practical for interactive characters.

**Lynn Fisher — a.singlediv.com**
URL: [a.singlediv.com](https://a.singlediv.com)
Each piece is a single `<div>` rendered as a detailed illustration using only CSS. Demonstrates clip-path, gradient, and pseudo-element extremes. The character pieces (astronaut, etc.) show the angular/stylised ceiling clearly — faces are readable but not naturalistic.

---

### Interactive portfolio scenes (SVG/CSS camera)

**Bruno Simon — bruno-simon.com**
Site: [bruno-simon.com](https://bruno-simon.com)
Three.js WebGL scene with camera movement. The gold standard for interactive portfolio scenes. Relevant as prior art for "what a camera-push interaction feels like"; the implementation is WebGL not SVG.

**George Francis — georgefrancis.dev**
Site: [georgefrancis.dev](https://georgefrancis.dev)
SVG generative art and scene work with interactive elements. Shows CSS transform-based animation on SVG scenes.

---

### Camera pan/zoom in pure SVG/CSS

No production-quality examples of a pure-SVG viewBox animation achieving Oblivion-style camera push were found during this research. The pattern exists technically (SMIL `<animate attributeName="viewBox">`) but it is uncommon because:

1. viewBox animation is main-thread and paint-heavy for complex SVGs
2. CSS `transform` achieves visually equivalent results with compositor performance
3. Most polished examples of camera-zoom effects in DOM use CSS `transform: scale()` on a positioned container

The closest prior art for "CSS transform zoom as camera push" is found in parallax scrolling libraries (e.g. Locomotive Scroll) and section-transition effects, which use the same compositor-promoted `transform` mechanism.

---

## 5. Ranked Approaches for This Repo

These are ordered by fitness to the repo's specific constraints: static Astro, existing layered SVG scene, three scene variants, prefers-reduced-motion, WCAG AA, no raster/AI, Playwright tri-engine tests.

---

### #1 — Separate SVG avatar + CSS transform zoom (Effort: M, Risk: Low)

**Architecture:** Avatar is a standalone `<svg>` absolutely positioned over the scene via CSS, using the existing `.card` overlap pattern as a template. On click, the `main.card` disappears (opacity fade) and a full-screen avatar overlay scales into view using `transform: scale()` on a container.

**Why this ranks first:**
- Isolation from scene theme changes is free — the avatar SVG has nothing to do with `--sky` or `--mountain`
- CSS `transform` zoom runs on the compositor (no paint cost)
- The existing blink animation and avatar structure in `index.astro` is the direct starting point
- No changes to the three `<svg class="scene">` elements at all
- Playwright tests: DOM assertions on the overlay element work normally

**What needs workshopping:**
- The avatar must be drawn at two effective resolutions: small (card-head size ~64px) and close-up (dialogue portrait ~400px). SVG scales perfectly, but the art must look good at both sizes — some elements need detail changes (the existing avatar's 2-element eyes become visible detail at large sizes)
- Positioning the "scene-embedded" version of the avatar (the small figure standing in the Cape Town scene) vs. the "dialogue portrait" version (what the zoom reveals) — these may need to be separate `<symbol>` instances at different detail levels

---

### #2 — Avatar in scene SVG + CSS transform zoom (Effort: M–L, Risk: Medium)

**Architecture:** Add an avatar `<g>` inside each of the three scene SVGs (standard/wide/tall), positioned at the base of the buildings. Use `isolation: isolate` and character-scoped custom properties (Strategy B from §3) to keep it theme-immune. Zoom is still CSS `transform: scale()` on the avatar `<g>` or a positioned overlay that reveals a detailed close-up.

**Why this ranks second:**
- More cinematic — avatar appears to live in the scene; camera pushes in from the panorama
- Three scene variants mean three avatar placements to maintain; x/y coordinates differ per viewBox

**What needs workshopping:**
- The scene-embedded figure at scene scale is maybe 40–60px tall in a 400px-high SVG. At that size, the character is a silhouette, not a detailed portrait. The zoom effect must transition to a different "zoom in" SVG (the detailed portrait) — a cross-fade between the scene zoom and the portrait reveal is needed
- The `isolation: isolate` + explicit fills strategy must be tested to confirm no custom property leakage in all three Playwright engines

---

### #3 — Rive runtime for avatar (Effort: L, Risk: Medium)

**Architecture:** Author the character in the Rive editor (free), export `.riv` file, embed with the Rive web runtime (~100KB). The runtime handles the state machine (idle, zoom-in trigger, dialogue mode). The Rive canvas renders on top of the SVG scene.

**Why this ranks third:**
- Videogame feel is native to Rive's design — it's literally built for game-style interactive animation
- State machine (idle breathing → zoom in → dialogue expression) is designed for exactly this interaction pattern
- The art is authored in a purpose-built tool with proper bone/mesh deformation support

**What needs against:**
- ~100KB additional runtime; not huge but nonzero for a static site
- `.riv` file is binary, not auditable as SVG — harder to version-control meaningfully
- Playwright cross-engine canvas testing: screenshot diffing required for visual regression; Rive canvas is not DOM-inspectable
- "No AI-generated art" constraint is met (Rive is a drawing tool), but needs explicit decision from Caveshen

---

### #4 — viewBox animation zoom (Effort: S, Risk: Medium)

**Architecture:** Skip a separate avatar element entirely; the zoom is just the scene SVG's viewBox narrowing to focus on the area where a character would stand. Combined with a dialogue overlay.

**Why this ranks fourth:**
- No character art needed at all — the "Oblivion feel" comes from the camera push, not necessarily a character close-up
- Could be a placeholder approach while character art is in progress

**Against:**
- viewBox animation is main-thread and paint-heavy on a complex SVG — likely to jank on mobile
- Zooming into the existing scene reveals the city-building rectangles at very close range; they don't read as "a character"
- Doesn't actually solve the avatar problem, just defers it

---

### #5 — WebGL / Three.js full scene (Effort: XL, Risk: High)

Not recommended. ~165KB gzip weight, complete rewrite of the existing SVG scene, loss of CSS custom property theming mechanism, canvas-only accessibility model, and Playwright tests would need a screenshot-comparison approach. The existing SVG scene is clean and performant; there is no reason to port it to WebGL for a portfolio landing page.

---

### Recommendation

**Start with #1 (separate SVG avatar + CSS transform zoom).** It is the shortest path that leaves existing architecture intact, is compositor-safe for the zoom, and makes the isolation question trivial. The only genuine open question is the art: Caveshen needs to decide whether to:

a) Invest time drawing a flat-vector character in Inkscape/Figma (4–16h, highest control)
b) Commission a flat-vector SVG portrait from an illustrator (~$100–300 for a simple character)
c) Use Rive and build/commission the character there (opens to option #3 above)

**The avatar design is the critical path decision. All technical approaches are ready; the blocker is the art.**
