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

// SEA-LION is tuned for Southeast Asian languages and handled Thai dish names best in testing.
const PRIMARY_MODEL = '@cf/aisingapore/gemma-sea-lion-v4-27b-it';
const BACKUP_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
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
    : `For well-known Thai dishes, use the common ${name} name for the dish, or a ${name} transliteration followed by a short ${name} explanation in parentheses.`;
  return [
    `You translate Thai text from ${SHOP_KIND[type] || SHOP_KIND.food} into ${name} for foreign tourists.`,
    dishRule,
    `Write everything in ${name}. Never output Thai script. Transliterate names of people and shops into ${name} (e.g. ป้าแดง = "Auntie Daeng").`,
    'Keep numbers, sizes and durations. Do not add prices, opinions or information that is not in the Thai text.',
    'Input is a JSON array of Thai strings. Reply with ONLY a JSON array of translated strings, same length and same order. No markdown, no comments.',
  ].join('\n');
}

function aiText(res) {
  if (!res) return '';
  if (typeof res.response === 'string') return res.response;
  if (Array.isArray(res.response)) return JSON.stringify(res.response);
  const c = res.choices?.[0]?.message?.content;
  return typeof c === 'string' ? c : '';
}

function parseArray(text, expectedLen) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  try {
    const arr = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(arr) || arr.length !== expectedLen) return null;
    return arr.map((s) => String(s ?? '').trim());
  } catch {
    return null;
  }
}

async function llmBatch(env, model, strings, lang, type) {
  const res = await env.AI.run(model, {
    messages: [
      { role: 'system', content: systemPrompt(lang, type) },
      { role: 'user', content: JSON.stringify(strings) },
    ],
    max_tokens: 4000,
    temperature: 0.2,
  });
  return parseArray(aiText(res), strings.length);
}

async function mtBatch(env, strings, lang) {
  return Promise.all(
    strings.map(async (text) => {
      try {
        const r = await env.AI.run(MT_MODEL, { text, source_lang: 'th', target_lang: lang });
        return r?.translated_text || null;
      } catch {
        return null;
      }
    }),
  );
}

async function translateBatch(env, strings, lang, type) {
  for (const model of [PRIMARY_MODEL, BACKUP_MODEL]) {
    try {
      const out = await llmBatch(env, model, strings, lang, type);
      if (out) return out;
    } catch (e) {
      console.log('translate error', model, lang, e?.message);
    }
  }
  return mtBatch(env, strings, lang);
}

/**
 * Translate unique Thai strings into every tourist language.
 * Returns { [lang]: { [thai]: translated } }. Strings that failed to translate are left out,
 * so callers can keep the Thai text for now and retry on the next save.
 */
export async function translateStrings(env, strings, type) {
  const unique = [...new Set(strings.filter((s) => s && s.trim()))];
  const out = Object.fromEntries(LANGS.map((l) => [l, {}]));
  if (!unique.length) return out;

  const batches = [];
  for (let i = 0; i < unique.length; i += BATCH) batches.push(unique.slice(i, i + BATCH));

  await Promise.all(
    LANGS.flatMap((lang) =>
      batches.map(async (batch) => {
        const res = await translateBatch(env, batch, lang, type);
        batch.forEach((th, i) => {
          if (res[i]) out[lang][th] = res[i];
        });
      }),
    ),
  );
  return out;
}
