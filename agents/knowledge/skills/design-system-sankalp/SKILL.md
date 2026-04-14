# SANKALP-AEI Design System — "The Cognitive Architect"

## Creative North Star
Premium educational UI that treats information as a **high-end editorial experience**.
Mental clarity through expansive white space, "breathing" layouts, and sophisticated depth.
No rigid, boxed-in dashboards — use intentional asymmetry and overlapping "glass" surfaces.
The product must feel less like a tool and more like a **premium digital curator for the mind**.

---

## Color Tokens (Material Design 3 — Light Theme)

All color tokens are available as Tailwind classes in the project. Use these exact token names:

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#702ae1` | Brand accent, CTAs, active states |
| `primary-container` | `#b28cff` | Gradient endpoints, badge fills |
| `primary-fixed` | `#b28cff` | Gradient targets |
| `primary-dim` | `#6411d5` | Hover state for primary elements |
| `secondary` | `#4647d3` | Secondary actions, progress fill |
| `secondary-container` | `#cdcdff` | Tag backgrounds, pill fills |
| `tertiary` | `#006947` | Success, earned badges, check states |
| `tertiary-container` | `#69f6b8` | Badge backgrounds, success containers |
| `surface` | `#EBEDF0` | Page background — the neumorphic base |
| `background` | `#EBEDF0` | Same as surface (aliased) |
| `surface-container-lowest` | `#ffffff` | Inner cards "popping" above containers |
| `surface-container-low` | `#eef1f3` | Subtle section differentiation |
| `surface-container` | `#e5e9eb` | Section background |
| `surface-container-high` | `#dfe3e6` | Grouped elements, tight containers |
| `surface-container-highest` | `#d9dde0` | Progress bar tracks (unearned state) |
| `surface-dim` | `#d0d5d8` | Dark mode base — maintains glass quality |
| `on-surface` | `#2c2f31` | Primary text on surface |
| `on-surface-variant` | `#595c5e` | Secondary text, labels, metadata |
| `outline-variant` | `#abadaf` | Ghost borders (use at 15% opacity max) |
| `inverse-surface` | `#0b0f10` | Dark mode card backgrounds |
| `error` | `#b41340` | Error states |
| `error-container` | `#f74b6d` | Error backgrounds |

