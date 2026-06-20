"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { editableCopyKeys } from "@/lib/site-copy";
import { designTokens, normalizeDesignTokenValue } from "@/lib/design-tokens";

const ADMIN_COOKIE = "mp_admin_session";
const SPOT_CATEGORIES = new Set(["anime", "drama", "movie", "mv", "cm", "manga"]);
const SPOT_STATUSES = new Set(["approved", "ai_suggested", "hidden", "unverified"]);
const FOOD_IMAGE_TYPES = new Set(["washoku", "yoshoku", "chuka", "sweets", "gourmet", "location"]);

function adminSpotsUrl(formData: FormData, params: Record<string, string>) {
  const category = String(formData.get("returnCategory") || "");
  const searchParams = new URLSearchParams(params);
  if (SPOT_CATEGORIES.has(category)) searchParams.set("category", category);
  return `/admin/spots?${searchParams.toString()}`;
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin-login?error=1");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin-login");
}

export async function updateCopyAction(formData: FormData) {
  const locale = String(formData.get("locale") || "ja");
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(`/admin/copy?locale=${locale}&error=${encodeURIComponent("Supabase admin client is not configured")}`);
  }

  const entries = editableCopyKeys.map((key) => ({ key, value: formData.get(`copy:${key}`) }));
  const toUpsert = entries
    .filter((entry) => typeof entry.value === "string" && entry.value.trim().length > 0)
    .map((entry) => ({ key: entry.key, value: entry.value as string }))
    .map((entry) => ({ locale, key: entry.key, value: entry.value.trim() }));
  const toClear = entries.filter((entry) => typeof entry.value !== "string" || entry.value.trim().length === 0).map((entry) => entry.key);

  if (toUpsert.length) {
    const { error } = await supabase.from("site_copy").upsert(toUpsert, { onConflict: "locale,key" });
    if (error) redirect(`/admin/copy?locale=${locale}&error=${encodeURIComponent(error.message)}`);
  }
  if (toClear.length) {
    const { error } = await supabase.from("site_copy").delete().eq("locale", locale).in("key", toClear);
    if (error) redirect(`/admin/copy?locale=${locale}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/copy");
  redirect(`/admin/copy?locale=${locale}&saved=1`);
}

export async function saveDesignTokensAction(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(
      `/admin/design?error=${encodeURIComponent("Supabase admin client is not configured")}`
    );
  }

  const values = designTokens.map((token) => {
    const rawValue = formData.get(`token:${token.key}`);
    const value = normalizeDesignTokenValue(
      token,
      typeof rawValue === "string" ? rawValue : undefined
    );

    if (value === null) {
      redirect(`/admin/design?error=${encodeURIComponent(`${token.label}の値が不正です`)}`);
    }

    return { key: token.key, value };
  });

  const { error } = await supabase.from("design_tokens").upsert(values, { onConflict: "key" });
  if (error) redirect(`/admin/design?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  revalidatePath("/admin/design");
  redirect("/admin/design?saved=1");
}

export async function toggleFeaturedAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const isFeatured = formData.get("isFeatured") === "on";
  const supabase = getSupabaseAdminClient();
  if (!supabase) redirect(`/admin/spots?error=${encodeURIComponent("Supabase admin client is not configured")}`);

  const { error } = await supabase.from("spots").update({ is_featured: isFeatured }).eq("id", id);
  if (error) redirect(`/admin/spots?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/spots");
  redirect("/admin/spots?saved=1");
}

export async function updateSpotListFieldsAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const category = String(formData.get("category") || "");
  const status = String(formData.get("status") || "");
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  if (!id || !SPOT_CATEGORIES.has(category) || !SPOT_STATUSES.has(status)) {
    redirect(adminSpotsUrl(formData, { error: "入力内容が正しくありません" }));
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(adminSpotsUrl(formData, { error: "Supabase admin client is not configured" }));
  }

  const { error } = await supabase
    .from("spots")
    .update({
      status,
      is_featured: formData.get("is_featured") === "on",
      category,
      broadcaster: text("broadcaster"),
      youtube_url: text("youtube_url"),
      youtube_channel_name: text("youtube_channel_name")
    })
    .eq("id", id);

  if (error) redirect(adminSpotsUrl(formData, { error: error.message }));

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/spots");
  redirect(adminSpotsUrl(formData, { saved: "1" }));
}

export async function deleteSpotAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) redirect(adminSpotsUrl(formData, { error: "削除対象が指定されていません" }));

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(adminSpotsUrl(formData, { error: "Supabase admin client is not configured" }));
  }

  // nearby_foods.spot_id uses ON DELETE CASCADE.
  const { error } = await supabase.from("spots").delete().eq("id", id);
  if (error) redirect(adminSpotsUrl(formData, { error: error.message }));

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/spots");
  redirect(adminSpotsUrl(formData, { deleted: "1" }));
}

function readSpotFields(formData: FormData) {
  const num = (key: string) => {
    const raw = formData.get(key);
    if (typeof raw !== "string" || raw.trim() === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };
  const text = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
  };

  return {
    slug: text("slug"),
    title: text("title"),
    title_en: text("title_en"),
    category: text("category"),
    spot_name: text("spot_name"),
    spot_name_en: text("spot_name_en"),
    prefecture: text("prefecture"),
    city: text("city"),
    latitude: num("latitude"),
    longitude: num("longitude"),
    description_ja: text("description_ja"),
    description_en: text("description_en"),
    visit_tips_ja: text("visit_tips_ja"),
    visit_tips_en: text("visit_tips_en"),
    scene_timestamp: text("scene_timestamp"),
    scene_number: text("scene_number"),
    broadcaster: text("broadcaster"),
    release_year: num("release_year"),
    youtube_url: text("youtube_url"),
    youtube_channel_name: text("youtube_channel_name"),
    food_image_type: FOOD_IMAGE_TYPES.has(text("food_image_type") || "") ? text("food_image_type") : null,
    status: text("status") || "approved",
    source_type: text("source_type") || "official",
    confidence_score: num("confidence_score") ?? 0.9,
    is_featured: formData.get("is_featured") === "on"
  };
}

function readFoodFields(formData: FormData) {
  const num = (key: string) => {
    const raw = formData.get(key);
    if (typeof raw !== "string" || raw.trim() === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };
  const text = (key: string) => {
    const raw = formData.get(key);
    return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
  };
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    spot_id: text("spot_id"),
    name: text("name"),
    category: text("category"),
    address: text("address"),
    latitude: num("latitude"),
    longitude: num("longitude"),
    rating: num("rating"),
    price_level: num("price_level"),
    description_ja: text("description_ja"),
    description_en: text("description_en"),
    tags,
    google_maps_url: text("google_maps_url"),
    website_url: text("website_url"),
    is_sponsored: formData.get("is_sponsored") === "on"
  };
}

export async function createSpotAction(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) redirect(`/admin/spots/new?error=${encodeURIComponent("Supabase admin client is not configured")}`);

  const fields = readSpotFields(formData);
  if (!fields.slug || !fields.title || !fields.category || !fields.spot_name) {
    redirect(`/admin/spots/new?error=${encodeURIComponent("slug / title / category / spot_name は必須です")}`);
  }
  if (fields.latitude === null || fields.longitude === null) {
    redirect(`/admin/spots/new?error=${encodeURIComponent("緯度・経度は必須です")}`);
  }

  const { error } = await supabase.rpc("upsert_spot_candidate", {
    p_slug: fields.slug,
    p_title: fields.title,
    p_category: fields.category,
    p_spot_name: fields.spot_name,
    p_latitude: fields.latitude,
    p_longitude: fields.longitude,
    p_description_ja: fields.description_ja,
    p_description_en: fields.description_en,
    p_visit_tips_ja: fields.visit_tips_ja,
    p_scene_timestamp: fields.scene_timestamp,
    p_confidence_score: fields.confidence_score,
    p_source_type: fields.source_type,
    p_status: fields.status,
    p_prefecture: fields.prefecture,
    p_city: fields.city
  });
  if (error) redirect(`/admin/spots/new?error=${encodeURIComponent(error.message)}`);

  // Fields not covered by upsert_spot_candidate are set directly with a follow-up update.
  const { error: updateError } = await supabase
    .from("spots")
    .update({
      title_en: fields.title_en,
      spot_name_en: fields.spot_name_en,
      description_en: fields.description_en,
      visit_tips_en: fields.visit_tips_en,
      scene_number: fields.scene_number,
      broadcaster: fields.broadcaster,
      release_year: fields.release_year,
      youtube_url: fields.youtube_url,
      youtube_channel_name: fields.youtube_channel_name,
      food_image_type: fields.food_image_type,
      is_featured: fields.is_featured
    })
    .eq("slug", fields.slug);
  if (updateError) redirect(`/admin/spots/new?error=${encodeURIComponent(updateError.message)}`);

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/spots");
  redirect("/admin/spots");
}

export async function createFoodAction(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(`/admin/foods/new?error=${encodeURIComponent("Supabase admin client is not configured")}`);
  }

  const fields = readFoodFields(formData);
  if (!fields.spot_id || !fields.name) {
    redirect(`/admin/foods/new?error=${encodeURIComponent("作品と店舗名は必須です")}`);
  }
  if ((fields.latitude === null) !== (fields.longitude === null)) {
    redirect(`/admin/foods/new?error=${encodeURIComponent("緯度と経度は両方入力してください")}`);
  }
  if (
    (fields.latitude !== null && (fields.latitude < -90 || fields.latitude > 90)) ||
    (fields.longitude !== null && (fields.longitude < -180 || fields.longitude > 180))
  ) {
    redirect(`/admin/foods/new?error=${encodeURIComponent("緯度・経度の値が範囲外です")}`);
  }

  const { data: food, error } = await supabase
    .from("nearby_foods")
    .insert({
      spot_id: fields.spot_id,
      name: fields.name,
      category: fields.category,
      address: fields.address,
      rating: fields.rating,
      price_level: fields.price_level,
      description_ja: fields.description_ja,
      description_en: fields.description_en,
      tags: fields.tags,
      google_maps_url: fields.google_maps_url,
      website_url: fields.website_url,
      is_sponsored: fields.is_sponsored
    })
    .select("id")
    .single();
  if (error) redirect(`/admin/foods/new?error=${encodeURIComponent(error.message)}`);

  const { error: geomError } = await supabase.rpc("admin_upsert_food_geom", {
    p_id: food.id,
    p_lat: fields.latitude,
    p_lng: fields.longitude
  });
  if (geomError) {
    await supabase.from("nearby_foods").delete().eq("id", food.id);
    redirect(`/admin/foods/new?error=${encodeURIComponent(geomError.message)}`);
  }

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/foods");
  redirect("/admin/foods?saved=1");
}

export async function updateFoodAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/foods");

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(`/admin/foods/${id}?error=${encodeURIComponent("Supabase admin client is not configured")}`);
  }

  const fields = readFoodFields(formData);
  if (!fields.spot_id || !fields.name) {
    redirect(`/admin/foods/${id}?error=${encodeURIComponent("作品と店舗名は必須です")}`);
  }
  if ((fields.latitude === null) !== (fields.longitude === null)) {
    redirect(`/admin/foods/${id}?error=${encodeURIComponent("緯度と経度は両方入力してください")}`);
  }
  if (
    (fields.latitude !== null && (fields.latitude < -90 || fields.latitude > 90)) ||
    (fields.longitude !== null && (fields.longitude < -180 || fields.longitude > 180))
  ) {
    redirect(`/admin/foods/${id}?error=${encodeURIComponent("緯度・経度の値が範囲外です")}`);
  }

  const { error } = await supabase
    .from("nearby_foods")
    .update({
      spot_id: fields.spot_id,
      name: fields.name,
      category: fields.category,
      address: fields.address,
      rating: fields.rating,
      price_level: fields.price_level,
      description_ja: fields.description_ja,
      description_en: fields.description_en,
      tags: fields.tags,
      google_maps_url: fields.google_maps_url,
      website_url: fields.website_url,
      is_sponsored: fields.is_sponsored
    })
    .eq("id", id);
  if (error) redirect(`/admin/foods/${id}?error=${encodeURIComponent(error.message)}`);

  const { error: geomError } = await supabase.rpc("admin_upsert_food_geom", {
    p_id: id,
    p_lat: fields.latitude,
    p_lng: fields.longitude
  });
  if (geomError) redirect(`/admin/foods/${id}?error=${encodeURIComponent(geomError.message)}`);

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/foods");
  redirect("/admin/foods?saved=1");
}

export async function deleteFoodAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect(`/admin/foods?error=${encodeURIComponent("削除対象が指定されていません")}`);
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect(`/admin/foods?error=${encodeURIComponent("Supabase admin client is not configured")}`);
  }

  const { error } = await supabase.from("nearby_foods").delete().eq("id", id);
  if (error) redirect(`/admin/foods?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/foods");
  redirect("/admin/foods?deleted=1");
}

export async function updateSpotAction(formData: FormData) {
  const supabase = getSupabaseAdminClient();
  const id = String(formData.get("id") || "");
  if (!supabase) redirect(`/admin/spots/${id}?error=${encodeURIComponent("Supabase admin client is not configured")}`);
  if (!id) redirect("/admin/spots");

  const fields = readSpotFields(formData);

  if (fields.latitude !== null && fields.longitude !== null) {
    const { error: geomError } = await supabase.rpc("admin_update_spot_geom", {
      p_id: id,
      p_lat: fields.latitude,
      p_lng: fields.longitude
    });
    if (geomError) redirect(`/admin/spots/${id}?error=${encodeURIComponent(geomError.message)}`);
  }

  const { error } = await supabase
    .from("spots")
    .update({
      title: fields.title,
      title_en: fields.title_en,
      category: fields.category,
      spot_name: fields.spot_name,
      spot_name_en: fields.spot_name_en,
      prefecture: fields.prefecture,
      city: fields.city,
      description_ja: fields.description_ja,
      description_en: fields.description_en,
      visit_tips_ja: fields.visit_tips_ja,
      visit_tips_en: fields.visit_tips_en,
      scene_timestamp: fields.scene_timestamp,
      scene_number: fields.scene_number,
      broadcaster: fields.broadcaster,
      release_year: fields.release_year,
      youtube_url: fields.youtube_url,
      youtube_channel_name: fields.youtube_channel_name,
      food_image_type: fields.food_image_type,
      status: fields.status,
      is_featured: fields.is_featured
    })
    .eq("id", id);
  if (error) redirect(`/admin/spots/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/spots");
  redirect("/admin/spots");
}
