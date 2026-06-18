import { getNearbyFoods, getSpot, spots } from "@/data/sample-spots";
import { getSupabaseClient } from "@/lib/supabase";
import type { NearbyFood, Spot, SpotCategory, SpotStatus } from "@/types/mad-pilgrim";

type PublicSpotRow = {
  id: string;
  title: string;
  title_en: string | null;
  category: SpotCategory;
  spot_name: string;
  spot_name_en: string | null;
  slug: string;
  prefecture: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  description_ja: string | null;
  description_en: string | null;
  seo_title_ja: string | null;
  seo_title_en: string | null;
  visit_tips_ja: string | null;
  visit_tips_en: string | null;
  scene_timestamp: string | null;
  scene_timestamp_en: string | null;
  scene_number: string | null;
  broadcaster: string | null;
  release_year: number | null;
  confidence_score: number | null;
  source_type: Spot["sourceType"] | null;
  status: SpotStatus;
  og_image_url: string | null;
};

type PublicFoodRow = {
  id: string;
  spot_slug: string;
  name: string;
  category: string | null;
  address: string | null;
  rating: number | null;
  price_level: number | null;
  google_maps_url: string | null;
  description_ja: string | null;
  description_en: string | null;
  tags: string[] | null;
  is_sponsored: boolean | null;
};

function toSpot(row: PublicSpotRow): Spot {
  const title = row.title || row.spot_name;
  const spotName = row.spot_name || row.title;

  return {
    id: row.id,
    title: {
      ja: title,
      en: row.title_en || title
    },
    category: row.category,
    spotName: {
      ja: spotName,
      en: row.spot_name_en || spotName
    },
    slug: row.slug,
    prefecture: row.prefecture || "",
    city: row.city || "",
    lat: row.latitude,
    lng: row.longitude,
    description: {
      ja: row.description_ja || "",
      en: row.description_en || row.description_ja || ""
    },
    seoTitle: {
      ja: row.seo_title_ja || `${title} ${spotName}の聖地情報`,
      en: row.seo_title_en || `${title} ${spotName} Pilgrimage Guide`
    },
    visitTips: {
      ja: row.visit_tips_ja || "",
      en: row.visit_tips_en || row.visit_tips_ja || ""
    },
    sceneTimestamp: {
      ja: row.scene_timestamp || "",
      en: row.scene_timestamp_en || row.scene_timestamp || ""
    },
    sceneNumber: row.scene_number || undefined,
    broadcaster: row.broadcaster || undefined,
    releaseYear: row.release_year || undefined,
    confidenceScore: row.confidence_score ?? 0.5,
    sourceType: row.source_type || "inferred",
    status: row.status,
    ogImageUrl: row.og_image_url || undefined
  };
}

function toFood(row: PublicFoodRow): NearbyFood {
  return {
    id: row.id,
    spotSlug: row.spot_slug,
    name: row.name,
    category: row.category || "food",
    address: row.address || "",
    rating: row.rating ?? 0,
    priceLevel: row.price_level ?? 0,
    isSponsored: Boolean(row.is_sponsored),
    tags: row.tags || [],
    description: {
      ja: row.description_ja || "",
      en: row.description_en || row.description_ja || ""
    },
    googleMapsUrl: row.google_maps_url || "https://maps.google.com"
  };
}

async function trySupabaseSpots() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_spots")
    .select("*")
    .order("status", { ascending: true })
    .order("confidence_score", { ascending: false });

  if (error || !data?.length) return null;
  return (data as PublicSpotRow[]).map(toSpot);
}

async function trySupabaseSpot(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("public_spots").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return toSpot(data as PublicSpotRow);
}

async function trySupabaseFoods(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("public_nearby_foods")
    .select("*")
    .eq("spot_slug", slug)
    .order("is_sponsored", { ascending: false })
    .order("rating", { ascending: false });

  if (error || !data?.length) return null;
  return (data as PublicFoodRow[]).map(toFood);
}

export async function listSpots() {
  return (await trySupabaseSpots()) || spots;
}

export async function readSpot(slug: string) {
  return (await trySupabaseSpot(slug)) || getSpot(slug);
}

export async function listNearbyFoods(slug: string) {
  return (await trySupabaseFoods(slug)) || getNearbyFoods(slug);
}

export async function listNearbyFoodsForSpots(slugs: string[]): Promise<Record<string, NearbyFood[]>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => [slug, await listNearbyFoods(slug)] as const)
  );
  return Object.fromEntries(entries.filter(([, foods]) => foods.length > 0));
}
