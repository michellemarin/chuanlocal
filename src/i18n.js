// Tourist-facing interface text. Vendor-facing text is Thai only and lives in pages.js.

export const LANG_LABELS = {
  en: 'English',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
  th: 'ไทย',
};

export const UI = {
  en: {
    special: "Today's special",
    soldOut: 'Sold out',
    point: 'To order, show the Thai name to the vendor',
    prices: 'Prices in Thai Baht (฿)',
    auto: 'Automatically translated from Thai',
    scan: 'Scan to see our menu & prices in your language',
  },
  zh: {
    special: '今日推荐',
    soldOut: '已售完',
    point: '点单时请向店家出示泰文名称',
    prices: '价格单位：泰铢 (฿)',
    auto: '由泰文自动翻译',
    scan: '扫码查看中文菜单和价格',
  },
  ko: {
    special: '오늘의 추천',
    soldOut: '품절',
    point: '주문할 때 태국어 이름을 보여주세요',
    prices: '가격 단위: 태국 바트 (฿)',
    auto: '태국어에서 자동 번역됨',
    scan: '스캔하여 한국어 메뉴와 가격 보기',
  },
  ja: {
    special: '本日のおすすめ',
    soldOut: '売り切れ',
    point: '注文時はタイ語の名前をお店の人に見せてください',
    prices: '価格はタイバーツ (฿)',
    auto: 'タイ語から自動翻訳',
    scan: 'スキャンして日本語のメニューと価格を見る',
  },
  ru: {
    special: 'Предложение дня',
    soldOut: 'Нет в наличии',
    point: 'Чтобы заказать, покажите продавцу название на тайском',
    prices: 'Цены в тайских батах (฿)',
    auto: 'Автоматический перевод с тайского',
    scan: 'Сканируйте — меню и цены на русском',
  },
  de: {
    special: 'Tagesangebot',
    soldOut: 'Ausverkauft',
    point: 'Zum Bestellen den thailändischen Namen zeigen',
    prices: 'Preise in Thai-Baht (฿)',
    auto: 'Automatisch aus dem Thailändischen übersetzt',
    scan: 'Scannen: Karte & Preise auf Deutsch',
  },
  fr: {
    special: 'Offre du jour',
    soldOut: 'Épuisé',
    point: 'Pour commander, montrez le nom en thaï',
    prices: 'Prix en bahts thaïlandais (฿)',
    auto: 'Traduit automatiquement du thaï',
    scan: 'Scannez : menu et prix en français',
  },
  th: {
    special: 'พิเศษวันนี้',
    soldOut: 'หมด',
    point: '',
    prices: 'ราคาเป็นบาท (฿)',
    auto: '',
    scan: 'สแกนเพื่อดูเมนูและราคา',
  },
};

/** Pick a supported language from ?lang= or the Accept-Language header. */
export function pickLang(queryLang, acceptLanguage) {
  if (queryLang && UI[queryLang]) return queryLang;
  const prefs = (acceptLanguage || '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { code: tag.toLowerCase().split('-')[0], q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { code } of prefs) if (UI[code]) return code;
  return 'en';
}
