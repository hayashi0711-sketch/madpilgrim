import type { Locale, SpotCategory, SpotStatus } from "@/types/mad-pilgrim";

export const locales: Locale[] = ["ja", "en"];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocale(value: string): Locale {
  return isLocale(value) ? value : "ja";
}

export const landingUi = {
  ja: {
    navigation: "メインナビゲーション",
    highlights: "注目の作品",
    howItWorks: "使い方",
    explore: "ロケ地を探す",
    kicker: "映像ロケ地ツーリズム × SCREEN-TO-TABLE",
    titleLine1: "シーンを旅して、",
    titleLine2: "物語を味わう。",
    intro: "映画、ドラマ、アニメの一場面から、実在するロケ地と作品につながる食体験へ。根拠を確認した情報だけで、次の巡礼を編集します。",
    primaryCta: "ロケ地レシートを開く",
    secondaryCta: "今週のシーン",
    featuredScene: "FEATURED SCENE / 今週の一場面",
    match: "SCENE MATCH",
    currentArchive: "現在のアーカイブ",
    works: "作品",
    places: "スポット",
    foodExperiences: "食体験",
    archiveNote: "公開中の確認済みアーカイブ。作品と現実の関係を、出典と確認状況つきで案内します。",
    manifestoLead: "WHERE WAS THIS SCENE FILMED?",
    manifesto: "画面の向こうを、今日の目的地に。",
    manifestoNote: "ロケ地だけで終わらない。その場面の余韻を、街と一皿までつなげます。",
    highlightsTitle: "物語から街へ。",
    highlightsIntro: "作品、シーン、場所、食を一続きの編集ストーリーとして読む。まずは代表的な巡礼から。",
    foodLinks: "件の食体験",
    locationOnly: "ロケ地ガイド",
    openStory: "詳細を見る",
    methodTitle: "探す。確かめる。味わう。",
    methodIntro: "曖昧な「舞台の街」ではなく、場面と場所の関係を明示します。食体験も、作品との根拠があるものを優先します。",
    steps: [
      { label: "SCREEN", title: "シーンを選ぶ", body: "作品名やカテゴリから、記憶に残る一場面を見つけます。" },
      { label: "PLACE", title: "関係を確かめる", body: "実際の撮影地、モデル、物語上の設定を区別して確認できます。" },
      { label: "TABLE", title: "物語を味わう", body: "劇中の料理、撮影店、公式コラボなど、作品につながる食体験へ。" }
    ],
    trustNote: "自動公開なし / 人による確認を経て掲載",
    discoverTitle: "次の巡礼を発行する。",
    discoverIntro: "作品とカテゴリを選び、地図、シーン情報、食体験を一枚のレシートのように確認できます。",
    openExplorer: "探索をはじめる"
  },
  en: {
    navigation: "Main navigation",
    highlights: "Highlights",
    howItWorks: "How it works",
    explore: "Explore locations",
    kicker: "FILMING-LOCATION TOURISM × SCREEN-TO-TABLE",
    titleLine1: "Travel through the scene.",
    titleLine2: "Taste the story.",
    intro: "Move from a memorable frame in film, television, or anime to its real-world location and connected food experience. Every journey begins with evidence.",
    primaryCta: "Open the location receipt",
    secondaryCta: "Scene of the week",
    featuredScene: "FEATURED SCENE / THIS WEEK",
    match: "SCENE MATCH",
    currentArchive: "Current archive",
    works: "Works",
    places: "Places",
    foodExperiences: "Food links",
    archiveNote: "A verified archive of works and real places, presented with sources and relationship status.",
    manifestoLead: "WHERE WAS THIS SCENE FILMED?",
    manifesto: "Turn the screen into today's destination.",
    manifestoNote: "Go beyond the location. Follow the feeling of a scene into the street and onto the table.",
    highlightsTitle: "From story to street.",
    highlightsIntro: "Read work, scene, place, and food as one continuous editorial story. Start with these selected pilgrimages.",
    foodLinks: "food links",
    locationOnly: "location guide",
    openStory: "Open story",
    methodTitle: "Find it. Verify it. Taste it.",
    methodIntro: "We distinguish filming locations, visual models, and narrative settings. Food is included when it has a documented connection to the work.",
    steps: [
      { label: "SCREEN", title: "Choose a scene", body: "Browse by work or media type and find the frame that stayed with you." },
      { label: "PLACE", title: "Check the relation", body: "See whether it was filmed here, visually modeled here, or simply set here." },
      { label: "TABLE", title: "Taste the story", body: "Continue to an on-screen dish, filming venue, official collaboration, or related menu." }
    ],
    trustNote: "NO AUTOMATED PUBLISHING / HUMAN VERIFIED",
    discoverTitle: "Issue your next pilgrimage.",
    discoverIntro: "Choose a work or category, then read its map, scene record, and food connection like a single location receipt.",
    openExplorer: "Start exploring"
  }
} as const;

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
    mv: "Music Video",
    drama: "ドラマ",
    movie: "映画",
    cm: "CM",
    manga: "マンガ"
  },
  en: {
    anime: "Anime",
    mv: "Music Video",
    drama: "Drama",
    movie: "Movie",
    cm: "CM",
    manga: "Manga"
  }
};
