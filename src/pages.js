import { lockup, mark } from './brand.js';
import { LANG_LABELS, UI } from './i18n.js';
import { icon } from './icons.js';
import { LANGS } from './translate.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Safe to embed inside <script>.
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// Load only the fonts a page needs (design.md: "Load only the fonts a page needs").
const FONT_FAMILIES = {
  base: ['Poppins:wght@400;500;600;700', 'Prompt:wght@400;500;600;700'],
  zh: ['Noto+Sans+SC:wght@400;600;700'],
  ja: ['Noto+Sans+JP:wght@400;600;700'],
  ko: ['Noto+Sans+KR:wght@400;600;700'],
  ru: ['Montserrat:wght@400;600;700'],
};

export function fontLinks(langs = []) {
  const fams = [...FONT_FAMILIES.base, ...langs.flatMap((l) => FONT_FAMILIES[l] || [])];
  const href = `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join('&')}&display=swap`;
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${href}">`;
}

export function layout({ title, lang = 'th', body, head = '', fonts = [], css = ['/app.css'], theme = '' }) {
  return `<!doctype html><html lang="${esc(lang)}"${theme ? ` data-theme="${theme}"` : ''}><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${fontLinks([lang, ...fonts])}
<link rel="stylesheet" href="/tokens.css">
${css.map((h) => `<link rel="stylesheet" href="${h}">`).join('')}
${head}</head>
<body>${body}</body></html>`;
}

const appHeader = (right = '') => `<header class="app-header"><a href="/" aria-label="ChuanLocal">${lockup()}</a>${right}</header>`;

const TYPES = [
  { v: 'food', icon: 'bowl', th: 'ร้านอาหาร / เครื่องดื่ม' },
  { v: 'service', icon: 'hand', th: 'บริการ (นวด ทัวร์ ซักรีด เช่ารถ ฯลฯ)' },
  { v: 'shop', icon: 'bag', th: 'ร้านค้า / ของฝาก' },
];

const PLACEHOLDER = {
  food: { section: 'อาหารจานเดียว', name: 'ผัดกะเพราหมูสับ ไข่ดาว', desc: 'เผ็ดกลาง', price: '60' },
  service: { section: 'นวด', name: 'นวดแผนไทย 1 ชั่วโมง', desc: 'นวดทั้งตัว', price: '300' },
  shop: { section: 'เสื้อผ้า', name: 'เสื้อยืดลายช้าง', desc: 'ผ้าฝ้าย มีไซส์ S-XL', price: '150' },
};

// ---------- Vendor: start (Thai) ----------

export function startPage({ error = '' } = {}) {
  return layout({
    title: 'สร้างป้าย · ChuanLocal',
    body: `<main class="app">
${appHeader()}
<h1>สร้างป้ายของร้านคุณ</h1>
<p class="muted">พิมพ์รายการเป็นภาษาไทย แล้วพิมพ์ป้าย QR ติดที่ร้าน นักท่องเที่ยวสแกนแล้วอ่านเป็นภาษาของตัวเองได้ทันที ฟรี ไม่ต้องติดตั้งแอป ไม่ต้องสมัครสมาชิก</p>
${error ? `<div class="alert" role="alert">${icon('alert')}<span>${esc(error)}</span></div>` : ''}
<form method="post" action="/create">
  <fieldset style="border:0;padding:0;margin:0">
    <legend class="label">ร้านของคุณเป็นแบบไหน?</legend>
    <div class="choices">
    ${TYPES.map(
      (t, i) => `<label class="choice"><input type="radio" name="type" value="${t.v}" ${i === 0 ? 'checked' : ''}>${icon(t.icon, { cls: 'icon-lg' })}<span>${t.th}</span>${icon('check', { cls: 'icon check' })}</label>`,
    ).join('')}
    </div>
  </fieldset>
  <label for="name">ชื่อร้าน</label>
  <input id="name" name="name" required maxlength="80" placeholder="เช่น ร้านป้าแดง ข้าวมันไก่">
  <p style="margin-top:var(--space-150)"><button class="btn btn-primary btn-block">สร้างป้ายของฉัน ${icon('arrow')}</button></p>
</form>
</main>`,
  });
}

// ---------- Vendor: edit (Thai) ----------

