# @chuanlocal/design-system

ChuanLocal's design tokens as CSS custom properties. Generated from `tokens.json` — regenerate, never edit by hand.

## Install

```
npm install ./design-system
```

Then import `tokens.css` once, at the top of your stylesheet or app entry. Every token is now a CSS variable: `var(--color-accent-brand)`, `var(--space-100)`, `var(--radius-button)`.

## The one rule

**The one rule: never invent or hardcode a value.** Every colour, space, type size, radius and shadow refers to a token in `tokens.json` by name. If none fits, add one there and use the new name, rather than setting a value where you happen to need it.

## What each group is for

- `--color-*` — background, foreground, border, accent (plus the primitives they point at). Dark mode (Chuan Navy page, white text) follows the system setting, or set `data-theme="dark"` / `"light"` on `<html>`.
- `--font-family-*` — one stack per script: latin (Poppins), thai (Prompt), cyrillic (Montserrat, Russian only), chinese, japanese, korean.
- `--type-*` — size, weight, line height, tracking per text role.
- `--space-*` — the 8px scale. `--spacing-*` — named jobs that point at it.
- `--radius-*`, `--border-width-*`, `--elevation-*` — corners, lines, shadows.
- `--layout-*` — touch target (48px), text width, app width.
- `--focus-*`, `--opacity-disabled`, `--layer-*`, `--icon-*` — focus ring, disabled state, stacking, icon sizes.
- `--print-*` — the A4 sign: margin, QR size, smallest logo.

Breakpoints (`breakpoint.sm` 640px, `lg` 1024px, `xl` 1280px) are in `tokens.json`; CSS can't read variables inside `@media`, so use those numbers there.

Not published to any registry. It belongs to ChuanLocal.
