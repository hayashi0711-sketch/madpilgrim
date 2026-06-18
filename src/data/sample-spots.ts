import type { NearbyFood, Spot } from "@/types/mad-pilgrim";

export const spots: Spot[] = [
  {
    id: "spot-unnatural-nihonbashi",
    title: { ja: "アンナチュラル", en: "Unnatural" },
    category: "drama",
    broadcaster: "TBS",
    releaseYear: 2018,
    sceneNumber: "12",
    spotName: { ja: "中央区 東日本橋", en: "Chuo Nihonbashi" },
    slug: "unnatural-nihonbashi",
    prefecture: "tokyo",
    city: "chuo",
    lat: 35.6893,
    lng: 139.7836,
    description: {
      ja: "法医解剖医チームが真実を追うシーン。東日本橋の倉庫街が緊迫した夜の撮影地として使用された。建物外観・照明・路地の構成が劇中と一致。",
      en: "Forensic team night chase scene. The Nihonbashi warehouse district exterior and alley layout match the episode."
    },
    seoTitle: {
      ja: "アンナチュラル 東日本橋ロケ地情報",
      en: "Unnatural Tokyo Filming Location Guide"
    },
    visitTips: {
      ja: "倉庫街のため夜間は照明が少ない。昼間の訪問を推奨。",
      en: "Limited street lighting at night. Daytime visits recommended."
    },
    sceneTimestamp: { ja: "23:41", en: "23:41" },
    confidenceScore: 0.97,
    sourceType: "official",
    status: "approved"
  },
  {
    id: "spot-saiai-daiba",
    title: { ja: "最愛", en: "Saiai" },
    category: "drama",
    broadcaster: "TBS",
    releaseYear: 2021,
    sceneNumber: "05",
    spotName: { ja: "港区 台場", en: "Minato Daiba" },
    slug: "saiai-daiba",
    prefecture: "tokyo",
    city: "minato",
    lat: 35.6275,
    lng: 139.7753,
    description: {
      ja: "台場の夜景を背景に展開するサスペンスシーン。複数話にわたりロケ地として使用された屋外エリア。",
      en: "Waterfront Daiba used for key suspense scenes across multiple episodes. Outdoor terrace matches the frame."
    },
    seoTitle: {
      ja: "最愛 台場ロケ地情報",
      en: "Saiai Daiba Filming Location Guide"
    },
    visitTips: {
      ja: "夕方以降のライトアップ時間帯が撮影シーンの雰囲気に最も近い。",
      en: "Evening illumination hours most closely match the filmed atmosphere."
    },
    sceneTimestamp: { ja: "16:18", en: "16:18" },
    confidenceScore: 0.95,
    sourceType: "official",
    status: "approved"
  },
  {
    id: "spot-miu404-dogenzaka",
    title: { ja: "MIU404", en: "MIU404" },
    category: "drama",
    broadcaster: "TBS",
    releaseYear: 2020,
    sceneNumber: "06",
    spotName: { ja: "渋谷区 道玄坂2丁目", en: "Shibuya Dogenzaka" },
    slug: "miu404-dogenzaka",
    prefecture: "tokyo",
    city: "shibuya",
    lat: 35.6594,
    lng: 139.6984,
    description: {
      ja: "渋谷スクランブル交差点から徒歩で追走するシーンの後、伊吹と志摩が入ったラーメン店のカウンター席。店内のレイアウト、メニュー、丼の構成が一致。",
      en: "After a foot chase from Shibuya Scramble, the ramen counter where Ibuki and Shima sat. Layout, menu, and bowl match."
    },
    seoTitle: {
      ja: "MIU404 道玄坂ロケ地情報",
      en: "MIU404 Dogenzaka Filming Location Guide"
    },
    visitTips: {
      ja: "昼のランチ時間は混雑する。開店直後か15時以降が比較的空いている。",
      en: "Lunch rush can be crowded. Try opening time or after 3pm."
    },
    sceneTimestamp: { ja: "21:03", en: "21:03" },
    confidenceScore: 0.98,
    sourceType: "official",
    status: "approved"
  },
  {
    id: "spot-yourname-shinjuku",
    title: { ja: "君の名は。", en: "Your Name" },
    category: "movie",
    broadcaster: "東宝",
    releaseYear: 2016,
    sceneNumber: "終盤",
    spotName: { ja: "新宿区 新宿駅南口", en: "Shinjuku South Exit" },
    slug: "your-name-shinjuku-south",
    prefecture: "tokyo",
    city: "shinjuku",
    lat: 35.6896,
    lng: 139.7006,
    description: {
      ja: "映画終盤の東京シーン。新宿駅南口ペデストリアンデッキからの視点が作中と一致。夕方の光の角度も再現性が高い。",
      en: "The final Tokyo search sequence. The pedestrian deck view from Shinjuku South Exit matches the film composition."
    },
    seoTitle: {
      ja: "君の名は。新宿ロケ地情報",
      en: "Your Name Shinjuku Filming Location Guide"
    },
    visitTips: {
      ja: "デッキからの眺めは夕方が映画の光に最も近い。週末は混雑するため平日推奨。",
      en: "Evening light on the deck most closely matches the film. Weekday visits recommended."
    },
    sceneTimestamp: { ja: "東京シーン", en: "Tokyo scene" },
    confidenceScore: 0.93,
    sourceType: "official",
    status: "approved"
  },
  {
    id: "spot-jjk-roppongi",
    title: { ja: "呪術廻戦", en: "Jujutsu Kaisen" },
    category: "anime",
    broadcaster: "MBS",
    releaseYear: 2020,
    sceneNumber: "03",
    spotName: { ja: "港区 六本木", en: "Minato Roppongi" },
    slug: "jujutsu-kaisen-roppongi",
    prefecture: "tokyo",
    city: "minato",
    lat: 35.6628,
    lng: 139.7317,
    description: {
      ja: "六本木の夜の街並みがアニメの都市描写の参考とされたエリア。ミッドタウン周辺の交差点が特に一致度が高い。",
      en: "Roppongi nightscape referenced in the anime's urban background art. Midtown intersection has the highest visual match."
    },
    seoTitle: {
      ja: "呪術廻戦 六本木ロケ地情報",
      en: "Jujutsu Kaisen Roppongi Filming Location Guide"
    },
    visitTips: {
      ja: "夜間の撮影は光量が多く映えるが、深夜は周囲の状況に注意。",
      en: "Night shots have good light but stay aware of surroundings late at night."
    },
    sceneTimestamp: { ja: "12:07", en: "12:07" },
    confidenceScore: 0.95,
    sourceType: "official",
    status: "approved"
  }
];

