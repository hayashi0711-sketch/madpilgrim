export type Locale = "ja" | "en";

export type SpotCategory = "anime" | "mv" | "drama" | "movie" | "cm" | "manga";

export type SpotStatus = "unverified" | "ai_suggested" | "approved" | "hidden";

export type LocalizedText = {
  ja: string;
  en: string;
};

export type NearbyFood = {
  id: string;
  spotSlug: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  priceLevel: number;
  isSponsored: boolean;
  tags: string[];
  description: LocalizedText;
  googleMapsUrl: string;
};

export type Spot = {
  id: string;
  title: LocalizedText;
  category: SpotCategory;
  spotName: LocalizedText;
  slug: string;
  prefecture: string;
  city: string;
  lat: number;
  lng: number;
  description: LocalizedText;
  seoTitle: LocalizedText;
  visitTips: LocalizedText;
  sceneTimestamp: LocalizedText;
  sceneNumber?: string;
  broadcaster?: string;
  releaseYear?: number;
  confidenceScore: number;
  sourceType: "official" | "fan" | "social" | "inferred";
  status: SpotStatus;
  ogImageUrl?: string;
  youtubeUrl?: string;
  youtubeChannelName?: string;
};
