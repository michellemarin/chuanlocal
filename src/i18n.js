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
    updated: ['Updated today', 'Updated yesterday', (n) => `Updated ${n} days ago`],
    language: 'Language',
    special: "Today's special",
    soldOut: 'Sold out',
    point: 'To order, show the Thai name to the vendor',
    prices: 'Prices in Thai Baht (฿)',
    auto: 'Automatically translated from Thai',
    scan: 'Scan to read this in your language',
  },
  zh: {
    updated: ['今天已更新', '昨天已更新', (n) => `${n} 天前更新`],
    language: '语言',
    special: '今日推荐',
    soldOut: '已售完',
    point: '点单时请向店家出示泰文名称',
    prices: '价格单位：泰铢 (฿)',
    auto: '由泰文自动翻译',
    scan: '扫码，用你的语言阅读',
  },
  ko: {
    updated: ['오늘 업데이트됨', '어제 업데이트됨', (n) => `${n}일 전 업데이트됨`],
    language: '언어',
    special: '오늘의 추천',
    soldOut: '품절',
    point: '주문할 때 태국어 이름을 보여주세요',
    prices: '가격 단위: 태국 바트 (฿)',
    auto: '태국어에서 자동 번역됨',
    scan: '스캔하면 내 언어로 읽을 수 있어요',
  },
  ja: {
    updated: ['今日更新', '昨日更新', (n) => `${n}日前に更新`],
    language: '言語',
    special: '本日のおすすめ',
    soldOut: '売り切れ',
    point: '注文時はタイ語の名前をお店の人に見せてください',
    prices: '価格はタイバーツ (฿)',
    auto: 'タイ語から自動翻訳',
    scan: 'スキャンして、あなたの言葉で読めます',
  },
  ru: {
    updated: ['Обновлено сегодня', 'Обновлено вчера', (n) => `Обновлено ${n} дн. назад`],
    language: 'Язык',
    special: 'Предложение дня',
    soldOut: 'Нет в наличии',
    point: 'Чтобы заказать, покажите продавцу название на тайском',
    prices: 'Цены в тайских батах (฿)',
    auto: 'Автоматический перевод с тайского',
    scan: 'Сканируйте, чтобы читать на своём языке',
  },
  de: {
    updated: ['Heute aktualisiert', 'Gestern aktualisiert', (n) => `Vor ${n} Tagen aktualisiert`],
    language: 'Sprache',
    special: 'Tagesangebot',
    soldOut: 'Ausverkauft',
    point: 'Zum Bestellen den thailändischen Namen zeigen',
    prices: 'Preise in Thai-Baht (฿)',
    auto: 'Automatisch aus dem Thailändischen übersetzt',
    scan: 'Scannen und in Ihrer Sprache lesen',
  },
  fr: {
    updated: ['Mis à jour aujourd’hui', 'Mis à jour hier', (n) => `Mis à jour il y a ${n} jours`],
    language: 'Langue',
    special: 'Offre du jour',
    soldOut: 'Épuisé',
    point: 'Pour commander, montrez le nom en thaï',
    prices: 'Prix en bahts thaïlandais (฿)',
    auto: 'Traduit automatiquement du thaï',
    scan: 'Scannez pour lire dans votre langue',
  },
  th: {
    updated: ['อัปเดตวันนี้', 'อัปเดตเมื่อวาน', (n) => `อัปเดตเมื่อ ${n} วันก่อน`],
    language: 'ภาษา',
    special: 'พิเศษวันนี้',
    soldOut: 'หมด',
    point: '',
    prices: 'ราคาเป็นบาท (฿)',
    auto: '',
    scan: 'สแกนเพื่ออ่านเป็นภาษาของคุณ',
  },
};

/** Pick a supported language from ?lang= or the Accept-Language header. */
export function pickLang(queryLang, acceptLanguage, supported = Object.keys(UI), fallback = 'en') {
  if (queryLang && supported.includes(queryLang)) return queryLang;
  const prefs = (acceptLanguage || '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { code: tag.toLowerCase().split('-')[0], q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { code } of prefs) if (supported.includes(code)) return code;
  return fallback;
}
