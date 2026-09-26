import { lockup, mark } from './brand.js';
import { COPY, HOME_LABELS, HOME_LANGS, PHOTOS } from './home-copy.js';
import { icon } from './icons.js';
import { esc, layout } from './pages.js';

const WIDTHS = [640, 1024, 1600, 2400];
// breakpoint.lg from tokens.json (media conditions can't read CSS variables).
const BP_LG = 1024;
const half = `(min-width: ${BP_LG}px) 50vw, 100vw`;
const twoFifths = `(min-width: ${BP_LG}px) 40vw, 100vw`;
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

  const head = `<script>try{if(!localStorage.getItem('cl-seen-splash')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim')}}catch(e){}</script>
<link rel="alternate" hreflang="x-default" href="/">
${HOME_LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${q(l)}">`).join('')}
<meta name="description" content="${esc(c.heroSub)}">
<link rel="preconnect" href="https://images.unsplash.com">
<script src="/home.js" defer></script>`;

  return layout({
    title: c.title,
    lang,
    head,
    css: ['/app.css', '/home.css'],
    body: `<div class="splash" id="splash" aria-hidden="true">${mark('logo-mark', '')}</div>

<header class="site-header">
  <a class="brand" href="${q(lang)}" aria-label="ChuanLocal">${lockup()}</a>
  <a class="btn btn-primary" href="/start">${esc(c.headerCta)}</a>
</header>
<nav class="lang-switch site-langs" aria-label="${esc(c.lang)}">${icon('globe')}${langLinks}</nav>

<main>
  <section class="hero on-navy">
    ${photo('hero', { eager: true })}
    <div class="scrim"></div>
    <div class="hero-content">
      <p class="overline"><span lang="th">ชวน</span> · ChuanLocal</p>
      <h1>${esc(c.heroTitle)}</h1>
      <p class="lede">${esc(c.heroSub)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="/start">${esc(c.ctaStart)} ${icon('arrow')}</a>
        <a class="btn btn-secondary" href="${esc(exampleUrl)}">${icon('eye')} ${esc(c.ctaExample)}</a>
      </div>
    </div>
  </section>

  <section class="intro">
    <p>${esc(c.intro)}</p>
  </section>

  <section class="story">
    ${photo('problem', { sizes: half })}
    <div class="story-text">
      <p class="overline">${esc(c.s1Over)}</p>
      <h2>${esc(c.s1Title)}</h2>
      <p>${esc(c.s1Body)}</p>
    </div>
  </section>

  <section class="story flip">
    ${photo('idea', { sizes: half })}
    <div class="story-text">
      <p class="overline">${esc(c.s2Over)}</p>
      <h2>${esc(c.s2Title)}</h2>
      <p>${esc(c.s2Body)}</p>
    </div>
  </section>

  <section class="story">
    ${photo('origin', { sizes: half })}
    <div class="story-text">
      <p class="overline">${esc(c.s3Over)}</p>
      <h2>${esc(c.s3Title)}</h2>
      <p>${esc(c.s3Body)}</p>
    </div>
  </section>

  <section class="how" id="vendors">
    ${photo('vendors', { sizes: twoFifths })}
    <div class="how-text">
      <p class="overline">${esc(c.vOver)}</p>
      <h2>${esc(c.vTitle)}</h2>
      ${steps(c.vSteps)}
      <p class="caption">${esc(c.vNote)}</p>
      <a class="btn btn-primary" href="/start">${esc(c.vCta)} ${icon('arrow')}</a>
    </div>
  </section>

  <section class="how flip subtle" id="visitors">
    ${photo('visitors', { sizes: twoFifths })}
    <div class="how-text">
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
      <a class="btn btn-primary" href="/start">${esc(c.finalCta)} ${icon('arrow')}</a>
    </div>
  </section>
</main>

<footer class="site-footer">
  ${lockup()}
  <p>${esc(c.footer)}</p>
  <p class="caption">${esc(c.photos)} ${credits}</p>
</footer>`,
  });
}
