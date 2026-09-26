import { lockup, mark } from './brand.js';
import { COPY, HERO_VIDEO, HOME_LABELS, HOME_LANGS, PHOTOS } from './home-copy.js';
import { icon } from './icons.js';
import { ASSET_V, esc, layout } from './pages.js';

const WIDTHS = [640, 1024, 1600, 2400];
// breakpoint.lg from tokens.json (media conditions can't read CSS variables).
const BP_LG = 1024;
const half = `(min-width: ${BP_LG}px) 50vw, 100vw`;
const src = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${w}`;

function photo(key, { sizes = '100vw', eager = false, parallax = true } = {}) {
  const p = PHOTOS[key];
  return `<div class="media"${parallax ? ' data-parallax' : ''}><img src="${src(p.id, 1600)}" srcset="${WIDTHS.map((w) => `${src(p.id, w)} ${w}w`).join(', ')}" sizes="${sizes}" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`;
}

const steps = (list) =>
  `<ol class="steps">${list
    .map(([t, d], i) => `<li><span class="n">0${i + 1}</span><span><strong>${esc(t)}</strong><span class="d">${esc(d)}</span></span></li>`)
    .join('')}</ol>`;

export function homePage({ lang, exampleUrl }) {
  const c = COPY[lang];
  const q = (l) => `/?lang=${l}`;
  const langLinks = HOME_LANGS.map(
    (l) => `<a href="${q(l)}" lang="${l}" hreflang="${l}"${l === lang ? ' aria-current="true"' : ''}>${HOME_LABELS[l]}</a>`,
  ).join('');
  const credits = Object.values(PHOTOS)
    .map((p) => `<a href="${p.page}?utm_source=chuanlocal&utm_medium=referral" rel="noopener">${esc(p.by)}</a>`)
    .join(', ');

  const head = `<script>try{if(!localStorage.getItem('cl-seen-splash')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim');setTimeout(function(){document.documentElement.classList.remove('anim','splashing')},4000)}}catch(e){}</script>
<link rel="alternate" hreflang="x-default" href="/">
${HOME_LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${q(l)}">`).join('')}
<meta name="description" content="${esc(c.heroSub)}">
<link rel="preconnect" href="https://images.unsplash.com">
<script src="/home.js?v=${ASSET_V}" defer></script>`;

  return layout({
    title: c.title,
    lang,
    head,
    theme: 'light',
    css: ['/app.css', '/home.css'],
    body: `<div class="splash" id="splash" aria-hidden="true">${mark('logo-mark', '')}</div>

<header class="site-header on-navy">
  <a class="brand" href="${q(lang)}" aria-label="ChuanLocal">${lockup()}</a>
  <details class="nav">
    <summary class="nav-toggle" aria-label="${esc(c.menu)}">${icon('menu', { cls: 'icon-lg' })}</summary>
    <div class="nav-panel">
      <nav class="lang-switch" aria-label="${esc(c.lang)}">${langLinks}</nav>
      <a class="btn btn-outline" href="/get-started?lang=${lang}">${esc(c.getStarted)} ${icon('arrow', { cls: 'icon icon-arrow' })}</a>
    </div>
  </details>
</header>

<main>
  <section class="hero on-navy">
    <div class="media" data-parallax>
      <video autoplay muted loop playsinline preload="metadata" poster="${src(PHOTOS.hero.id, 1600)}" aria-hidden="true">
        <source src="/video/hero.webm" type="video/webm">
        <source src="/video/hero.mp4" type="video/mp4">
      </video>
    </div>
    <div class="scrim"></div>
    <div class="hero-content">
      <p class="overline"><span lang="th">ชวน</span> · ChuanLocal</p>
      <h1>${esc(c.heroTitle)}</h1>
      <p class="lede">${esc(c.heroSub)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/get-started?lang=${lang}">${esc(c.getStarted)} ${icon('arrow', { cls: 'icon icon-arrow' })}</a>
        <a class="btn btn-secondary" href="${esc(exampleUrl)}">${icon('eye')} ${esc(c.ctaExample)}</a>
      </div>
    </div>
  </section>

  <section class="intro">
    <p>${esc(c.intro)}</p>
  </section>

  <section class="split alt">
    ${photo('problem', { sizes: half })}
    <div class="split-text">
      <p class="overline">${esc(c.s1Over)}</p>
      <h2>${esc(c.s1Title)}</h2>
      <p>${esc(c.s1Body)}</p>
    </div>
  </section>

  <section class="split flip">
    ${photo('idea', { sizes: half })}
    <div class="split-text">
      <p class="overline">${esc(c.s2Over)}</p>
      <h2>${esc(c.s2Title)}</h2>
      <p>${esc(c.s2Body)}</p>
    </div>
  </section>

  <section class="split alt">
    ${photo('origin', { sizes: half })}
    <div class="split-text">
      <p class="overline">${esc(c.s3Over)}</p>
      <h2>${esc(c.s3Title)}</h2>
      <p>${esc(c.s3Body)}</p>
    </div>
  </section>

  <section class="quote on-navy">
    ${photo('quote')}
    <div class="scrim"></div>
    <figure class="quote-content">
      <blockquote><p>${esc(c.quote)}</p></blockquote>
      <figcaption>${esc(c.quoteSub)}</figcaption>
    </figure>
  </section>

  <section class="split flip" id="vendors">
    ${photo('vendors', { sizes: half })}
    <div class="split-text">
      <p class="overline">${esc(c.vOver)}</p>
      <h2>${esc(c.vTitle)}</h2>
      ${steps(c.vSteps)}
      <p class="caption">${esc(c.vNote)}</p>
      <a class="btn btn-primary" href="/start">${esc(c.vCta)} ${icon('arrow', { cls: 'icon icon-arrow' })}</a>
    </div>
  </section>

  <section class="split alt" id="visitors">
    ${photo('visitors', { sizes: half })}
    <div class="split-text">
      <p class="overline">${esc(c.tOver)}</p>
      <h2>${esc(c.tTitle)}</h2>
      ${steps(c.tSteps)}
      <a class="btn btn-secondary" href="${esc(exampleUrl)}">${icon('qr')} ${esc(c.tCta)}</a>
    </div>
  </section>

  <section class="final on-navy">
    ${photo('final')}
    <div class="scrim"></div>
    <div class="final-content">
      ${mark('logo-mark', '')}
      <h2>${esc(c.finalTitle)}</h2>
      <p>${esc(c.finalBody)}</p>
      <a class="btn btn-primary" href="/get-started?lang=${lang}">${esc(c.getStarted)} ${icon('arrow', { cls: 'icon icon-arrow' })}</a>
    </div>
  </section>
</main>

<footer class="site-footer">
  ${lockup()}
  <p>${esc(c.footer)}</p>
  <p class="caption">${esc(c.photos)} ${credits} · Video: <a href="${HERO_VIDEO.page}" rel="noopener">Pexels</a></p>
</footer>`,
  });
}

export function getStartedPage({ lang }) {
  const c = COPY[lang];
  const card = (href, ic, title, sub, l) =>
    `<a class="path-card" href="${href}">${icon(ic, { cls: 'icon-lg' })}<span><strong>${esc(title)}</strong><span class="muted">${esc(sub)}</span></span>${icon('arrow', { cls: 'icon icon-arrow' })}</a>`;
  return layout({
    title: `${c.getStarted} · ChuanLocal`,
    lang,
    css: ['/app.css', '/home.css'],
    body: `<main class="app get-started">
<header class="app-header"><a href="/?lang=${lang}" aria-label="ChuanLocal">${lockup()}</a></header>
<h1>${esc(c.gsTitle)}</h1>
<div class="paths">
  ${card('/start', 'bag', c.gsVendor, c.gsVendorSub)}
  ${card(`/?lang=${lang}#visitors`, 'qr', c.gsVisitor, c.gsVisitorSub)}
</div>
</main>`,
  });
}
