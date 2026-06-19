import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { landingUi } from "@/lib/i18n";
import type { Locale } from "@/types/mad-pilgrim";

export const editableCopyKeys = [
  "kicker",
  "titleLine1",
  "titleLine2",
  "intro",
  "manifestoLead",
  "manifesto",
  "manifestoNote",
  "highlightsTitle",
  "highlightsIntro",
  "methodTitle",
  "methodIntro",
  "discoverTitle",
  "discoverIntro"
] as const;

export type EditableCopyKey = (typeof editableCopyKeys)[number];

export type LandingCopy = (typeof landingUi)["ja"] | (typeof landingUi)["en"];

// Server-only. Merges admin-edited overrides (site_copy table) over the static defaults in i18n.ts.
export async function getSiteCopy(locale: Locale): Promise<LandingCopy> {
  const defaults = landingUi[locale];
  const supabase = getSupabaseAdminClient();
  if (!supabase) return defaults;

  const { data, error } = await supabase
    .from("site_copy")
    .select("key, value")
    .eq("locale", locale);

  if (error || !data?.length) return defaults;

  const overrides = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return { ...defaults, ...overrides };
}

export async function listSiteCopyOverrides(locale: Locale): Promise<Record<string, string>> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("site_copy")
    .select("key, value")
    .eq("locale", locale);

  if (error || !data) return {};
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}
