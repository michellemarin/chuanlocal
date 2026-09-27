# ChuanLocal audit report 2

**What was checked:** branch `chuanlocal-rebrand` at `ff37680`. The live site matches this commit: `home.css`, `app.css`, `tokens.css` and `home.js` are byte-identical, and the asset version is `v=2026092704`. The branch moved 9 commits during the audit, so every live check was re-run after the last deploy. `/edit`, `/sign` and a list with a special and a sold-out item were tested on a local `wrangler dev`. The test shop was deleted afterwards.

**How:**
- Token audit script run on `src` and on `public` (without slides, video and flags).
- Playwright at 360, 390, 420, 768, 1024 and 1440px, in light and dark mode. Each run measured horizontal overflow, which side the photo sits on in each checkered section, and the state of the menu.
- ARIA snapshots, and a DOM check for landmarks, headings, accessible names, `lang` and live regions.
- A Tab walk through each page.
- Reduced-motion and normal-motion runs, with parallax transforms sampled every 100px of scroll.
- Computed border colours of every button.
- Print to PDF.
- A read of all 8 home languages and the demo list in all 8 languages.

**Owner decisions** are not counted as violations. These cover pill buttons, the forced light home page, the white header pill, two filled buttons in the hero, the chooser page, the video, the flags, globe and calendar tab on the sign, and the photos.

## Results

