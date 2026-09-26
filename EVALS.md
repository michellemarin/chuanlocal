# ChuanLocal: audit evals

Pass/fail checks derived from the design system, brand strategy and the owner's decisions. Each one lists the rule, where it comes from, and how to check it. Results are in `AUDIT_REPORT.md`.

Abbreviations for sources:
- **DM**: `QR Code Magic/4. Design Systems/design.md`
- **AH**: `4. Design Systems/AGENT-HANDOFF.md`
- **BG**: `6. Deliverables/review/brand-guide.html`
- **BS**: `6. Deliverables/review/brand-strategy-page.html`
- **BP**: `1. Brand Strategy/12-brand-platform.md`
- **V**: `1. Brand Strategy/08-voice.md`
- **ST**: `1. Brand Strategy/09-story.md`
- **OWN**: the owner's decisions in the brief (these override DM, AH and BG)

## A. Tokens and design system

| id | Rule | Source | How to check |
|---|---|---|---|
| A1 | No raw colour or size values outside the token layer | DM "never invent or hardcode a value"; AH "Check before you finish: token-audit" | Run `token-audit-template.sh` on `src` and on `public` (without `public/slides`) |
| A2 | Every `var(--x)` used is defined | DM Tokens | Diff the used variables against the declarations in `tokens.css` |
| A3 | App-added tokens are in both `tokens.json` and `tokens.css`, and the vendored upstream values are unchanged | DM "If none fits, add one there and use the new name" | Diff the vendored files against `4. Design Systems/tokens.*` |
| A4 | Light and dark themes both work: white page with navy text, and navy page with white text | DM "Two themes" | Screenshot `/start`, `/edit`, `/m/`, `/` with `preferredColorScheme` light and dark |
| A5 | White text appears only on Chuan Navy, never on clay or a tint | DM "White text only on Chuan Navy" | Read the CSS, including the `.on-navy` scope and the scrim, and look at the screenshots |
| A6 | Clay is only a mark (rule, dot, icon), never text or a background behind text | DM "Clay is a mark, not a surface" | Grep `accent-highlight` and `accent-error` usage |
| A7 | Button hover is lighter navy, never clay | DM Button "Never clay"; AH | Read `.btn-primary:hover` |
| A8 | One primary button per view | DM Button "one per view"; AH | Count `btn-primary` elements visible together on each screen |
| A9 | Controls are at least 48px (`layout-touch-target`) | DM; AH "Every control at least 48 px" | Read the CSS for `.btn`, inputs, `.choice`, lang chips and the header link |
| A10 | Icons are simple line icons beside words, with no emoji | AH "Replace emoji… No flags" | Grep `src` and `public` for emoji codepoints and read `icons.js` |
| A11 | Sold out uses a word and a strike-through, never lower opacity | DM Status tag; AH | Read `.row.sold` and `.status` |
| A12 | The language switcher uses each language's own name, in its own script and font, as chips. No flags | DM Language switcher | Read `LANG_LABELS`/`HOME_LABELS`, check which fonts are loaded, and look at the screenshots |
| A13 | Section headings, highlight block and list row match the component rules | DM Components | Read `app.css` against the table |
| A14 | The logo is used as supplied, at or above its minimum sizes (120px primary, 24px mark), and never inside the QR | DM Brand; BG Logos | Read `brand.js` and the logo-size tokens |

## B. Accessibility

| id | Rule | Source | How to check |
|---|---|---|---|
| B1 | Text contrast is at least 7:1 (AAA), and controls and icons at least 3:1 | DM "Accessible — AAA for text" | Compute ratios for every text and background pair, including white on the scrim over a white pixel |
| B2 | Focus is always visible | DM | Read the `:focus-visible` rules and `.choice:has(:focus-visible)` |
| B3 | Colour is never the only signal (special, sold out, errors) | DM | Read the markup: word labels exist next to the clay marks |
| B4 | Decorative graphics are hidden from assistive tech, and meaningful ones have names. No `role="img"` with an empty label | WCAG 1.1.1 / ARIA | Grep the rendered HTML for `aria-label=""` |
| B5 | Status changes on the editor are announced | DM Progress "status text in a live region" | Read `#status` |
| B6 | Reduced motion is respected (splash, parallax, rise-in, progress) | WCAG 2.3.3; DM Principles | Read `home.js`, `app.css` and `home.css` for `prefers-reduced-motion` |
| B7 | The splash can never block the page, even if JS fails | OWN splash + "never traps the page" comment in `home.js` | Trace what happens if `/home.js` fails to load |

## C. Multilingual correctness

| id | Rule | Source | How to check |
|---|---|---|---|
| C1 | Every block is tagged with `lang`, and the page `<html lang>` matches the content | DM "Tag every block with `lang`" | Read the rendered HTML for each language, including fallback cases where no translation exists |
| C2 | Each script uses its own family: Poppins, Prompt (Thai, line height 1.6), Montserrat (ru only), Noto SC/JP/KR | DM Typography | Read the `:lang()` rules and the font links in the rendered pages |
| C3 | Letter-spacing and uppercase are applied to Latin only | DM "Letter-spacing on Latin only" | Read the `.overline` and `.section-heading` rules and look at the hero overline |
| C4 | Load only the fonts a page needs | DM "Load only the fonts a page needs" | Read `fontLinks()` output per page |
| C5 | The home page has 8 languages (th en ko zh ja es fr de), with hreflang alternates and Thai as the default | OWN | Read `home.js` and `index.js` |
| C6 | The visitor list supports en zh ko ja ru de fr + th, and auto-picks from the phone's language | OWN; BP Pillar 1 | Read `pickLang` and test `/m/zk596ie?lang=*` |
| C7 | Non-English and Thai copy is fluent and correct. Nothing reads as machine-translated or wrong | V "written natively, not translated"; BP anchor table | Native-level read of `home-copy.js` and `i18n.js` in all languages |
| C8 | The visitor-page item translations match their items, with no shifted or wrong meanings | BP Pillar 2; V trait 3 | Read the live demo list in all 7 languages against the Thai |