export function editPage({ shop, items, origin, isNew }) {
  const editUrl = `${origin}/edit/${shop.secret}`;
  const menuUrl = `${origin}/m/${shop.slug}`;
  const ph = PLACEHOLDER[shop.type] || PLACEHOLDER.food;
  const lineText = `ลิงก์แก้ไขรายการร้าน ${shop.name_th} (ห้ามให้คนอื่น): ${editUrl}`;
  const data = {
    secret: shop.secret,
    name: shop.name_th,
    ph,
    icons: { star: icon('star'), ban: icon('ban'), trash: icon('trash'), check: icon('check') },
    items: items.map((it) => ({
      id: it.id,
      section: it.section_th,
      name: it.name_th,
      desc: it.desc_th,
      price: it.price,
      special: !!it.is_special,
      soldOut: !!it.sold_out,
    })),
  };

  return layout({
    title: `แก้ไขรายการ · ${shop.name_th}`,
    body: `<main class="app">
${appHeader()}
<h1 id="shopTitle">${esc(shop.name_th)}</h1>
${
  isNew
    ? `<div class="alert" role="note">${icon('alert')}<div><strong>สำคัญ: เก็บลิงก์หน้านี้ไว้</strong><br>
ลิงก์นี้ใช้แก้ไขรายการของคุณ ไม่มีรหัสผ่าน ถ้าลิงก์หายจะแก้ไขไม่ได้ และห้ามให้คนอื่น
<div class="btn-row" style="margin-top:var(--space-100)"><a class="btn btn-primary" href="https://line.me/R/share?text=${encodeURIComponent(lineText)}">${icon('share')} ส่งลิงก์เข้า LINE ของฉัน</a>
<button type="button" class="btn btn-secondary" onclick="copyLink()">${icon('copy')} คัดลอกลิงก์</button></div></div></div>`
    : ''
}
<div class="btn-row">
  <a class="btn btn-secondary" href="${esc(menuUrl)}" target="_blank">${icon('eye')} หน้าที่ลูกค้าเห็น</a>
  <a class="btn btn-secondary" href="/sign/${esc(shop.secret)}" target="_blank">${icon('printer')} พิมพ์ป้าย QR</a>
</div>

<label for="shopName">ชื่อร้าน</label>
<input id="shopName" maxlength="80">

<h2 class="section-heading">รายการ</h2>
<p class="hint">${icon('star')} กด "พิเศษวันนี้" ครั้งเดียว บันทึกทันที</p>
<datalist id="sections"></datalist>
<div id="items"></div>
<button type="button" class="btn btn-secondary btn-block" onclick="addItem()">${icon('plus')} เพิ่มรายการ</button>

<div class="sticky-bar">
  <div id="status" role="status" aria-live="polite"></div>
  <button id="saveBtn" type="button" class="btn btn-primary btn-block" onclick="save()">${icon('save')} บันทึกและแปล</button>
</div>
</main>
<script>
const D = ${json(data)};
const EDIT_URL = ${json(editUrl)};
let items = D.items;
let dirty = false;
const $ = (s) => document.querySelector(s);
const statusEl = $('#status');
function setStatus(t, kind) {
  statusEl.className = kind === 'error' ? 'is-error' : '';
  statusEl.innerHTML = kind === 'busy' ? '<div class="progress"><span></span></div>' : '';
  statusEl.append(document.createTextNode(t));
}
function markDirty() { dirty = true; setStatus('มีการแก้ไขที่ยังไม่บันทึก'); }
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

$('#shopName').value = D.name;
$('#shopName').addEventListener('input', markDirty);

function copyLink() {
  navigator.clipboard.writeText(EDIT_URL).then(() => setStatus('คัดลอกลิงก์แล้ว'), () => prompt('คัดลอกลิงก์นี้:', EDIT_URL));
}

let uid = 0;
function field(i, key, label, ph, attrs) {
  const id = 'f' + (uid++);
  const wrap = document.createElement('div');
  const l = document.createElement('label'); l.textContent = label; l.htmlFor = id;
  const inp = document.createElement('input');
  inp.id = id; inp.value = items[i][key] || ''; inp.placeholder = ph || '';
  Object.assign(inp, attrs || {});
  inp.addEventListener('input', () => { items[i][key] = inp.value; markDirty(); });
  wrap.append(l, inp);
  return wrap;
}

function toggleBtn(html, label, pressed, onClick) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'btn btn-secondary';
  b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  b.innerHTML = html + '<span></span>';
  b.lastChild.textContent = label;
  b.onclick = onClick;
  return b;
}

function render() {
  const box = $('#items'); box.innerHTML = '';
  $('#sections').innerHTML = '';
  [...new Set(items.map((x) => x.section).filter(Boolean))].forEach((s) => {
    const o = document.createElement('option'); o.value = s; $('#sections').append(o);
  });
  items.forEach((it, i) => {
    const card = document.createElement('div');
    card.className = 'card item-card' + (it.special ? ' is-special' : '');
    const sec = field(i, 'section', 'หมวด (ไม่บังคับ)', D.ph.section);
    sec.querySelector('input').setAttribute('list', 'sections');
    const pair = document.createElement('div'); pair.className = 'pair';
    pair.append(
      field(i, 'name', 'ชื่อรายการ', D.ph.name, { maxLength: 120 }),
      field(i, 'price', 'ราคา (บาท)', D.ph.price, { inputMode: 'decimal', maxLength: 20 }),
    );
    const actions = document.createElement('div'); actions.className = 'item-actions';
    actions.append(
      toggleBtn(D.icons.star, 'พิเศษวันนี้', it.special, () => toggleSpecial(i)),
      toggleBtn(D.icons.ban, it.soldOut ? 'หมดแล้ว' : 'หมด', it.soldOut, () => toggleSold(i)),
    );
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'btn btn-secondary';
    del.innerHTML = D.icons.trash + '<span>ลบ</span>';
    del.onclick = () => { if (confirm('ลบรายการนี้?')) { items.splice(i, 1); markDirty(); render(); } };
    actions.append(del);
    card.append(sec, pair, field(i, 'desc', 'รายละเอียด (ไม่บังคับ)', D.ph.desc, { maxLength: 200 }), actions);
    box.append(card);
  });
}

function addItem() {
  const last = items[items.length - 1];
  items.push({ section: last ? last.section : '', name: '', desc: '', price: '', special: false, soldOut: false });
  render();
  const inputs = document.querySelectorAll('#items .item-card:last-child input');
  if (inputs[1]) inputs[1].focus();
}

async function api(path, body) {
  const r = await fetch('/api/' + D.secret + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function toggleSpecial(i) {
  const on = !items[i].special;
  items.forEach((x, j) => { x.special = j === i ? on : false; });
  render();
  if (!items[i].id) { markDirty(); return; }
  try { await api('/special', { id: on ? items[i].id : null }); if (!dirty) setStatus(on ? 'ตั้งเป็นพิเศษวันนี้แล้ว' : 'ยกเลิกพิเศษวันนี้แล้ว'); }
  catch { setStatus('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'error'); }
}

async function toggleSold(i) {
  items[i].soldOut = !items[i].soldOut;
  render();
  if (!items[i].id) { markDirty(); return; }
  try { await api('/soldout', { id: items[i].id, soldOut: items[i].soldOut }); if (!dirty) setStatus('บันทึกแล้ว'); }
  catch { setStatus('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'error'); }
}

async function save() {
  const name = $('#shopName').value.trim();
  if (!name) { setStatus('กรุณาใส่ชื่อร้าน', 'error'); return; }
  const btn = $('#saveBtn'); btn.disabled = true;
  setStatus('กำลังบันทึกและแปล… ประมาณ 10–30 วินาที', 'busy');
  try {
    const res = await api('/save', { name, items: items.filter((x) => x.name.trim()) });
    items = res.items; dirty = false;
    $('#shopTitle').textContent = name;
    render();
    setStatus('บันทึกและแปลเรียบร้อย');
  } catch (e) {
    setStatus('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', 'error');
  } finally { btn.disabled = false; }
}

if (!items.length) addItem(); else render();
</script>`,
  });
}

