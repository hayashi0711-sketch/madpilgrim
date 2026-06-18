import type { Locale, SpotCategory, SpotStatus } from "@/types/mad-pilgrim";

export const locales: Locale[] = ["ja", "en"];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocale(value: string): Locale {
  return isLocale(value) ? value : "ja";
}

export const ui = {
  ja: {
    brand: "MAD Pilgrim",
    eyebrow: "AI聖地アトラス",
    tagline: "聖地は、あなたが着く前から、あなたを待っている。",
    map: "巡礼マップ",
    all: "すべて",
    approvedOnly: "承認済みのみ",
    food: "周辺グルメ",
    foodMap: "グルメマップ",
    viewAll: "すべて見る",
    confidence: "信頼度",
    tips: "訪問メモ",
    scene: "シーン",
    openMap: "Googleマップ",
    viewSpot: "詳細を見る",
    sponsored: "PR",
    status: "ステータス",
    foodsIntro: "スポンサー表示あり。評価の高い順に、巡礼のあとに寄りやすい店を載せています。",
    mapPreview: "プレビュー地図",
    mapPreviewNote: "簡易表示です。ピンをタップして詳細へ。",
    noSpots: "条件に合う聖地がありません。"
  },
  en: {
    brand: "MAD Pilgrim",
    eyebrow: "AI pilgrimage atlas",
    tagline: "The sacred place is already waiting before you arrive.",
    map: "Pilgrimage Map",
    all: "All",
    approvedOnly: "Approved only",
    food: "Nearby food",
    foodMap: "Food map",
    viewAll: "View all",
    confidence: "Confidence",
    tips: "Visit notes",
    scene: "Scene",
    openMap: "Google Maps",
    viewSpot: "View spot",
    sponsored: "PR",
    status: "Status",
    foodsIntro: "Sponsored listings are clearly labeled, followed by convenient nearby picks sorted by rating.",
    mapPreview: "Preview map",
    mapPreviewNote: "Simplified view. Tap a pin for spot details.",
    noSpots: "No spots match your filters."
  }
} as const;

export function sectionLabelClass(locale: Locale): string {
  return locale === "ja"
    ? "text-sm font-semibold text-shrine"
    : "text-sm font-semibold uppercase tracking-[0.2em] text-shrine";
}

export function cardLabelClass(locale: Locale): string {
  return locale === "ja"
    ? "text-xs font-semibold text-shrine"
    : "text-xs font-semibold uppercase tracking-[0.18em] text-shrine";
}

export const statusLabels: Record<Locale, Record<SpotStatus, string>> = {
  ja: {
    approved: "承認済み",
    ai_suggested: "AI提案",
    unverified: "未確認",
    hidden: "非公開"
  },
  en: {
    approved: "Approved",
    ai_suggested: "AI suggested",
    unverified: "Unverified",
    hidden: "Hidden"
  }
};

export const categoryLabels: Record<Locale, Record<SpotCategory, string>> = {
  ja: {
    anime: "アニメ",
    mv: "MV",
    drama: "ドラマ",
    movie: "映画",
    cm: "CM"
  },
  en: {
    anime: "Anime",
    mv: "MV",
    drama: "Drama",
    movie: "Movie",
    cm: "CM"
  }
};