## D. Voice and word rules (every language)

| id | Rule | Source | How to check |
|---|---|---|---|
| D1 | No *menu* (as the default word), *magic*, *AI*, *accurate*, *perfect*, *translation software*, *understand*, or universal banned words | DM Brand "Avoid…"; V Words to Avoid; BG | Grep the copy and read the equivalents in each language |
| D2 | Use the owned words: *list*, *read*, *type in Thai*, *today's special*, *sold out*, *point at it* | V Words to Own; BG | Read the copy |
| D3 | No language count as a claim, and no "every language" overclaim | BP "No language count as a claim"; V | Grep the copy and the markup |
| D4 | "Free" stays limited to the sanctioned footer line "Free for vendors and visitors" | BP "No 'free' until who pays is decided"; AH footer allows the line | Count uses of free/ฟรี/gratis etc. |
| D5 | No deficit framing of the vendor. The vendor is the subject of the sentence | V trait 4 | Read the copy |
| D6 | Candid about automatic translation ("Translation is automatic… point at the Thai") | V trait 3 | Check the visitor page footer and hint |
| D7 | The sign line reads "Scan to read this in your language" in every language | AH "The sign says…"; V; BS "To do now" | Read `UI[*].scan` and look at the sign |

## E. Messaging and storytelling vs strategy

| id | Rule | Source | How to check |
|---|---|---|---|
| E1 | The hero carries the tagline "Welcome, in your language." (and its Thai equivalent) | AH "Hero with the tagline"; DM Brand | Read `COPY.*.heroTitle` |
| E2 | The essence "The vendor's Thai stays; yours sits beside it" is present, with the connection never claimed in the present tense | BP Essence; ST "'Meet' and 'connect' appear only as the future" | Read the story sections |
| E3 | The three levers appear: own language, Thai underneath to point at, nothing to install | BP Pillars; BG levers | Read the copy |
| E4 | The problem framing: "a lost sale looks like a quiet day" and "walk past" | BS The idea; V Words to Own | Read s1 |
| E5 | The demo stall ข้าวซอยป้าศรี is the example | AH Marketing site | Follow the "See an example" link |
| E6 | Works for every kind of stall, not restaurant-only | V "Anything restaurant-only as the default" | Read `vNote`, the sign, and the tourist steps |
| E7 | Thai copy is written for the Thai vendor, as the main audience | OWN "Mainly aimed at Thai vendors"; V "Blocked: the Thai voice" | Read the Thai home copy from a vendor's point of view |
| E8 | No in-person-setup claim, because it is not yet true | BP "no public copy may describe it as happening" | Grep the copy |

## F. Owner's page structure and imagery

| id | Rule | Source | How to check |
|---|---|---|---|
| F1 | Order: 1 hero (parallax photo), 2 centred intro on a light background at most 800px wide, 3–5 story, 6 vendor how-to, 7 visitor how-to, 8 CTA | OWN | Read `home.js` and the screenshots |
| F2 | Free Unsplash photos, credited, candid, relevant to local vendors | OWN | Read `PHOTOS` and look at the images |
| F3 | A first-visit logo splash like the brand guide, only once, and skipped for reduced motion | OWN; BG splash script | Read the head script and `home.js` |
| F4 | Flags appear only on the printed sign | OWN | Grep `flags/` |

## G. Printed sign

| id | Rule | Source | How to check |
|---|---|---|---|
| G1 | Fits one A4 page with 10mm margins, and prints in black ink first | DM QR sign; `print-page-margin` | Print to PDF and count pages |
| G2 | QR is dark on white, with a quiet zone of at least 4 modules, nothing inside it, at `print-qr-size` | DM QR sign | Read `index.js` QR options and the CSS |
| G3 | Logo at the bottom, at least 30mm | AH "logo at the bottom"; DM | Read `sign.css` |
| G4 | Each language line is in its own script and family, `lang`-tagged | DM QR sign | Read the rendered sign HTML |
| G5 | Globe and 7 small flags are present (owner's call). Nothing else on the sign contradicts the word rules | OWN; V | Look at the sign |
| G6 | Every sign line is useful to a visitor in their language | V Channel Notes "Every language says the same thing" | Read the sign's text lines |

## H. Visitor page usefulness

| id | Rule | Source | How to check |
|---|---|---|---|
| H1 | Each row shows the translated name, the price, the Thai name under it, and the description | DM List row; BP Pillar 2 | Look at the live `/m/zk596ie` |
| H2 | Today's special is highlighted with a word label, and sold out has a word | DM Highlight/Status | Look at the local shop with special and sold-out set |
| H3 | Freshness ("Updated today") and the "show the Thai name" hint are present and localised | BG "Today's special and what's sold out, every day" | Look at the live page in all languages |
| H4 | The language switcher is reachable on a phone. All 8 chips are discoverable at 360–520px | DM Responsive; BG "Most visitors read on a phone" | Screenshot at 520px |
