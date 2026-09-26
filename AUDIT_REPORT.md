# ChuanLocal audit report

**What was checked:** branch `chuanlocal-rebrand` at commit `6983544`, plus uncommitted changes to `src/pages.js`, `src/icons.js` and `public/sign.css` that appeared during the audit (the sign's "Scan me" frame). The sign findings cover that uncommitted version. `public/slides/` is excluded.

**Pages seen:** the live site (`/`, `/start`, `/m/zk596ie` in all 8 languages), and a local `wrangler dev` run for `/edit` and `/sign` (screenshots and a print-to-PDF). Both light and dark mode, at 520px and 1280px.

**Checklist:** the evals are in `EVALS.md`. Owner decisions (Unsplash photos, flags on the sign, 8 or 7+th languages, page structure, splash) are not treated as violations.

**Token audit** (`token-audit-template.sh`): `src` passes, and `public` (without `slides`) passes. Every `var(--…)` used is defined. The tokens the app added are mirrored in both `tokens.json` and `tokens.css`, and the upstream values are untouched.

## Results

| id | Result | Evidence |
|---|---|---|
| A1 | Pass | The audit script passes on `src` and `public`. It doesn't catch a few magic numbers in JS (`public/home.js:27` 5000ms failsafe, `:44` `0.1`, fallbacks `560/1250/0.18`). Low. |
| A2 | Pass | No undefined variables (diffed the used names against `public/tokens.css`) |
| A3 | Pass | The diff against `4. Design Systems/tokens.*` shows only additions (scrim, layout, motion, print). |
| A4 | Pass | Screenshots of start, edit, list and home in light and dark mode all follow the white/navy roles. |
| A5 | Pass | White text appears only on navy or on the navy scrim (`home.css:4-16`, `sign.css` `.scan-tab`). |
| A6 | Pass | Clay is used only for the overline dot, the highlight/alert rules, the pressed-star icon and the error dot. |
| A7 | Pass | `app.css:82` hover uses `accent-brand-hover`. |
| A8 | **Fail** | Home: the header "Make your sign" and the hero "Make your sign, free" are both primary in the first view (`home.js:49,62`). Edit (new shop): the LINE share and "save" buttons are both primary (`pages.js:112,132`). |
| A9 | Pass | `.btn`, inputs, `.choice`, chips and header links all have `min-height: layout-touch-target`. |
| A10 | Pass | No emoji in `src`/`public`. Icons are line SVG. On the sign, the "Scan me" tab uses a **calendar** icon (`pages.js:368`), which is the wrong meaning (low). |
| A11 | Pass | `app.css:164` uses strike-through with a secondary colour and a word tag, not opacity. |
| A12 | Partial | Labels are in their own script, with no flags. But only the current language's CJK/Cyrillic font is loaded (`pages.js:21-25`), so the other chips fall back to system fonts. On live `/m/zk596ie?lang=en` the 한국어 chip sits visibly off-baseline. |
| A13 | Pass | Section heading, highlight block, list row and status tag match DM. |
| A14 | Pass | Paths come unchanged from the supplied SVGs. Header lockup is 160px, sign lockup 48mm, and nothing sits inside the QR. |
| B1 | Pass | Navy/white is 16.6:1, navy-700 on white 7.83, navy-700 on navy-50 7.25, navy-200 on navy 10.8. White on the scrim over a white pixel is 8.17. The clay icon on navy-850 is 3.02 (just passes). |
| B2 | Pass | `app.css:25,113` |
| B3 | Pass | Special has the word label "Today's special"/"พิเศษวันนี้". Sold out has the word. Errors have text. |
| B4 | **Fail** | `mark('logo-mark','')` renders `role="img" aria-label=""` in the final CTA (`home.js:124`). The splash copy is under `aria-hidden`, so that one is fine. |
| B5 | Pass | `#status` has `role="status" aria-live="polite"`. |
| B6 | Pass | Splash, parallax, rise-in and progress all respect `prefers-reduced-motion`. |
| B7 | **Fail** | The inline head script adds `.anim`, which shows a full-screen navy splash (`home.js:33`, `app.css:195`). Only `/home.js`, loaded with `defer`, ever removes it, and the 5s failsafe lives in that same file. If `/home.js` fails to load (a patchy market connection, a blocked script), a first-time visitor sees a navy screen forever. |
| C1 | Partial | Mostly correct. But when a translation is missing, the item name and shop name fall back to Thai inside an element tagged with the visitor's language (`pages.js:290,296,304,331`). Thai text gets tagged `en`/`zh`, so it renders in the wrong font. |
| C2 | Pass | `app.css:18-22` and the font links per page are correct. Thai line height is 1.6. |
| C3 | **Fail** | On non-Thai home pages, the hero overline `<span lang="th">ชวน</span>` inherits `letter-spacing: 0.15em` and uppercase from `.overline` (`home.js:58`, `app.css:53-58`). The rule only resets elements that are *themselves* `.overline:lang(th)`. It is visibly tracked in the 1280px EN screenshot. |
| C4 | Pass | Only the base fonts plus the current language's font load. The sign loads all 4 extra fonts, which is correct because it shows all scripts. |
| C5 | Pass | 8 languages, `hreflang` alternates plus `x-default`, and the default falls back to `th` (`index.js:44`). |
| C6 | Pass | `pickLang` reads Accept-Language, falls back to en, and there are 8 chips. |
| C7 | **Fail** | See findings M4–M8 and L-list: Thai ambiguity and calques, zh 旅游团, es "casas de masaje", ko 당신, and others. |
| C8 | **Fail** | Live demo: the German list is **shifted by one row**, and the ko and ru descriptions invert "mildly spicy". See H1–H2. |
| D1 | Pass | No menu, magic, AI, accurate, perfect, understand or translation software in any language. "แปล" appears only on the vendor save button, which is fine. |
| D2 | Pass | list, read, type in Thai, today's special, sold out and point at it are all used. |
| D3 | **Fail** | Thai hero "ชวนลูกค้า**ทุกภาษา**เข้าร้าน" ("customers of every language") and the new sign markup `aria-label="7 languages"` (`pages.js:366`). BP: "No language count as a claim." |
| D4 | **Fail** | "Free" goes well beyond the sanctioned footer line. In Thai, ฟรี appears 7× on home (`home-copy.js:14,17,28,37,47,48,49`) plus `/start` (`pages.js:61`). In EN it appears 4× (`:58,69,88,90`). This is an owner decision (see M6). |
| D5 | Pass | No deficit framing. The vendor is the subject of the sentences. |
| D6 | Pass | "Automatically translated from Thai" plus "To order, show the Thai name to the vendor", localised in all 7 languages. |
| D7 | Pass | `i18n.js` `scan` lines, as seen on the sign. |
| E1 | Pass | EN and all non-Thai heroes carry the tagline. The Thai hero is a vendor-facing line (acceptable, but see D3). |
| E2 | Pass | s2 carries the essence, and nothing claims "connects" in the present tense. |
| E3 | Pass | Steps and s2 cover own language, the Thai underneath and no app/account. |
| E4 | Pass | EN "A lost sale looks like a quiet day." The Thai version is a literal calque (M5). |
| E5 | Pass | The example link goes to the demo ข้าวซอยป้าศรี (`/m/zk596ie`). |
| E6 | Pass | `vNote` names food, massage, tours and gift shops. The sign line is neutral. |
| E7 | **Fail** | The Thai page explains ชวน to Thai readers (`home-copy.js:19`), and section 7 speaks *to tourists* in Thai (`:38-44`). See M8. |
| E8 | Pass | No in-person-setup claim. |
| F1 | Pass | The order matches (`home.js:54-129`). The intro is on a light background in light mode, capped at 50rem (800px). |
| F2 | Pass (notes) | Unsplash photos, credited in the footer. See L-list for choices that weaken the story. |
| F3 | Pass | Shows on first visit only (localStorage) and is skipped for reduced motion. The robustness gap is B7. |
| F4 | Pass | `flags/` is referenced only in `signPage` (`pages.js:366`). |
| G1 | Pass | Chrome print-to-PDF gives **1 page**. Margins come from `print-page-margin`. |
| G2 | Pass | `margin: 4`, error correction M, black on white. Note that the 70mm includes the quiet zone, so the code itself is about 55mm (low). |
| G3 | Pass | The lockup is at the bottom, 48mm wide. |
| G4 | Pass | Each line is `lang`-tagged and uses the right family. |
| G5 | Partial | Globe and 7 flags are present as requested. Problems: the calendar icon on "Scan me", and the count in `aria-label` (D3). |
| G6 | **Fail** | The new `scan-note` "Today's list, kept up to date by the vendor" is English-only (`pages.js:370`). The Thai half that was there before was removed. |
| H1 | Pass | Each row shows name, price, Thai name and description. |
| H2 | Pass | Tested locally. The special appears twice (in the highlight and again in its section), which is low-level noise. |
| H3 | Pass | Freshness and the "show the Thai name" hint are localised in all 7 languages. |
| H4 | **Fail** | The chip rows scroll horizontally with the scrollbar hidden (`app.css:148` `scrollbar-width:none`). At 520px, the visitor page cuts off at "Русский", so Deutsch, Français and ไทย are invisible and nothing hints that you can scroll. On the home page, Español, Français and Deutsch are cut off. |

## Findings, by priority

### High

**H1. The live German list shows wrong names next to prices**
- **Where:** `https://chuanlocal.michelle-c98.workers.dev/m/zk596ie?lang=de`, and `src/translate.js:118-122`.
- **What's wrong:** the ฿70 beef item is titled "Bami Kaeng Kati Sut Chiang Mai (Nudelsuppe in Kokosmilch, Chiang Mai Stil)". The chicken item's description reads "Khao Soi Neua (…mit Rindfleisch…)". Sai Ua's description is "Sai Krok Samun Phrai Nuea". The model returned an array of the right length but in the wrong order, and `parseArray` only checks the length. This is the public demo linked from the home page.
- **Fix:**
  - Send keyed input and require keyed output, e.g. `{"1":"ข้าวซอยไก่",…}` → `{"1":"…"}`, and map by key.
  - Or translate names and descriptions in separate calls.
  - Reject any batch where an output is identical to the output for a different input.
  - Then re-save the demo shop.

**H2. The Korean and Russian lists invert "เผ็ดน้อย" (mildly spicy) to "not spicy"**
- **Where:** `/m/zk596ie?lang=ko` shows "맵지 않음". `/m/zk596ie?lang=ru` shows "Не острое".
- **What's wrong:** a spice-sensitive visitor is told the dish isn't spicy.
- **Other translation errors in the same demo:**
  - ko: "갈릭 코코넛 커리 국수" adds garlic, which isn't in the Thai.
  - zh: "北府菜" / "北府草药香肠" should be 泰北. "金藏面" is meaningless for ขนมจีนน้ำเงี้ยว. Pinyin is appended to every Chinese line, including a typo, "yēnáin".
  - ko and fr: the shop name gets a dish explanation in brackets ("Khao Soi Pa Sri (Soupe de nouilles…)").
- **Fix:**
  - Hand-correct the demo shop, since it is the showcase. Suggested corrections: ko "약간 매움", ru "Слегка острое", zh "泰北菜 / 泰北香草香肠 / 泰北米线（Khanom Jeen Nam Ngiao）".
  - Add to `systemPrompt`: "Never add romanisation to Chinese, Japanese or Korean output. Do not explain shop names. Keep spice levels exact (เผ็ดน้อย = mildly spicy)."
  - This is what the "point at the Thai" promise protects against. It only works if the translation isn't confidently wrong.

### Medium

**M1. A first-time visitor can be stuck on the navy splash (B7)**
- **Where:** `src/home.js:33`, `public/app.css:194-198`, `public/home.js:27`.
- **Fix:** put the failsafe in the inline head script, e.g. `setTimeout(()=>document.documentElement.classList.remove('anim'),4000)`. Or let CSS end the splash by itself: add `animation: splash-out var(--motion-splash-out) ease calc(var(--motion-splash-in) + var(--motion-splash-hold)) forwards` together with `visibility:hidden` and `pointer-events:none` at the end.

**M2. Two primary buttons in one view (A8)**
- **Where:** `src/home.js:49` together with `:62`, and `src/pages.js:112` together with `:132`.
- **Fix:**
  - Home: make the header CTA `btn-secondary`, or hide it until the hero has scrolled out of view.
  - Edit (new shop): make "ส่งลิงก์เข้า LINE ของฉัน" the only primary while the alert shows, and render "บันทึกและแปล" as primary only once the vendor has made a change. Alternatively, make LINE secondary. It is the most important action on first visit, so the first option is better.

**M3. Language chips hide languages on phones (H4)**
- **Where:** `public/app.css:148`, seen on `/m/zk596ie` at 520px and on `/` at 520px.
- **Fix:** use `flex-wrap: wrap` for `.lang-switch` (8 chips fit in two rows), or at least show the scrollbar and fade the edge. The visitor must be able to find their own language in one glance. The same applies to Thai for a vendor previewing the page.

**M4. Thai uses "พิมพ์" for both *type* and *print* in consecutive steps**
- **Where:** `src/home-copy.js:32-33` ("พิมพ์รายการเป็นภาษาไทย" and then "พิมพ์ป้าย"), and `src/pages.js:61` ("พิมพ์รายการ… แล้วพิมพ์ป้าย QR").
- **What's wrong:** these are the core instructions, and the same verb means two different actions.
- **Fix:** keep "พิมพ์รายการเป็นภาษาไทย" for typing, and use "ปริ้นต์ป้าย QR" or "สั่งพิมพ์ป้าย (กระดาษ A4)" for printing. Start page: "พิมพ์รายการเป็นภาษาไทยในมือถือ แล้วปริ้นต์ป้าย QR ติดที่ร้าน".

**M5. Thai storytelling lines read as translations from English**
Voice rule: "Thai must be written… not translated".
- **`home-copy.js:22`:** "วันนั้นดูเหมือนแค่วันที่ร้านเงียบ" is a calque of "a lost sale looks like a quiet day". Suggested: "คุณก็เห็นแค่ว่า วันนี้ลูกค้าเงียบ ๆ".
- **`:24`:** "ภาษาไทยของคุณยังอยู่ ภาษาของลูกค้าอยู่ข้าง ๆ" is understandable but stiff. Suggested: "คุณเขียนภาษาไทยเหมือนเดิม ลูกค้าอ่านภาษาของเขาควบคู่กัน".
- **`:16`:** "โดยมีภาษาไทยอยู่ข้างใต้" should be "และมีชื่อภาษาไทยอยู่ด้านล่าง".
- All Thai copy still needs the native Thai writer that 08-voice.md requires. The file header admits this (`home-copy.js:2`).

**M6. "Free" is used far beyond the sanctioned footer line (D4)**
- **Where:** 7× on the Thai home page, plus `/start`. 4× in EN. Similar counts in the other languages.
- **What's wrong:** 12-brand-platform says "No 'free' until who pays is decided". AGENT-HANDOFF allows only the footer line "Free for vendors and visitors."
- **Fix (if the owner agrees):** keep the footer and the s3 origin line. Change the CTAs to "สร้างป้ายของคุณ" / "Make your sign", and the final body to a benefit such as "ไม่ต้องลงแอป ไม่ต้องสมัคร" / "No app. No account." This needs an owner decision, because "free" may be a deliberate lure for vendors.

**M7. "Every language" and language-count claims (D3)**
- **Where:** Thai hero `home-copy.js:12,15` "ชวนลูกค้าทุกภาษาเข้าร้าน", `:46` "ทุกคน", and `pages.js:366` `aria-label="7 languages"`.
- **Fix:**
  - Thai hero: "ชวนลูกค้าต่างชาติเข้าร้าน ด้วยภาษาของเขาเอง" or "ต้อนรับลูกค้า ด้วยภาษาของเขา". The second matches the tagline.
  - Sign: give the flag group a real name (`role="img" aria-label="Languages"`) or make it `aria-hidden="true"`. The visible sign lines already list the languages.

**M8. The Thai page speaks to the wrong reader in two places (E7)**
- **Intro (`home-copy.js:19`):** it opens by defining ชวน ("ชวน แปลว่า เชิญชวน"), which Thai vendors already know. Suggested: "ป้ายที่มีแต่ภาษาไทย ทำให้ลูกค้าต่างชาติต้องเดา ป้าย ChuanLocal ชวนเขาเข้าร้าน คุณพิมพ์ภาษาไทยเหมือนเดิม ลูกค้าอ่านเป็นภาษาของเขาเอง".
- **Section 7 (`:38-44`):** it tells the reader "เห็นป้ายแล้ว สแกนเลย" / "มองหาป้าย ChuanLocal", but a Thai reader is the vendor, not the tourist. Reframe it as "ลูกค้าของคุณจะเห็นอะไร", e.g. title "ลูกค้าสแกน แล้วอ่านได้เลย", with steps "สแกนด้วยกล้องมือถือ ไม่ต้องลงแอป" / "เปิดเป็นภาษาของเขาเอง" / "ชี้ชื่อภาษาไทยให้คุณดูตอนสั่ง".

**M9. Wrong or awkward words in other languages**
- **es, `home-copy.js:246`:** "casas de masaje" often implies sex work. Use "salones de masaje".
- **zh, `:159`:** "旅游团" means a *tour group*, not a tour business. Use "旅游服务".
- **zh, `:138`:** "欢迎，用你的语言。" is a calque of the English. Use "用你的语言，欢迎光临。"
- **zh "招牌" and ko "간판":** both mean a storefront signboard, not an A4 QR sign. Use zh "扫码牌" and ko "QR 안내판" (or "QR 안내문").
- **ko, `:94,97`:** "당신의 언어로" is stiff in Korean marketing. Use "내 언어로, 환영합니다" or "모국어로 환영합니다". Also, the Korean copy mixes 합니다 and 해요 endings (e.g. `:98`, `:118`). Pick one.

### Low

- **B4, `src/home.js:124`:** `role="img" aria-label=""`. Pass a label, or add an `aria-hidden` option to `mark()` for decorative uses.
- **C1, `src/pages.js:304,331`:** when a translation is missing, the fallback shows Thai text without Thai tagging. Add `lang="th"` to `.name`/`h1` whenever `tName === name_th` in a non-Thai view.
- **C3, `public/app.css:58`:** add `.overline :lang(th), .overline :lang(zh), .overline :lang(ja), .overline :lang(ko) { letter-spacing: normal; }`.
- **A12, `src/pages.js:21-25`:** load only the glyphs the chips need, using `&text=` (e.g. `Noto+Sans+KR&text=한국어`), so each chip label renders in its own family.
- **Sign, `src/pages.js:368`:**
  - The calendar icon on "Scan me" should be `qr` or `camera`.
  - "Scan me" repeats the sign line below it. Consider dropping it, or using the tab for the Thai vendor-voice line "สแกนเลย" alone.
- **G6, `src/pages.js:370`:** the scan-note is English-only. Either restore the Thai half, or drop the note, since the sign lines already carry the message in 8 languages.
- **Visitor page, `pages.js:330`:** `aria-label="Language"` is English on every language. Localise it (the home page already does, via `c.lang`).
- **Visitor page, `pages.js:335-337`:** the special appears twice, in the highlight and in its section. Either skip it in the section, or mark it with a small star in the list only.
- **fr, `home-copy.js:280`:** "Un geste pour…" should be "D'un simple toucher…". The visitor page says "Offre du jour" (`i18n.js:71`) but home says "suggestion du jour". Pick one.
- **de, `:321`:** "Ein Tipp" reads as "a tip". Use "Ein Fingertipp".
- **es, `:220`:** "Bienvenido" is masculine. "Te damos la bienvenida, en tu idioma." is neutral.
- **ja, `:180`:** "リスト" is odd for a price list. "メニュー表 / 価格表" is more natural. The English ban on "menu" doesn't apply here.
- **ko, `:108`:** "시작" for "where it came from". Use "탄생 배경".
- **Photos (`home-copy.js:342-349`):**
  - The "idea" photo is a cart whose signs are already in English ("THAI MILK TEA"), which undercuts the Thai-only problem.
  - The "origin" photo is a temple (Wat Chedi Luang), not a vendor.
  - The "problem" vendor wears a COVID mask, which dates the page.
  - Better choices: a Thai-only handwritten price board, and a massage or gift stall so the page isn't food-only.
  - The 76% navy scrim on hero and CTA turns candid photos monochrome. It is fine for contrast, but consider a bottom-weighted gradient scrim so the photo reads as real.
- **Edit hint, `pages.js:125`:** "กด "พิเศษวันนี้" ครั้งเดียว บันทึกทันที" covers only the star, but sold out also saves instantly. Use "กด พิเศษวันนี้ หรือ หมด ได้เลย บันทึกให้ทันที".
- **QR size, `sign.css:17`:** `print-qr-size` 70mm includes the quiet zone, so the code itself is about 55mm. That is fine for scanning, but state it in the token description.
- **Hard-coded JS numbers, `public/home.js:27,44`:** move them to tokens, or accept them as behaviour rather than style.

## Improvements for the audience

1. **Show the Thai vendor what their customer sees.** On the Thai home page, section 7 should be a real phone screenshot of ข้าวซอยป้าศรี in English or Chinese, with the Thai name visible under each item, captioned "ลูกค้าของคุณจะเห็นแบบนี้". Vendors trust what they can see more than steps. Brand-strategy-page: "What they notice is the awkward moment over price at their own counter. Lead with that."
2. **Lead the Thai problem section with the counter moment, not an abstract loss.** For example: "ลูกค้าต่างชาติชี้ ๆ ถามราคา ต้องกดเครื่องคิดเลขคุยกัน" ("Foreign customers point, ask the price, and you end up talking through a calculator"), then the walk-past. This is the vendor's own experience (brand-strategy-page, "Point and guess, or use a calculator for the price"). "A quiet day" is the strategist's insight, not something the vendor feels.
3. **Remove the fear of the unknown on `/start`.** In one line, say what happens next and what they keep: "ใช้เวลาไม่กี่นาที · ได้ลิงก์ส่วนตัวเก็บไว้ใน LINE · แปลให้อัตโนมัติ ถ้าคำไหนแปลแปลก ลูกค้ายังชี้ชื่อภาษาไทยได้" ("Takes a few minutes · you get a private link to keep in LINE · translated automatically, and if a word reads oddly, customers can still point at the Thai name"). This is candid about automatic translation (voice trait 3) and names LINE, the vendor's own tool.
4. **Make "point at the Thai" physical on the visitor page.** Pillar 2 is the least-proven pillar and carries the essence. Let a visitor tap an item to show its Thai name large, full-screen, to hand the phone to the vendor. The hint "To order, show the Thai name to the vendor" then becomes one tap instead of an instruction. Until H1 and H2 are fixed, this is also the visitor's safety net.
5. **Get the Thai (and CJK) copy written natively, and fix the demo first.** The demo list is the first thing both audiences see. A shifted German list and wrong spice levels undo "read it in your own language" faster than any copy can build it. Have a native Thai writer own the vendor copy and the sign's Thai line, as 08-voice.md requires, and have a native speaker check zh, ko and ja.