### Critical Color Rules
- **NO generic colors** (plain red, blue, green). Always use the token palette above.
- All shadows MUST use `on-surface` (#2c2f31) as a tinted base, never pure black.
- Shadow opacity: 4%–8% only.
- Dark mode: use `surface-dim` and `inverse-surface` to maintain tonal layering.

---

## The "No-Line" Rule — STRICT MANDATE

**❌ NEVER use `border: 1px solid` for sectioning or containment.**

Boundaries must be defined ONLY through:
- **Background Shifts:** `surface-container-low` (#eef1f3) against `surface` (#f5f7f9)
- **Tonal Transitions:** Subtle color temperature shifts between sections
- **Ghost Border Fallback (accessibility only):** `outline-variant` at **15% opacity maximum**

---

## Neumorphism — The Visual Language

All shadows use the **neumorphic** system (soft-UI on `#EBEDF0` base):

```css
:root {
  --nm-bg: #EBEDF0;
  --nm-shadow-dark: rgba(163, 177, 198, 0.6);
  --nm-shadow-light: rgba(255, 255, 255, 1);
}

/* Raised element */
.neumorphic-flat {
  background: var(--nm-bg);
  box-shadow: 9px 9px 16px var(--nm-shadow-dark), -9px -9px 16px var(--nm-shadow-light);
}

/* Recessed / pressed element (inputs, inset containers) */
.neumorphic-inset {
  background: var(--nm-bg);
  box-shadow: inset 6px 6px 12px var(--nm-shadow-dark), inset -6px -6px 12px var(--nm-shadow-light);
}

/* Active pressed state */
.neumorphic-pressed {
  box-shadow: inset 4px 4px 8px var(--nm-shadow-dark), inset -4px -4px 8px var(--nm-shadow-light);
}
```

---

## Typography

**Dual-font system — always import both:**
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
```

| Role | Font | Size | Weight |
|------|------|------|--------|
| Display / Headlines (h1, h2) | **Manrope** | 2rem–3.5rem | 800 (extrabold) |
| Sub-headlines | Manrope | 1.25rem–1.5rem | 700 (bold) |
| Body text | **Inter** | 0.875rem | 400–500 |
| Metadata / Labels | Inter | 0.75rem | 700–900 (all-caps) |
| Section headers | Inter uppercase | 0.625rem (10px) | 900, letter-spacing: 0.2em |

### Typography Rules
- Use `font-headline` (Manrope) for all `h1`–`h3` editorial text
- Metadata labels: ALWAYS all-caps, tracking-widest (`letter-spacing: 0.2em`)  
- Large headlines should feel "editorial" — break the "software" look
- Body text stays at `body-md` (0.875rem) for comfort during reading

---

## Glassmorphism — Floating Elements

Floating CTAs, modals, streak cards, and overlays MUST use glassmorphism:

```css
.glass {
  background: rgba(235, 237, 240, 0.7);  /* surface at ~70% opacity */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);  /* glass edge only */
}
```

**Primary CTA Gradient (required for all main action buttons):**
```css
background: linear-gradient(135deg, #702ae1 0%, #b28cff 100%);
```

---

## Spacing & Layout Rhythm

- **Card padding:** `2rem` (Spacing 6)
- **Section gap:** `3.5rem` (Spacing 10)
- **Consistent vertical rhythm** — content "floats" on a single plane
- **Grid:** 12-column grid, asymmetrical layouts allowed/encouraged
- Navigation height: `5rem` (80px), fixed, uses `z-50`

---

## Border Radius — Always Rounded

| Context | Radius |
|---------|--------|
| Primary cards / main containers | `2.5rem` (40px) or `pill-shaped` |
| Sub-cards / inner elements | `1rem` (DEFAULT) |
| Circular elements (avatars, icons, badges) | `9999px` (full) |
| Buttons | `1rem` minimum, primary CTAs use full-pill |
| Input fields | `9999px` (inline search bars) |

**Minimum:** Any visible container must have at least `border-radius: 1rem`.

---

## Component Patterns

### Buttons
```html
<!-- Primary CTA -->
<button class="flex-1 py-5 rounded-2xl neumorphic-flat bg-primary text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all active:shadow-inner uppercase">
  Launch Mission
</button>

<!-- Secondary -->
<button class="rounded-full neumorphic-flat text-primary font-black text-sm border border-primary/15 hover:scale-[0.98] transition-all">
  Review Theory
</button>
```

### Icon Circles (always use this pattern for icons)
```html
<div class="w-10 h-10 rounded-full neumorphic-inset flex items-center justify-center">
  <span class="material-symbols-outlined text-sm text-primary">icon_name</span>
</div>
```

### Cards
```html
<!-- Standard raised card -->
<div class="neumorphic-flat p-8 rounded-3xl">
  <!-- Content — no dividers inside cards, use spacing only -->
</div>

<!-- Recessed / data container -->
<div class="neumorphic-inset p-6 rounded-2xl">...</div>
```

### Inputs (Neomorphic)
```html
<div class="neumorphic-inset p-2 rounded-full flex items-center px-5">
  <span class="material-symbols-outlined text-on-surface-variant text-lg">search</span>
  <input class="bg-transparent border-none focus:ring-0 text-sm w-full py-4 px-3 placeholder:text-on-surface-variant/40 font-medium" 
         placeholder="Search..." type="text"/>
</div>
```

### Progress Bars
```html
<!-- Track (unearned) -->
<div class="w-full h-3 neumorphic-pressed rounded-full overflow-hidden bg-[#EBEDF0]">
  <!-- Fill (gradient) -->
  <div class="w-[60%] h-full bg-gradient-to-r from-primary to-primary-fixed shadow-[0_0_15px_rgba(112,42,225,0.4)]"></div>
</div>
```

### Mastery Arc (Circular Progress)
```css
.mastery-arc {
  background: conic-gradient(from 0deg, #702ae1 0%, #b28cff VAR%, transparent VAR% 100%);
}
```

### Material Symbols Icons
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

<!-- Filled icon -->
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">icon_name</span>
<!-- Outlined icon (default) -->
<span class="material-symbols-outlined">icon_name</span>
```

---

## Screen Inventory

The design system covers these 22 screens. Each has a `code.html` reference implementation in `agents/design/{screen-name}/`:

| Screen | Directory | Purpose |
|--------|-----------|---------|
| AI Companion | `aicompanion/` | Chat-based tutoring interface |
| Class Overview | `class overview/` | Teacher view of class performance |
| Cockpit | `cockpit/` | Admin analytics overview |
| Config | `config/` | System configuration panel |
| Forgot Password | `forgot password/` | Password recovery flow |
| Help Center | `help center/` | Support & documentation |
| Landing Page | `landing page/` | Marketing / entry page |
| Lesson Planning | `lesson planning/` | Teacher lesson builder |
| Metacognition | `metacognition/` | Student self-awareness insights |
| Registration | `registration/` | Sign-up form |
| Student Analytics | `student analytics/` | Detailed student data view |
| Student Dashboard | `student dashboard/` | Main student home screen |
| Student Drill Down | `student drill down/` | Deep topic analysis |
| Student Profile | `student profile/` | Student profile card  |
| Study Session | `study session/` | Active learning session UI |
| System Health | `systemhealth/` | System monitoring panel |
| Teacher Dashboard | `teacher dashboard/` | Main teacher view |
| Teacher Profile | `teacher profile/` | Teacher account page |
| Teacher Report | `teacher report/` | Report generation UI |
| User Management | `user management/` | Admin user CRUD |

---

## Do's and Don'ts

### ✅ DO
- Use asymmetrical layouts to guide the eye
- Use the "Icon Circle" pattern: icons inside `rounded-full neumorphic-inset` containers
- Favor white space over information density — increase spacing if crowded
- Use `neumorphic-flat` for raised cards, `neumorphic-inset` for recessed containers
- Use editorial typography (large Manrope headlines) to break the "software" look
- Add `hover:scale-[1.02]` or `hover:scale-[0.98]` micro-interactions on clickable elements
- Use gradient from `primary` to `primary-fixed` for all primary CTA buttons

### ❌ DON'T
- Use 1px solid borders for ANY reason (zero tolerance)
- Use standard drop-shadow presets — all shadows must be custom neumorphic
- Use generic color values (#ff0000, #0000ff) — always use design tokens
- Use sharp corners on ANY visible container (minimum `rounded-lg`)
- Create high-contrast dark modes that lose the "glass" quality
- Use point estimates for mastery — always show Beta(α,β) probability ranges
- Overcrowd screens — add spacing aggressively

---

## Tailwind Configuration (Required)

Every screen in `agents/design/` uses this Tailwind config that MUST be replicated in Next.js:

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      "primary": "#702ae1",
      "primary-container": "#b28cff",
      "primary-fixed": "#b28cff",
      "primary-dim": "#6411d5",
      "secondary": "#4647d3",
      "secondary-container": "#cdcdff",
      "tertiary": "#006947",
      "tertiary-container": "#69f6b8",
      "surface": "#EBEDF0",
      "surface-container-lowest": "#ffffff",
      "surface-container-low": "#eef1f3",
      "surface-container": "#e5e9eb",
      "surface-container-high": "#dfe3e6",
      "surface-container-highest": "#d9dde0",
      "surface-dim": "#d0d5d8",
      "on-surface": "#2c2f31",
      "on-surface-variant": "#595c5e",
      "outline-variant": "#abadaf",
      "inverse-surface": "#0b0f10",
      "error": "#b41340",
      "error-container": "#f74b6d",
    },
    fontFamily: {
      "headline": ["Manrope"],
      "body": ["Inter"],
      "label": ["Inter"],
    },
    borderRadius: {
      "DEFAULT": "1rem",
      "lg": "2rem",
      "xl": "3rem",
      "full": "9999px",
    },
  },
}
```