export const nearbyFoods: NearbyFood[] = [
  {
    id: "food-miu404-suzuki-ramen",
    spotSlug: "miu404-dogenzaka",
    name: "中華そば すず喜",
    category: "ramen",
    address: "東京都渋谷区道玄坂2-6-3",
    rating: 4.5,
    priceLevel: 2,
    isSponsored: false,
    tags: ["現金のみ", "カウンター席"],
    description: {
      ja: "MIU404 第6話で伊吹と志摩が立ち寄ったラーメン店。特製 中華そば（¥1,150）が劇中の丼と一致。",
      en: "The ramen shop Ibuki and Shima visited in MIU404 ep.6. Signature chuuka soba matches the scene bowl."
    },
    googleMapsUrl: "https://maps.google.com"
  },
  {
    id: "food-unnatural-cafe",
    spotSlug: "unnatural-nihonbashi",
    name: "東日本橋コーヒーロースターズ",
    category: "cafe",
    address: "東京都中央区東日本橋2丁目",
    rating: 4.2,
    priceLevel: 2,
    isSponsored: false,
    tags: ["Wi-Fi", "自家焙煎"],
    description: {
      ja: "ロケ地近くのスペシャルティコーヒー店。撮影後の休憩に適している。",
      en: "Specialty coffee near the filming location, ideal for a post-visit break."
    },
    googleMapsUrl: "https://maps.google.com"
  },
  {
    id: "food-yourname-shinjuku-gyoza",
    spotSlug: "your-name-shinjuku-south",
    name: "新宿南口 餃子スタンド",
    category: "izakaya",
    address: "東京都新宿区新宿3丁目",
    rating: 4.1,
    priceLevel: 1,
    isSponsored: false,
    tags: ["立ち食い", "テイクアウト"],
    description: {
      ja: "新宿駅南口から徒歩3分。映画の東京シーン巡礼後の軽食に。",
      en: "3 min from Shinjuku South Exit. A quick bite after touring the film location."
    },
    googleMapsUrl: "https://maps.google.com"
  }
];

export function getSpot(slug: string) {
  return spots.find((spot) => spot.slug === slug);
}

export function getNearbyFoods(slug: string) {
  return nearbyFoods
    .filter((food) => food.spotSlug === slug)
    .sort((a, b) => Number(b.isSponsored) - Number(a.isSponsored) || b.rating - a.rating);
}