| id | Result | Evidence |
|---|---|---|
| A1 | Pass | The token audit passes on `src` and `public`. The JS fallbacks `public/home.js:27,48,59` are unchanged (accepted as behaviour, not style). |
| A2 | Pass | Every `var(--…)` in use is defined. |
| A3 | Pass | `tokens.json` and `tokens.css` agree, including `sand-100` #FFFBFA, the glow tokens and pill-height. `radius.button` now points to `full` (owner). `color.neutral-100` is defined but never used. |
| A4 | Pass | The home page is forced light (owner). The other pages follow the light and dark roles. |
| A5 | Pass | White text appears only on navy or the navy scrim. |
| A6 | Pass | Clay appears only on the highlight and alert rules and the star and error icons. |
| A7 | Pass | `app.css:88` uses brand-hover. |
| A8 | Pass (owner) | Edit now has one primary (LINE became secondary). The two filled pills on the home page are allowed. |
| A9 | Pass | Every control is at least 48px. The chips use a 48px `::after` tap area. |
| A10 | Pass | No emoji. The calendar icon on the sign is the owner's call. |
| A11 | Pass | Sold out uses a strike-through plus the word "Sold out" (checked locally). |
| A12 | **Partial** | The CJK chips still fall back to system fonts, and 한국어 sits off-baseline in the 1440 header. |
| A13, A14 | Pass | |
| B1 | **Fail** | Text contrast passes. Controls fail: now that borders are gone, `.btn-secondary` is white on white (light) and navy-900 on navy-900 (dark), with only a 10% shadow. The button edge is well under 3:1 on `/edit`, `/start`, `/sign` and `/m`. |
| B2 | Pass | Every stop in the Tab walk shows a ring: white on navy, navy on white. |
| B3, B5 | Pass | `#status` has `role=status aria-live=polite`. |
| B4 | Pass | `mark(…, '')` now renders `aria-hidden` (`brand.js:10`). |
| B6 | Pass | See J1–J3. |
| B7 | Pass | There is now an inline 4s failsafe in the head script (`home.js:32`). |
| C1 | **Partial** | Fallback Thai is now tagged `th`. But ชวน in the intro is untagged in all 7 non-Thai languages (`home-copy.js:78,128,178,228,278,328,378`). |
| C2 | **Partial** | On the sign (`<html lang="th">`), the Latin lines inherit Prompt instead of Poppins, because there is no `:lang(en/de/fr)` rule (`app.css:18`). |
| C3 | Pass | The hero overline ชวน is no longer tracked. |
| C4, C5, C6 | Pass | |
| C7 | **Partial** | Most of the earlier issues are fixed. What remains: ko 당신 (`:133`), the ambiguous "in Thai" in `gsVendorSub`, and others. See the findings. |
| C8 | **Fail** | Rows are now aligned in all 7 languages, and the spice level is no longer inverted. But fr shows English ("Mildly spicy"), ru calls her "Тётка", zh names the wrong dish, and the ko transliteration is wrong. See High 1. |
| D1, D2 | Pass | "เมนู"/"Menu" appears only as the nav-toggle label. |
| D3 | Pass | Thai hero reworded. The sign's flag row is `aria-hidden`. |
| D4 | Pass | 2× per language: the s3 origin line and the footer, as recommended. None on `/start`. |
| D5, D6, D7 | Pass | |
| E1–E6, E8 | Pass | |
| E7 | Pass | The Thai intro no longer defines ชวน. Section 7 is now "ลูกค้าของคุณ", addressed to the vendor. |
| F1 | Pass (owner) | Hero video, intro, checkered sections, pull quote, vendors, visitors, CTA. |
| F2 | Pass (notes) | Free Unsplash photos, credited. The weak choices remain: the vendor's mask, the English "THAI MILK TEA" signs, the temple. |
| F3, F4 | Pass | |
| G1 | Pass | Print to PDF gives 1 page. |
| G2–G5 | Pass | Owner's sign elements. |
| G6 | Pass | The scan-note has its Thai half again (`pages.js:378`). |
| H1, H3 | Pass | The German list is aligned again. |
| H2 | Pass (low note) | The special still appears twice (`pages.js:343` and in its section). |
| H4 | Pass | The chips wrap. All 8 are visible at 360–1440px on `/m` and in the open home menu. |
| **I1** Landmarks | **Partial** | Home: banner, nav, main and contentinfo are correct. `/m`, `/start`, `/edit` and `/get-started` put `header` (and the `/m` footer) inside `main`, so no banner or contentinfo is exposed. `/sign` has no landmarks at all. |
| **I2** Headings | Pass | One h1 per page, h2s below it, no skipped levels. |
| **I3** Names | **Partial** | No unnamed links or buttons. The menu summary is named "Menu"/"เมนู". But the sign's QR `<svg>` has no role or name. On `/edit`, every item repeats the unlabeled buttons "พิเศษวันนี้ / หมด / ลบ" with no item context. |
| **I4** Decorative media | Pass | All `img` have `alt=""`, and the video has `aria-hidden`. |
| **I5** Menu | **Partial** | Works with click and keyboard, and wraps with no overflow. Escape does not close it. |
| **J1** Reduced motion: splash | Pass | No `.anim` class and no splash. |
| **J2** Reduced motion: parallax | Pass | Transforms stay at 0 at every scroll step. |
| **J3** Reduced motion: video | Pass | The `autoplay` attribute is removed and the video stays paused at t=0. If JS doesn't run, it still autoplays (low). |
| **J4** Normal-motion parallax smoothness | **Fail** | Parallax is clamped and runs on the main thread, so photos stop and start. See Medium 1. |
| **K1** No coloured button borders | Pass | Every `.btn` border is transparent, except the white outline on navy (allowed). Language chips on `/m` still have a navy-tint border, while the home chips have none (low). |
| **L1** Mobile photo-first | Pass | All 5 checkered sections show the photo on top at 360, 390, 420 and 768px, in all 8 languages. At 1024 and 1440px they alternate left and right. |
| **L2** Nav collapses | Pass | Menu icon below 1024px. Open inline at 1024px and above. |
| **L3** No horizontal overflow | Pass | `scrollWidth` equals the viewport on every page, width and theme tested. |

## Earlier findings (AUDIT_REPORT.md)

| Finding | Status |
|---|---|
| H1 German list shifted | **Fixed.** Keyed JSON, a duplicate-output check, and a re-save. |
| H2 spice inversion, zh and ko errors | **Partial.** The inversion, the added garlic, 北府, pinyin and the shop-name explanations are fixed. New errors appeared (High 1). |
| M1 splash trap | **Fixed.** |
| M2 two primaries | **Fixed** on edit. The home page is an owner exception. |
| M3 chips hidden on phones | **Fixed.** |
| M4 พิมพ์ used for both type and print | **Partial.** Home and `/start` use ปริ้นต์. The editor button still says "พิมพ์ป้าย QR" (`pages.js`, edit page). |
| M5 Thai calques | **Mostly fixed.** heroSub still has "โดยมีภาษาไทยอยู่ด้านล่าง". |
| M6 "free" | **Fixed.** |
| M7 language-count claims | **Fixed.** |
| M8 Thai reader | **Fixed.** |
| M9 other languages | **Partial.** es, zh and the ko hero are fixed. ko s2Title still uses 당신 (`home-copy.js:133`). |
| Low: B4, C1 fallback, C3, G6, localised aria-label, fr/de/es/ja/ko word fixes, edit hint | **Fixed.** |
| Low: A12 chip fonts, special shown twice, photo choices, QR size note in the token description | **Not fixed.** |
| Low: calendar icon, "Scan me" | Owner decision. Closed. |

