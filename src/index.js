import { Hono } from 'hono';
import QRCode from 'qrcode';
import { pickLang } from './i18n.js';
import { editPage, menuPage, notFoundPage, signPage, startPage } from './pages.js';
import { LANGS, translateStrings } from './translate.js';

const app = new Hono();

const MAX_ITEMS = 200;
const TYPES = ['food', 'service', 'shop'];

function randomToken(bytes, alphabet) {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return [...buf].map((b) => alphabet[b % alphabet.length]).join('');
}
// Public, short, unambiguous (no 0/o/1/l).
const newSlug = () => randomToken(7, 'abcdefghijkmnpqrstuvwxyz23456789');
// Private edit key: 32 chars from 62 symbols (~190 bits).
const newSecret = () => randomToken(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

async function shopBySecret(db, secret) {
  return db.prepare('SELECT * FROM shops WHERE secret = ?').bind(secret).first();
}

async function shopItems(db, shopId) {
  const { results } = await db.prepare('SELECT * FROM items WHERE shop_id = ? ORDER BY sort, id').bind(shopId).all();
  return results;
}

const html = (c, body, status = 200) => c.html(body, status, { 'cache-control': 'no-store' });

// ---------- Vendor pages ----------

app.get('/', (c) => html(c, startPage()));

app.post('/create', async (c) => {
  const form = await c.req.parseBody();
  const name = clean(form.name, 80);
  const type = TYPES.includes(form.type) ? form.type : 'food';
  if (!name) return html(c, startPage({ error: 'กรุณาใส่ชื่อร้าน' }), 400);

  const secret = newSecret();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await c.env.DB.prepare('INSERT INTO shops (slug, secret, type, name_th) VALUES (?, ?, ?, ?)')
        .bind(newSlug(), secret, type, name)
        .run();
      return c.redirect(`/edit/${secret}?new=1`, 303);
    } catch (e) {
      if (!String(e?.message).includes('UNIQUE')) throw e;
    }
  }
  return html(c, startPage({ error: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }), 500);
});

app.get('/edit/:secret', async (c) => {
  const shop = await shopBySecret(c.env.DB, c.req.param('secret'));
  if (!shop) return html(c, notFoundPage(), 404);
  const items = await shopItems(c.env.DB, shop.id);
  const origin = new URL(c.req.url).origin;
  return html(c, editPage({ shop, items, origin, isNew: c.req.query('new') === '1' }));
});

