# Design System Strategy: The Cognitive Architect

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Cognitive Architect."** 

Education is often cluttered and overwhelming; this system seeks to do the opposite. It treats information as a high-end editorial experience, prioritizing mental clarity through expansive white space, "breathing" layouts, and sophisticated depth. We are moving away from the rigid, boxed-in nature of traditional dashboards. Instead, we use intentional asymmetry and overlapping "glass" surfaces to create a sense of fluid intelligence. This system is designed to feel less like a tool and more like a premium digital curator for the mind.

---

## 2. Colors
Our palette is anchored in depth and intellectual vibrancy. We utilize a Material Design 3 logic to ensure programmatic consistency while maintaining a bespoke aesthetic.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. Traditional lines create visual "noise" that restricts the eye. Boundaries must be defined solely through:
- **Background Shifts:** Utilizing `surface-container-low` (#eef1f3) against a `surface` (#f5f7f9) backdrop.
- **Tonal Transitions:** Using subtle shifts in color temperature to define where one concept ends and another begins.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials. 
- Use the `surface-container` tiers (Lowest to Highest) to create "nested" depth. 
- An inner card should typically occupy a `surface-container-lowest` (#ffffff) tier to "pop" against a `surface-container` (#e5e9eb) section. 
- This stacking replaces the need for dividers, creating a natural, architectural flow.

### The "Glass & Gradient" Rule
To elevate the experience, floating elements (like the "Launch Assessment" button or "Streak" card) should utilize **Glassmorphism**.
- **Implementation:** Use semi-transparent `surface` colors with a `backdrop-blur` of 20px–40px.
- **Signature Textures:** Main CTAs must use a linear gradient from `primary` (#702ae1) to `primary-container` (#b28cff). This provides a "soul" to the action, making it feel tactile and energized.

---

## 3. Typography
We utilize a dual-font strategy to balance authority with readability.

*   **Display & Headlines:** We use **Manrope**. Its geometric construction feels engineered and modern. Large-scale headlines (e.g., `display-lg` at 3.5rem) should be used to create an editorial feel, breaking the "software" look.
*   **Body & Labels:** We use **Inter**. It is the gold standard for legibility in data-heavy environments. 

### Typographic Hierarchy
- **Authority:** Use `headline-lg` (2rem) for "Welcome" states to establish an immediate focal point.
- **Precision:** Use `label-md` (0.75rem) in all-caps for metadata (e.g., "COGNITIVE DASHBOARD") to provide an archival, curated feel.
- **Clarity:** Body text remains `body-md` (0.875rem) for maximum comfort during long reading sessions.

---

## 4. Elevation & Depth
In this design system, depth is a functional tool, not just a decoration. We achieve hierarchy through **Tonal Layering**.

### The Layering Principle
Hierarchy is achieved by stacking tiers. For example:
- **Base:** `surface` (#f5f7f9).
- **Section:** `surface-container-low` (#eef1f3).
- **Element:** `surface-container-lowest` (#ffffff).
This creates a soft, natural lift that mimics fine paper resting on a desk.

### Ambient Shadows
Shadows must feel like natural light, not digital artifacts.
- **Specs:** Use extra-diffused blur values (24px to 64px).
- **Opacity:** Keep opacity between 4% and 8%.
- **Tinting:** Never use pure black shadows. The shadow color should be a tinted version of `on-surface` (#2c2f31) to simulate ambient light refraction.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in a high-contrast mode), use a **Ghost Border**: the `outline-variant` token (#abadaf) at **15% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
- **Primary:** Gradient-fill (`primary` to `primary-container`) with a `pill-shaped` (maximum, pill-shaped) corner radius. Includes a subtle "glass" inner-glow on the top edge.
- **Secondary:** Surface-based with no fill; defined by a `Ghost Border` and `primary` text.
- **Floating Action:** Large circular containers with centered icons, utilizing a high-elevation ambient shadow.

### Cards & Containers
- **Forbid Dividers:** Never use a line to separate content within a card. Use `Spacing 6` (2rem) or a subtle shift from `surface-lowest` to `surface-low`.
- **Rounding:** All primary cards must use `pill-shaped` (maximum, pill-shaped) corner radius. Smaller nested elements use `DEFAULT` (1rem).

### Progress & Data Viz
- Use smooth gradients for progress bars (e.g., `primary` to `secondary`).
- **Circular Indicators:** Follow the reference image's thick-stroke circular mastery charts, using a `surface-container-highest` (#d9dde0) background track to show the "unearned" portion of the goal.

### Neomorphic Inputs
- Input fields should appear slightly "recessed" into the surface using an inner shadow (2px blur, 5% opacity) and a `surface-container-low` fill. This creates the "pressed" feel of the reference image's data slots.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical layouts to guide the eye. Not every card needs to be the same width.
- **Do** use the "Icon Circle" pattern: place icons inside a circular `surface-container-high` container for a clean, uniform look.
- **Do** favor "White Space" over "Information Density." If a screen feels crowded, increase the spacing tokens to `8` or `10`.

### Don’t
- **Don't** use 1px solid borders for any reason. It breaks the "Architect" aesthetic.
- **Don't** use standard drop-shadow presets. All shadows must be custom-tuned for softness and tint.
- **Don't** use high-contrast dark modes that lose the "glass" quality. Dark modes must maintain tonal layering using `surface-dim` and `inverse-surface`.
- **Don't** use sharp corners. The minimum radius for any visible container is `subtle roundedness` (1).

---

## 7. Spacing & Rhythm
This system relies on a mathematical "Breathable Grid."
- **Standard Padding:** Use `Spacing 6` (2rem) for card internals.
- **Section Gaps:** Use `Spacing 10` (3.5rem) to separate major content blocks. 
- **Vertical Rhythm:** Content should feel like it is floating on a single plane; keep vertical spacing consistent to ensure the "Stacking" metaphor remains believable.