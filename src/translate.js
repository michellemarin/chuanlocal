// Thai -> tourist languages, using Cloudflare Workers AI (no API key needed).
// To switch providers later (e.g. Claude), replace translateStrings() only.

export const LANGS = ['en', 'zh', 'ko', 'ja', 'ru', 'de', 'fr'];

const LANG_NAMES = {
  en: 'English',
  zh: 'Simplified Chinese',
  ko: 'Korean',
  ja: 'Japanese',
  ru: 'Russian',
  de: 'German',
  fr: 'French',
};

// Compared on the demo stall (Sep 27): gpt-oss-120b kept spice levels and dish types right in all 7 languages;
// SEA-LION (tuned for Southeast Asia) is the backup. Override for testing via globalThis.__TR_MODEL.
const PRIMARY_MODEL = globalThis.__TR_MODEL || '@cf/openai/gpt-oss-120b';
const BACKUP_MODEL = '@cf/aisingapore/gemma-sea-lion-v4-27b-it';
const MT_MODEL = '@cf/meta/m2m100-1.2b';

const BATCH = 30;

const SHOP_KIND = {
  food: 'a Thai street food stall / restaurant menu',
  service: 'a Thai service business price list (e.g. massage, tours, laundry, rentals)',
  shop: 'a Thai gift shop / product price list',
};

function systemPrompt(lang, type) {
  const name = LANG_NAMES[lang];
  const latin = ['en', 'de', 'fr'].includes(lang);
  const dishRule = latin
    ? `For well-known Thai dishes, write the romanized Thai name followed by a short ${name} explanation in parentheses, e.g. "Pad Kra Pao Moo (${lang === 'en' ? 'stir-fried holy basil with minced pork' : `…explanation in ${name}…`})".`
    : `For well-known Thai dishes, use the common ${name} name for the dish, or a short ${name} description of it. Write only in ${name} script: no romanization, pinyin or romaji in brackets.`;
  return [
    `You translate Thai text from ${SHOP_KIND[type] || SHOP_KIND.food} into ${name} for foreign tourists.`,
    dishRule,
    `Write everything in ${name}. Never output Thai script. Transliterate names of people and shops into ${name} (e.g. ป้าแดง = "Auntie Daeng"), and do not add explanations to shop names.`,
    'Translate exactly: keep numbers, sizes, durations and spice levels as written (เผ็ดน้อย = mildly spicy, not "not spicy"). Do not add ingredients, prices, opinions or anything not in the Thai text.',
    'Input is a JSON object mapping keys to Thai strings. Each key is a separate, unrelated item: translate each value on its own. The key prefix says what it is:',
    '- "name…": an item name. Apply the dish rule above to well-known Thai dishes.',
    '- "desc…" and "section…": a description or a category heading. Plain translation only: no romanized Thai, no brackets, no explanations.',
    '- "shop…": the shop name. Transliterate personal names and translate ordinary words; no brackets, no explanations.',
    'Reply with ONLY a JSON object with exactly the same keys, each mapped to its translation. No markdown, no comments.',
  ].join('\n');
}

function aiText(res) {
  if (!res) return '';
  if (typeof res.response === 'string') return res.response;
  if (res.response && typeof res.response === 'object') return JSON.stringify(res.response);
  const c = res.choices?.[0]?.message?.content;
  return typeof c === 'string' ? c : '';
}

// Read the reply back by key, so a reordered reply can't shift names onto the wrong prices.
const THAI = /[\u0E00-\u0E7F]/;

function parseKeyed(text, strings) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    const out = strings.map((it, i) => String(obj[`${it.kind}${i + 1}`] ?? '').trim());
    if (out.some((s) => !s || THAI.test(s))) return null;
    // Two different Thai strings should never come back identical.
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) if (out[i] === out[j] && strings[i].text !== strings[j].text) return null;
    return out;
  } catch {
    return null;
  }
}

async function llmBatch(env, model, strings, lang, type) {
  const input = Object.fromEntries(strings.map((it, i) => [`${it.kind}${i + 1}`, it.text]));
  const res = await env.AI.run(model, {
    messages: [
      { role: 'system', content: systemPrompt(lang, type) },
      { role: 'user', content: JSON.stringify(input) },
    ],
    max_tokens: 8000,
    temperature: 0.1,
  });
  return parseKeyed(aiText(res), strings);
}

async function mtBatch(env, strings, lang) {
  return Promise.all(
    strings.map(async ({ text }) => {
      try {
        const r = await env.AI.run(MT_MODEL, { text, source_lang: 'th', target_lang: lang });
        const t = r?.translated_text;
        return t && !THAI.test(t) ? t : null;
      } catch {
        return null;
      }
    }),
  );
}

async function translateBatch(env, strings, lang, type) {
  // The primary gets a second try: under load a reply sometimes comes back empty or cut off.
  for (const model of [PRIMARY_MODEL, PRIMARY_MODEL, BACKUP_MODEL]) {
    try {
      const out = await llmBatch(env, model, strings, lang, type);
      if (out) return out;
    } catch (e) {
      console.log('translate error', model, lang, e?.message);
    }
  }
  // No machine-translation fallback: in testing it produced wrong words. Thai shows until the next save retries.
  return strings.map(() => null);
}

/**
 * Translate Thai strings into every tourist language.
 * `entries` is a list of { kind: 'name' | 'desc' | 'section' | 'shop', text }.
 * Returns { [lang]: { [key(kind, text)]: translated } }. Anything that failed is left out,
 * so callers keep the Thai text for now and retry on the next save.
 */
export const key = (kind, text) => `${kind}:${text}`;

export async function translateStrings(env, entries, type) {
  const seen = new Set();
  const unique = entries.filter((e) => e.text && e.text.trim() && !seen.has(key(e.kind, e.text)) && seen.add(key(e.kind, e.text)));
  const out = Object.fromEntries(LANGS.map((l) => [l, {}]));
  if (!unique.length) return out;

  const batches = [];
  for (let i = 0; i < unique.length; i += BATCH) batches.push(unique.slice(i, i + BATCH));

  await Promise.all(
    LANGS.flatMap((lang) =>
      batches.map(async (batch) => {
        const res = await translateBatch(env, batch, lang, type);
        batch.forEach((e, i) => {
          if (res[i]) out[lang][key(e.kind, e.text)] = res[i];
        });
      }),
    ),
  );
  return out;
}