app.get('/sign/:secret', async (c) => {
  const shop = await shopBySecret(c.env.DB, c.req.param('secret'));
  if (!shop) return html(c, notFoundPage(), 404);
  const menuUrl = `${new URL(c.req.url).origin}/m/${shop.slug}`;
  const qrSvg = await QRCode.toString(menuUrl, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
  return html(c, signPage({ shop, menuUrl, qrSvg }));
});

// ---------- Vendor API ----------

app.post('/api/:secret/save', async (c) => {
  const db = c.env.DB;
  const shop = await shopBySecret(db, c.req.param('secret'));
  if (!shop) return c.json({ error: 'not found' }, 404);

  const body = await c.req.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) return c.json({ error: 'bad request' }, 400);

  const name = clean(body.name, 80) || shop.name_th;
  const incoming = body.items.slice(0, MAX_ITEMS).map((it, i) => ({
    id: Number.isInteger(it.id) ? it.id : null,
    sort: i,
    section: clean(it.section, 60),
    name: clean(it.name, 120),
    desc: clean(it.desc, 200),
    price: clean(it.price, 20),
    special: !!it.special,
    soldOut: !!it.soldOut,
  })).filter((it) => it.name);
  // At most one special.
  let seenSpecial = false;
  for (const it of incoming) {
    if (it.special && seenSpecial) it.special = false;
    if (it.special) seenSpecial = true;
  }

  const existing = new Map((await shopItems(db, shop.id)).map((r) => [r.id, r]));

  // Work out which Thai text needs (re)translating.
  const shopTr = JSON.parse(shop.name_tr || '{}');
  const shopNeeds = name !== shop.name_th || LANGS.some((l) => !shopTr[l]);
  const toTranslate = shopNeeds ? [name] : [];
  for (const it of incoming) {
    const prev = it.id != null ? existing.get(it.id) : null;
    it.src = JSON.stringify([it.section, it.name, it.desc]);
    const prevTr = prev ? JSON.parse(prev.tr || '{}') : {};
    if (prev && prev.src === it.src && LANGS.every((l) => prevTr[l])) {
      it.tr = prev.tr;
    } else {
      it.tr = null;
      toTranslate.push(it.section, it.name, it.desc);
    }
  }

  const dict = await translateStrings(c.env, toTranslate, shop.type);
  // Only languages where every non-empty field translated are stored; missing ones retry next save.
  const trFor = (fields) => {
    const tr = {};
    for (const l of LANGS) {
      const out = {};
      let ok = true;
      for (const [k, th] of Object.entries(fields)) {
        if (!th) out[k] = '';
        else if (dict[l][th]) out[k] = dict[l][th];
        else ok = false;
      }
      if (ok) tr[l] = out;
    }
    return tr;
  };

  const newShopTr = shopNeeds
    ? Object.fromEntries(Object.entries(trFor({ name })).map(([l, v]) => [l, v.name]))
    : shopTr;
  for (const it of incoming) {
    if (!it.tr) it.tr = JSON.stringify(trFor({ name: it.name, desc: it.desc, section: it.section }));
  }

  const keepIds = new Set(incoming.filter((it) => it.id != null && existing.has(it.id)).map((it) => it.id));
  const stmts = [db.prepare('UPDATE shops SET name_th = ?, name_tr = ? WHERE id = ?').bind(name, JSON.stringify(newShopTr), shop.id)];
  for (const id of existing.keys()) {
    if (!keepIds.has(id)) stmts.push(db.prepare('DELETE FROM items WHERE id = ? AND shop_id = ?').bind(id, shop.id));
  }
  for (const it of incoming) {
    const vals = [it.sort, it.section, it.name, it.desc, it.price, it.special ? 1 : 0, it.soldOut ? 1 : 0, it.src, it.tr];
    if (it.id != null && keepIds.has(it.id)) {
      stmts.push(
        db.prepare(
          'UPDATE items SET sort=?, section_th=?, name_th=?, desc_th=?, price=?, is_special=?, sold_out=?, src=?, tr=? WHERE id=? AND shop_id=?',
        ).bind(...vals, it.id, shop.id),
      );
    } else {
      stmts.push(
        db.prepare(
          'INSERT INTO items (sort, section_th, name_th, desc_th, price, is_special, sold_out, src, tr, shop_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
        ).bind(...vals, shop.id),
      );
    }
  }
  await db.batch(stmts);

  const saved = await shopItems(db, shop.id);
  return c.json({
    ok: true,
    items: saved.map((r) => ({
      id: r.id,
      section: r.section_th,
      name: r.name_th,
      desc: r.desc_th,
      price: r.price,
      special: !!r.is_special,
      soldOut: !!r.sold_out,
    })),
  });
});

app.post('/api/:secret/special', async (c) => {
  const db = c.env.DB;
  const shop = await shopBySecret(db, c.req.param('secret'));
  if (!shop) return c.json({ error: 'not found' }, 404);
  const { id } = await c.req.json().catch(() => ({}));
  await db
    .prepare('UPDATE items SET is_special = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE shop_id = ?')
    .bind(Number.isInteger(id) ? id : -1, shop.id)
    .run();
  return c.json({ ok: true });
});

app.post('/api/:secret/soldout', async (c) => {
  const db = c.env.DB;
  const shop = await shopBySecret(db, c.req.param('secret'));
  if (!shop) return c.json({ error: 'not found' }, 404);
  const { id, soldOut } = await c.req.json().catch(() => ({}));
  if (!Number.isInteger(id)) return c.json({ error: 'bad request' }, 400);
  await db.prepare('UPDATE items SET sold_out = ? WHERE id = ? AND shop_id = ?').bind(soldOut ? 1 : 0, id, shop.id).run();
  return c.json({ ok: true });
});

// ---------- Tourist page ----------

app.get('/m/:slug', async (c) => {
  const db = c.env.DB;
  const shop = await db.prepare('SELECT * FROM shops WHERE slug = ?').bind(c.req.param('slug')).first();
  if (!shop) return html(c, notFoundPage(), 404);
  const items = await shopItems(db, shop.id);
  const lang = pickLang(c.req.query('lang'), c.req.header('accept-language'));
  return html(c, menuPage({ shop, items, lang, path: `/m/${shop.slug}` }));
});

app.notFound((c) => html(c, notFoundPage(), 404));

export default app;