// ---------- Visitor: the list ----------

// Calendar days since the last update, counted in Thailand time.
function daysSince(utc) {
  if (!utc) return null;
  const day = (d) => new Date(d.getTime() + 7 * 3600e3).toISOString().slice(0, 10);
  const then = new Date(utc.replace(' ', 'T') + 'Z');
  if (isNaN(then)) return null;
  return Math.round((Date.parse(day(new Date())) - Date.parse(day(then))) / 86400e3);
}

function freshness(ui, utc) {
  const n = daysSince(utc);
  if (n == null) return '';
  const [today, yesterday, ago] = ui.updated;
  return n <= 0 ? today : n === 1 ? yesterday : ago(n);
}

function priceText(p) {
  const s = String(p || '').trim();
  if (!s) return '';
  return /^[\d.,\s-]+$/.test(s) ? `฿${s}` : s;
}

export function menuPage({ shop, items, lang, path }) {
  const ui = UI[lang];
  const shopTr = JSON.parse(shop.name_tr || '{}');
  const shopName = lang === 'th' ? shop.name_th : shopTr[lang] || shop.name_th;

  const view = items.map((it) => {
    const tr = JSON.parse(it.tr || '{}')[lang] || {};
    return {
      ...it,
      tName: lang === 'th' ? it.name_th : tr.name || it.name_th,
      tDesc: lang === 'th' ? it.desc_th : tr.desc || it.desc_th,
      tSection: lang === 'th' ? it.section_th : tr.section || it.section_th,
    };
  });

  const itemHtml = (it) => `
<div class="row${it.sold_out ? ' sold' : ''}">
  <div class="top"><div class="name">${esc(it.tName)}</div><div class="price">${esc(priceText(it.price))}</div></div>
  ${lang !== 'th' ? `<div class="orig" lang="th">${esc(it.name_th)}</div>` : ''}
  ${it.tDesc ? `<div class="desc">${esc(it.tDesc)}</div>` : ''}
  ${it.sold_out ? `<span class="status">${esc(ui.soldOut)}</span>` : ''}
</div>`;

  const special = view.find((it) => it.is_special);
  const groups = [];
  for (const it of view) {
    let g = groups.find((x) => x.key === it.section_th);
    if (!g) groups.push((g = { key: it.section_th, title: it.tSection, items: [] }));
    g.items.push(it);
  }

  const langLinks = [...LANGS, 'th']
    .map(
      (l) =>
        `<a href="${esc(path)}?lang=${l}" lang="${l}" hreflang="${l}"${l === lang ? ' aria-current="true"' : ''}>${LANG_LABELS[l]}</a>`,
    )
    .join('');

  return layout({
    title: shopName,
    lang,
    head: `<meta name="robots" content="noindex">`,
    body: `<main class="app">
<nav class="lang-switch" aria-label="Language">${langLinks}</nav>
<h1>${esc(shopName)}</h1>
${lang !== 'th' && shopName !== shop.name_th ? `<p class="orig muted" lang="th">${esc(shop.name_th)}</p>` : ''}
${shop.updated_at ? `<p class="hint">${icon('refresh')}<span>${esc(freshness(ui, shop.updated_at))}</span></p>` : ''}
${ui.point ? `<p class="hint">${icon('pointer')}<span>${esc(ui.point)}</span></p>` : ''}
${special ? `<section class="highlight"><div class="tag-word">${icon('star')}<span>${esc(ui.special)}</span></div>${itemHtml(special)}</section>` : ''}
${groups
  .map((g) => `${g.title ? `<h2 class="section-heading">${esc(g.title)}</h2>` : ''}${g.items.map((it) => itemHtml(it)).join('')}`)
  .join('')}
<footer class="app-footer caption">${mark()}${esc(ui.prices)}${ui.auto ? ` · ${esc(ui.auto)}` : ''}</footer>
</main>`,
  });
}

