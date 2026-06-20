import { saveDesignTokensAction } from "@/app/admin/actions";
import { DesignTokenColorInput } from "@/app/admin/design/color-input";
import {
  designTokens,
  listDesignTokenOverrides,
  normalizeDesignTokenValue
} from "@/lib/design-tokens";

export default async function AdminDesignPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const overrides = await listDesignTokenOverrides();

  return (
    <div>
      <h1 className="text-2xl font-bold">デザイン設定</h1>
      <p className="mt-2 text-sm text-zinc-500">
        公開サイトの配色と主要な文字・ナビゲーションサイズを変更します。
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          保存に失敗しました: {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          保存しました。
        </p>
      ) : null}

      <form action={saveDesignTokensAction} className="mt-6 space-y-5">
        {designTokens.map((token) => {
          const value =
            normalizeDesignTokenValue(token, overrides[token.key]) ?? token.defaultValue;

          return (
            <div key={token.key}>
              <label className="block text-sm font-semibold" htmlFor={`design-${token.key}`}>
                {token.label}
              </label>
              <p className="mt-0.5 text-xs text-zinc-400">
                CSS変数: {token.cssVariable} / 既定値: {token.defaultValue}
                {token.type === "number" ? "px" : ""}
              </p>
              {token.type === "color" ? (
                <DesignTokenColorInput
                  id={`design-${token.key}`}
                  name={`token:${token.key}`}
                  value={value}
                />
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    className="w-40 rounded-md border border-black/15 px-3 py-2 text-sm"
                    defaultValue={value}
                    id={`design-${token.key}`}
                    max={token.max}
                    min={token.min}
                    name={`token:${token.key}`}
                    step="1"
                    type="number"
                  />
                  <span className="text-sm text-zinc-500">px</span>
                </div>
              )}
            </div>
          );
        })}

        <button
          className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          type="submit"
        >
          保存
        </button>
      </form>
    </div>
  );
}
