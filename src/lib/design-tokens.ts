import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type DesignTokenBase = {
  key: string;
  cssVariable: `--${string}`;
  label: string;
  defaultValue: string;
};

export type DesignTokenDefinition =
  | (DesignTokenBase & { type: "color" })
  | (DesignTokenBase & { type: "number"; min: number; max: number });

export const designTokens = [
  {
    key: "colorNavy",
    cssVariable: "--color-navy",
    label: "メインカラー（ネイビー）",
    type: "color",
    defaultValue: "#121826"
  },
  {
    key: "colorCharcoal",
    cssVariable: "--color-charcoal",
    label: "サブカラー（チャコール）",
    type: "color",
    defaultValue: "#1d2128"
  },
  {
    key: "colorPaper",
    cssVariable: "--color-paper",
    label: "背景色（ペーパー）",
    type: "color",
    defaultValue: "#f3f1ec"
  },
  {
    key: "colorSignal",
    cssVariable: "--color-signal",
    label: "アクセントカラー（ゴールド）",
    type: "color",
    defaultValue: "#c2a14d"
  },
  {
    key: "colorSilver",
    cssVariable: "--color-silver",
    label: "シルバー",
    type: "color",
    defaultValue: "#c9ced6"
  },
  {
    key: "heroTitleSize",
    cssVariable: "--hero-title-size",
    label: "トップ大見出しサイズ(px)",
    type: "number",
    defaultValue: "92",
    min: 50,
    max: 160
  },
  {
    key: "sectionHeadingSize",
    cssVariable: "--section-heading-size",
    label: "見出しサイズ(px)",
    type: "number",
    defaultValue: "82",
    min: 45,
    max: 140
  },
  {
    key: "navButtonWidth",
    cssVariable: "--nav-button-width",
    label: "ナビボタン幅(px)",
    type: "number",
    defaultValue: "100",
    min: 60,
    max: 240
  },
  {
    key: "navButtonFontSize",
    cssVariable: "--nav-button-font-size",
    label: "ナビボタン文字サイズ(px)",
    type: "number",
    defaultValue: "14",
    min: 8,
    max: 32
  },
  {
    key: "bodyTextSize",
    cssVariable: "--body-text-size",
    label: "本文文字サイズ(px)",
    type: "number",
    defaultValue: "15",
    min: 10,
    max: 28
  }
] as const satisfies readonly DesignTokenDefinition[];

export type DesignTokenStyles = Record<`--${string}`, string>;

export function normalizeDesignTokenValue(
  token: (typeof designTokens)[number],
  value: string | undefined
): string | null {
  if (value === undefined) return token.defaultValue;

  const trimmed = value.trim();
  if (token.type === "color") {
    return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed.toLowerCase() : null;
  }

  const number = Number(trimmed);
  if (!Number.isFinite(number) || number < token.min || number > token.max) return null;
  return String(number);
}

export async function listDesignTokenOverrides(): Promise<Record<string, string>> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return {};

  const { data, error } = await supabase.from("design_tokens").select("key, value");
  if (error || !data) return {};

  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

export async function getDesignTokens(): Promise<DesignTokenStyles> {
  const overrides = await listDesignTokenOverrides();

  return Object.fromEntries(
    designTokens.map((token) => {
      const value = normalizeDesignTokenValue(token, overrides[token.key]) ?? token.defaultValue;
      return [token.cssVariable, token.type === "number" ? `${value}px` : value];
    })
  ) as DesignTokenStyles;
}