// ---------- Vendor: printable QR sign ----------

// Flags for the 7 visitor languages, in LANGS order (owner's call: flags on the printed sign only).
const FLAGS = ['gb', 'cn', 'kr', 'jp', 'ru', 'de', 'fr'];

export function signPage({ shop, menuUrl, qrSvg }) {
  const shopTr = JSON.parse(shop.name_tr || '{}');
  const lines = [...LANGS, 'th'].map((l) => `<div lang="${l}">${esc(UI[l].scan)}</div>`).join('');
  return layout({
    title: `ป้าย QR · ${shop.name_th}`,
    theme: 'light',
    fonts: ['zh', 'ja', 'ko', 'ru'],
    css: ['/app.css', '/sign.css'],
    body: `<div class="sign-tools">
  <button class="btn btn-primary" onclick="print()">${icon('printer')} พิมพ์ / บันทึกเป็น PDF</button>
  <a class="btn btn-secondary" href="/edit/${esc(shop.secret)}">${icon('back')} กลับไปแก้ไข</a>
</div>
<div class="sheet">
  <div class="sheet-head">
    <h1 lang="th">${esc(shop.name_th)}</h1>
    ${shopTr.en && shopTr.en !== shop.name_th ? `<div class="sheet-en" lang="en">${esc(shopTr.en)}</div>` : ''}
  </div>
  <div class="sheet-langs">${icon('globe', { cls: 'icon-lg' })}${FLAGS.map((f) => `<img src="/flags/${f}.svg" alt="">`).join('')}</div>
  <div class="sheet-qr">${qrSvg}</div>
  <div class="sheet-lines">${lines}</div>
  <p class="sheet-live">${icon('refresh')}<span lang="en">Live list · the vendor keeps it up to date</span><span lang="th">รายการอัปเดตโดยร้านค้า</span></p>
  <div class="sheet-foot">${lockup('logo-lockup')}<div class="caption">${esc(menuUrl)}</div></div>
</div>`,
  });
}

export function notFoundPage() {
  return layout({
    title: 'ไม่พบหน้านี้ · Not found',
    body: `<main class="app">${appHeader()}<h1>ไม่พบหน้านี้</h1><p lang="en">Page not found.</p><p><a class="btn btn-secondary" href="/">${icon('back')} กลับหน้าแรก</a></p></main>`,
  });
}