## Remaining findings

### High

**1. The demo list still has visible translation errors.** URL: `/m/zk596ie?lang=fr|ru|zh|ko|de`.

**What's wrong:**
- **fr:** the ขนมจีนน้ำเงี้ยว description reads **"Mildly spicy"**, which is English on the French list.
- **ru:**
  - Shop name "Кхао сои **Тётка** Сри": Тётка is rude.
  - "мягко острый" should be "Слегка острое".
  - "Сай-оу" should be "Сай-уа".
- **zh:**
  - "酸汤米线" names a different dish.
  - "北部菜" should be 泰北菜.
  - Shop name "咖喱面阿姨Sri" mixes scripts.
- **ko:**
  - "칸놈진 남꽈" is the wrong transliteration.
  - "약간 매운" is a dangling adjective.
- **de:**
  - "Nudel in Kokos-Curry" should be plural (Nudeln).
  - "Chiang Mai Rezept" should be "nach Chiang-Mai-Art".
  - "Cha Thai Yen (Eistee)" should be "Thailändischer Eistee".
  - Shop name uses the English "Auntie" (de and fr).

**Fix:**
- Hand-correct the demo shop's stored `tr`. Suggested values:
  - fr "Légèrement épicé"
  - ru "Кхао сой тётушки Си" and "Слегка острое"
  - zh "诗丽阿姨泰北咖喱面", "泰北番茄肉酱米线" and "泰北菜"
  - ko "카놈찐 남니아오" and "약간 매움"
  - de "Khao Soi Tante Si" and "Kokos-Curry-Nudeln nach Chiang-Mai-Art"
- In `src/translate.js:67`, also reject a batch when a non-English output equals the English output for the same key. Also reject when zh, ko, ja or ru output has no characters in its own script.

**2. Secondary buttons have no visible edge in the vendor flow (B1).** Where: `public/app.css:71-89`. Seen on `/edit`, `/start`, `/sign` and `/m`, in light and dark mode.

**What's wrong:** removing the borders left `.btn-secondary` as white on white, or navy on navy. Only a 10% blur shadow marks the edge. This affects:
- "หน้าที่ลูกค้าเห็น"
- "พิมพ์ป้าย QR"
- "เพิ่มรายการ"
- the item toggles

These fall below DM's 3:1 for controls. In dark mode they are nearly invisible.

**Fix:** keep them borderless and give them a tinted fill, as `.split .btn-secondary` already has:
```css
.btn-secondary { background: var(--color-background-subtle); }
```
That gives navy-50 in light mode and navy-800 in dark mode. Check that the fill reaches 3:1 against the page, or use `navy-100` / `navy-700` if it does not.

### Medium

**1. Parallax stops and starts, and can judder on phones (J4).**
- **Where:** `public/home.js:52-65`.
- **What's wrong:**
  - The offset is clamped to ±10% of the box height. Sampled at 390px, a checkered photo sits pinned at −48px for 400px of scroll, moves for about 500px, then pins at +48px for the rest. The hero stops moving after 385px.
  - The transform is applied in rAF, one frame behind the compositor scroll. That is the classic cause of parallax jitter on iOS and Android.
  - `resize` fires when the phone's address bar collapses, which makes the photos jump.
  - Each image does a read and then a write in turn, which forces layout on every frame.
- **Fix:**
  - Use progress over the whole visible range, so the clamp is never hit: `p = (vh - box.top) / (vh + box.height)`, then `offset = (p - 0.5) * 2 * max`.
  - Do all the reads first, then all the writes.
  - Ignore resize events that change height only.
  - Better still, use CSS scroll-driven animation, which runs on the compositor: `@supports (animation-timeline: view()) { .media[data-parallax] img { animation: drift linear both; animation-timeline: view(); } }` with `@keyframes drift { from { transform: translateY(-8%) } to { transform: translateY(8%) } }`. Keep the JS only as a fallback.

