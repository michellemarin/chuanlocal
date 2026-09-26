import { LANG_LABELS, UI } from './i18n.js';
import { LANGS } from './translate.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Safe to embed inside <script>.
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

const BASE_CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,"Noto Sans Thai","Sukhumvit Set",sans-serif;background:#fbf7f0;color:#222;line-height:1.45;-webkit-text-size-adjust:100%}
main{max-width:640px;margin:0 auto;padding:16px}
h1{font-size:1.5rem;margin:.2em 0 .4em}
a{color:#b4451f}
button,.btn{font:inherit;border:0;border-radius:12px;padding:12px 16px;background:#e8e1d5;color:#222;cursor:pointer;text-decoration:none;display:inline-block;text-align:center}
.btn-primary{background:#d9531e;color:#fff;font-weight:700}
.btn-line{background:#06c755;color:#fff;font-weight:700}
input,textarea,select{font:inherit;width:100%;padding:12px;border:1px solid #d6cdbd;border-radius:10px;background:#fff}
label{display:block;font-weight:600;margin:12px 0 4px}
.card{background:#fff;border-radius:16px;padding:14px;margin:12px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.muted{color:#777;font-size:.9rem}
`;

function layout({ title, lang = 'th', body, css = '', head = '' }) {
  return `<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>${head}<style>${BASE_CSS}${css}</style></head>
<body>${body}</body></html>`;
}

const TYPES = [
  { v: 'food', th: '🍜 ร้านอาหาร / เครื่องดื่ม' },
  { v: 'service', th: '💆 บริการ (นวด ทัวร์ ซักรีด เช่ารถ ฯลฯ)' },
  { v: 'shop', th: '🛍️ ร้านค้า / ของฝาก' },
];

const PLACEHOLDER = {
  food: { section: 'อาหารจานเดียว', name: 'ผัดกะเพราหมูสับ ไข่ดาว', desc: 'เผ็ดกลาง', price: '60' },
  service: { section: 'นวด', name: 'นวดแผนไทย 1 ชั่วโมง', desc: 'นวดทั้งตัว', price: '300' },
  shop: { section: 'เสื้อผ้า', name: 'เสื้อยืดลายช้าง', desc: 'ผ้าฝ้าย มีไซส์ S-XL', price: '150' },
};

// ---------- Vendor: start ----------

export function startPage({ error = '' } = {}) {
  return layout({
    title: 'QR เมนูหลายภาษา',
    body: `<main>
<h1>QR เมนูหลายภาษา 🇹🇭➜🌏</h1>
<p>พิมพ์เมนูหรือรายการบริการเป็น<strong>ภาษาไทย</strong> ระบบจะแปลให้อัตโนมัติ
แล้วพิมพ์ป้าย QR ติดที่ร้าน นักท่องเที่ยวสแกนด้วยกล้องมือถือ ก็อ่านเป็นภาษาของตัวเองได้ทันที</p>
<p class="muted">ฟรี · ไม่ต้องติดตั้งแอป · ไม่ต้องสมัครสมาชิก</p>
${error ? `<p style="color:#b00020">${esc(error)}</p>` : ''}
<form method="post" action="/create" class="card">
  <label>ร้านของคุณเป็นแบบไหน?</label>
  ${TYPES.map((t, i) => `<label style="font-weight:400"><input type="radio" name="type" value="${t.v}" ${i === 0 ? 'checked' : ''} style="width:auto;margin-right:8px">${t.th}</label>`).join('')}
  <label for="name">ชื่อร้าน</label>
  <input id="name" name="name" required maxlength="80" placeholder="เช่น ร้านป้าแดง ข้าวมันไก่">
  <p><button class="btn-primary" style="width:100%">สร้างเมนู</button></p>
</form>
</main>`,
  });
}

// ---------- Vendor: edit ----------

export function editPage({ shop, items, origin, isNew }) {
  const editUrl = `${origin}/edit/${shop.secret}`;
  const menuUrl = `${origin}/m/${shop.slug}`;
  const ph = PLACEHOLDER[shop.type] || PLACEHOLDER.food;
  const lineText = `ลิงก์แก้ไขเมนูร้าน ${shop.name_th} (ห้ามให้คนอื่น): ${editUrl}`;
  const data = {
    secret: shop.secret,
    name: shop.name_th,
    ph,
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
    title: `แก้ไขเมนู · ${shop.name_th}`,
    css: `
.banner{background:#fff4d6;border:2px solid #f0b400;border-radius:16px;padding:14px;margin:12px 0}
.row{display:flex;gap:8px}.row>*{flex:1}
.item-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.item-actions button{flex:1;min-width:90px;padding:10px 8px}
.on-special{background:#ffcc33 !important;font-weight:700}
.on-sold{background:#555 !important;color:#fff}
.item.special{outline:3px solid #ffcc33}
.item.sold{opacity:.6}
#bar{position:sticky;bottom:0;background:#fbf7f0;padding:10px 0 14px;border-top:1px solid #e5dccb}
#status{min-height:1.4em;text-align:center;font-weight:600}
`,
    body: `<main>
<h1 id="shopTitle">${esc(shop.name_th)}</h1>
${
  isNew
    ? `<div class="banner"><strong>⚠️ สำคัญ: เก็บลิงก์หน้านี้ไว้</strong><br>
ลิงก์นี้ใช้แก้ไขเมนูของคุณ ไม่มีรหัสผ่าน ถ้าลิงก์หายจะแก้ไขเมนูไม่ได้ และห้ามให้คนอื่น
<p class="row"><a class="btn btn-line" href="https://line.me/R/share?text=${encodeURIComponent(lineText)}">ส่งลิงก์เข้า LINE ของฉัน</a>
<button type="button" onclick="copyLink()">คัดลอกลิงก์</button></p></div>`
    : ''
}
<div class="row">
  <a class="btn" href="${esc(menuUrl)}" target="_blank">👀 หน้าที่ลูกค้าเห็น</a>
  <a class="btn" href="/sign/${esc(shop.secret)}" target="_blank">🖨️ พิมพ์ป้าย QR</a>
</div>

<label for="shopName">ชื่อร้าน</label>
<input id="shopName" maxlength="80">

<h2 style="margin-top:24px">รายการ</h2>
<p class="muted">กด ⭐ เพื่อตั้งเป็น "พิเศษวันนี้" (กดครั้งเดียว บันทึกทันที)</p>
<datalist id="sections"></datalist>
<div id="items"></div>
<button type="button" onclick="addItem()" style="width:100%">+ เพิ่มรายการ</button>

<div id="bar">
  <div id="status"></div>
  <button id="saveBtn" type="button" class="btn-primary" style="width:100%" onclick="save()">💾 บันทึกและแปล</button>
</div>
</main>
<script>
const D = ${json(data)};
const EDIT_URL = ${json(editUrl)};
let items = D.items;
let dirty = false;
const $ = (s) => document.querySelector(s);
const statusEl = $('#status');
function setStatus(t, color) { statusEl.textContent = t; statusEl.style.color = color || '#222'; }
function markDirty() { dirty = true; setStatus('มีการแก้ไขที่ยังไม่บันทึก', '#b4451f'); }
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

$('#shopName').value = D.name;
$('#shopName').addEventListener('input', markDirty);

function copyLink() {
  navigator.clipboard.writeText(EDIT_URL).then(() => alert('คัดลอกลิงก์แล้ว'), () => prompt('คัดลอกลิงก์นี้:', EDIT_URL));
}

function field(i, key, label, ph, attrs) {
  const wrap = document.createElement('div');
  const l = document.createElement('label'); l.textContent = label;
  const inp = document.createElement('input');
  inp.value = items[i][key] || ''; inp.placeholder = ph || '';
  Object.assign(inp, attrs || {});
  inp.addEventListener('input', () => { items[i][key] = inp.value; markDirty(); });
  wrap.append(l, inp);
  return wrap;
}

function render() {
  const box = $('#items'); box.innerHTML = '';
  $('#sections').innerHTML = [...new Set(items.map((x) => x.section).filter(Boolean))]
    .map((s) => '<option>' + s.replace(/[<&"]/g, '') + '</option>').join('');
  items.forEach((it, i) => {
    const card = document.createElement('div');
    card.className = 'card item' + (it.special ? ' special' : '') + (it.soldOut ? ' sold' : '');
    const sec = field(i, 'section', 'หมวด (ไม่บังคับ)', D.ph.section);
    sec.querySelector('input').setAttribute('list', 'sections');
    const row = document.createElement('div'); row.className = 'row';
    const name = field(i, 'name', 'ชื่อรายการ', D.ph.name, { maxLength: 120 });
    name.style.flex = '3';
    row.append(name, field(i, 'price', 'ราคา (บาท)', D.ph.price, { inputMode: 'decimal', maxLength: 20 }));
    const actions = document.createElement('div'); actions.className = 'item-actions';
    const bSp = document.createElement('button'); bSp.type = 'button';
    bSp.textContent = it.special ? '⭐ พิเศษวันนี้' : '☆ พิเศษวันนี้';
    if (it.special) bSp.className = 'on-special';
    bSp.onclick = () => toggleSpecial(i);
    const bSo = document.createElement('button'); bSo.type = 'button';
    bSo.textContent = it.soldOut ? 'หมดแล้ว' : 'หมด';
    if (it.soldOut) bSo.className = 'on-sold';
    bSo.onclick = () => toggleSold(i);
    const bDel = document.createElement('button'); bDel.type = 'button'; bDel.textContent = '🗑 ลบ';
    bDel.onclick = () => { if (confirm('ลบรายการนี้?')) { items.splice(i, 1); markDirty(); render(); } };
    actions.append(bSp, bSo, bDel);
    card.append(sec, row, field(i, 'desc', 'รายละเอียด (ไม่บังคับ)', D.ph.desc, { maxLength: 200 }), actions);
    box.append(card);
  });
}

function addItem() {
  const last = items[items.length - 1];
  items.push({ section: last ? last.section : '', name: '', desc: '', price: '', special: false, soldOut: false });
  render();
  const inputs = document.querySelectorAll('#items .item:last-child input');
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
  try { await api('/special', { id: on ? items[i].id : null }); if (!dirty) setStatus(on ? '⭐ ตั้งเป็นพิเศษวันนี้แล้ว' : 'ยกเลิกพิเศษวันนี้แล้ว', '#2e7d32'); }
  catch { setStatus('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', '#b00020'); }
}

async function toggleSold(i) {
  items[i].soldOut = !items[i].soldOut;
  render();
  if (!items[i].id) { markDirty(); return; }
  try { await api('/soldout', { id: items[i].id, soldOut: items[i].soldOut }); if (!dirty) setStatus('บันทึกแล้ว ✓', '#2e7d32'); }
  catch { setStatus('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', '#b00020'); }
}

async function save() {
  const name = $('#shopName').value.trim();
  if (!name) { setStatus('กรุณาใส่ชื่อร้าน', '#b00020'); return; }
  const btn = $('#saveBtn'); btn.disabled = true;
  setStatus('⏳ กำลังบันทึกและแปล… ประมาณ 10–30 วินาที');
  try {
    const res = await api('/save', { name, items: items.filter((x) => x.name.trim()) });
    items = res.items; dirty = false;
    $('#shopTitle').textContent = name;
    render();
    setStatus('✅ บันทึกและแปลเรียบร้อย', '#2e7d32');
  } catch (e) {
    setStatus('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง', '#b00020');
  } finally { btn.disabled = false; }
}

if (!items.length) addItem(); else render();
</script>`,
  });
}

// ---------- Tourist: menu ----------

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

  const itemHtml = (it, big = false) => `
<div class="it${it.sold_out ? ' sold' : ''}${big ? ' big' : ''}">
  <div class="top"><div class="name">${esc(it.tName)}</div><div class="price">${esc(priceText(it.price))}</div></div>
  ${lang !== 'th' ? `<div class="th" lang="th">${esc(it.name_th)}</div>` : ''}
  ${it.tDesc ? `<div class="desc">${esc(it.tDesc)}</div>` : ''}
  ${it.sold_out ? `<div class="so">${esc(ui.soldOut)}</div>` : ''}
</div>`;

  const special = view.find((it) => it.is_special);
  const groups = [];
  for (const it of view) {
    let g = groups.find((x) => x.key === it.section_th);
    if (!g) groups.push((g = { key: it.section_th, title: it.tSection, items: [] }));
    g.items.push(it);
  }

  const langLinks = [...LANGS, 'th']
    .map((l) => `<a href="${esc(path)}?lang=${l}" class="${l === lang ? 'cur' : ''}" lang="${l}">${LANG_LABELS[l]}</a>`)
    .join('');

  return layout({
    title: shopName,
    lang,
    head: `<meta name="robots" content="noindex">`,
    css: `
.langs{display:flex;gap:6px;overflow-x:auto;padding:4px 0 10px;scrollbar-width:none}
.langs a{flex:none;padding:6px 12px;border-radius:999px;background:#fff;border:1px solid #e0d6c5;text-decoration:none;color:#333;font-size:.9rem}
.langs a.cur{background:#d9531e;border-color:#d9531e;color:#fff}
.shop-th{color:#777;margin-top:-6px}
.special{background:#fff4d6;border:2px solid #f0b400;border-radius:16px;padding:12px 14px;margin:14px 0}
.special h2{margin:0 0 6px;font-size:1rem;color:#8a5a00}
h2.sec{font-size:1.05rem;margin:22px 0 4px;color:#8a3a14;border-bottom:2px solid #eadfcd;padding-bottom:4px}
.it{padding:12px 0;border-bottom:1px solid #eee4d4}
.it .top{display:flex;gap:12px;justify-content:space-between;align-items:baseline}
.it .name{font-weight:650;font-size:1.05rem}
.it .price{font-weight:700;white-space:nowrap}
.it .th{color:#666;font-size:1rem;margin-top:2px}
.it .desc{color:#444;font-size:.95rem;margin-top:2px}
.it.sold{opacity:.5}.it.sold .name{text-decoration:line-through}
.so{display:inline-block;margin-top:4px;font-size:.8rem;background:#555;color:#fff;border-radius:6px;padding:1px 8px}
.big{border:0;padding:0}.big .name{font-size:1.2rem}
footer{margin:24px 0 8px;color:#888;font-size:.85rem;text-align:center}
`,
    body: `<main>
<nav class="langs">${langLinks}</nav>
<h1>${esc(shopName)}</h1>
${lang !== 'th' && shopName !== shop.name_th ? `<div class="shop-th" lang="th">${esc(shop.name_th)}</div>` : ''}
${ui.point ? `<p class="muted">👉 ${esc(ui.point)}</p>` : ''}
${special ? `<section class="special"><h2>⭐ ${esc(ui.special)}</h2>${itemHtml(special, true)}</section>` : ''}
${groups
  .map((g) => `${g.title ? `<h2 class="sec">${esc(g.title)}</h2>` : ''}${g.items.map((it) => itemHtml(it)).join('')}`)
  .join('')}
<footer>${esc(ui.prices)}${ui.auto ? ` · ${esc(ui.auto)}` : ''}</footer>
</main>`,
  });
}

// ---------- Vendor: printable QR sign ----------

export function signPage({ shop, menuUrl, qrSvg }) {
  const shopTr = JSON.parse(shop.name_tr || '{}');
  const lines = LANGS.map((l) => `<div lang="${l}">${esc(UI[l].scan)}</div>`).join('');
  return layout({
    title: `ป้าย QR · ${shop.name_th}`,
    css: `
body{background:#eee}
.sheet{background:#fff;width:190mm;min-height:270mm;margin:10px auto;padding:14mm;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8mm}
.sheet h1{font-size:30pt;margin:0}
.sheet .en{font-size:18pt;color:#555;margin-top:-4mm}
.qr{width:120mm;height:120mm}.qr svg{width:100%;height:100%}
.lines{font-size:14pt;line-height:1.6}
.lines div:first-child{font-size:20pt;font-weight:700}
.url{font-size:10pt;color:#888}
.tools{max-width:190mm;margin:10px auto;display:flex;gap:8px}
.tools>*{flex:1}
@media print{body{background:#fff}.tools{display:none}.sheet{margin:0;width:auto;min-height:0;height:100vh;padding:0}@page{size:A4;margin:12mm}}
`,
    body: `<div class="tools">
  <button class="btn-primary" onclick="print()">🖨️ พิมพ์ / บันทึกเป็น PDF</button>
  <a class="btn" href="/edit/${esc(shop.secret)}">← กลับไปแก้ไข</a>
</div>
<div class="sheet">
  <h1>${esc(shop.name_th)}</h1>
  ${shopTr.en && shopTr.en !== shop.name_th ? `<div class="en">${esc(shopTr.en)}</div>` : ''}
  <div class="qr">${qrSvg}</div>
  <div class="lines">${lines}</div>
  <div class="url">${esc(menuUrl)}</div>
</div>`,
  });
}

export function notFoundPage() {
  return layout({
    title: 'ไม่พบหน้านี้ · Not found',
    body: `<main><h1>ไม่พบหน้านี้</h1><p>Page not found.</p><p><a href="/">กลับหน้าแรก</a></p></main>`,
  });
}