**2. The editor repeats unlabeled controls per item (I3).**
- **Where:** `src/pages.js:174-210`.
- **What's wrong:** a screen-reader user hears "พิเศษวันนี้, toggle button" and "ลบ, button" once per item, with no item name.
- **Fix:** give each card `role="group"` and `aria-label="รายการ ${i+1}: ${it.name}"`, or set `aria-label` on each toggle, for example `ลบ ${it.name}`.

**3. The mobile menu ignores Escape (I5).**
- **Where:** `public/home.js:32-40`.
- **Fix:** add `document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.open && !desktop.matches) { nav.open = false; nav.querySelector('summary').focus(); } })`.

**4. The "I'm visiting" card loops back to the home page.**
- **Where:** `src/home.js:172`.
- **What's wrong:** it links to `/?lang=xx#visitors`, the page the visitor just came from.
- **Fix:**
  - Link to `exampleUrl` (the demo list in their language), with the sub-line "See what a ChuanLocal list looks like".
  - Also reword `gsVendorSub` in all languages. "in Thai" reads as if the sign is in Thai. EN: "Type your list in Thai. Get a QR sign for your visitors." TH: "พิมพ์รายการเป็นภาษาไทย ได้ป้าย QR ให้ลูกค้าต่างชาติ".

**5. The checkered alternation barely shows.**
- **Where:** `tokens.css` `--color-sand-100: #FFFBFA`.
- **What's wrong:** #FFFBFA against #FFFFFF is almost indistinguishable. The brief specified #F2F2F2 (`neutral-100`, now unused).
- **Fix:** confirm with the owner. Either go back to `neutral-100`, or use a sand that reads, such as #F7F0ED (tried in `e3c1c04`).

**6. Korean still uses 당신.**
- **Where:** `home-copy.js:133`.
- **Fix:** "상인의 태국어는 그대로, 내 언어는 그 옆에."

### Low

- **Landmarks (I1):** move `<header class="app-header">` out of `<main>` on `/m`, `/start`, `/edit` and `/get-started` (`pages.js:42,337`), and the `/m` footer too. Wrap the `/sign` sheet in `<main>`.
- **Sign QR (I3):** wrap `qrSvg` in `role="img" aria-label="QR: ${menuUrl}"` (`pages.js:377`).
- **C1:** wrap ชวน in `<span lang="th">` in each intro. Split the string, or build the intro in `home.js`.
- **C2:** add `:lang(en), :lang(de), :lang(fr), :lang(es) { font-family: var(--font-family-latin); }` after `app.css:22`.
- **A12:** load the chip glyphs, e.g. `family=Noto+Sans+KR&text=한국어`, plus SC and JP the same way.
- **J3:** render the video without `autoplay` and call `vid.play()` in `home.js` when motion is allowed, so reduced-motion users without JS don't get autoplay.
- **Visitor logo:** it links to `/?lang=ru` (`pages.js:337`), and ru is not a home language, so the visitor lands on Thai or their browser language. Map ru to en.
- **Chip style:** the `/m` chips keep a navy-tint border while the home chips have none. Make them consistent.
- **H2:** show the special only in the highlight, and skip it in its section.
- **Printing wording:** the editor says "พิมพ์ป้าย QR" while home says "ปริ้นต์". Pick one: "ปริ้นป้าย QR" (common) or "พรินต์" (standard spelling).
- **Dead code:** remove the unused copy keys `headerCta`, `ctaStart`, `finalCta` (24 strings) and the unused `color.neutral-100`, or reuse it (Medium 5).
- **Translation validator:** `translate.js:69-70` rejects a whole batch when two different Thai strings share a correct translation (e.g. two descriptions both meaning "spicy"). That item would stay in Thai forever. Limit the check to `name` keys.
- **Taglines:** fr "Bienvenue, dans votre langue." and de "Willkommen, in Ihrer Sprache." read with an unnatural comma. Drop the comma.
- **Thai line breaks:** the centred intro breaks "ต่าง|ชาติ" and "ภาษา|ไทย". Join these with U+2060 in the copy.
- **Photos:** unchanged from the first report. The vendor wears a mask, the "idea" cart already has English signs, and the "origin" photo is a temple.
