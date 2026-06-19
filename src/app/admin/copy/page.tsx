import { updateCopyAction } from "@/app/admin/actions";
import { editableCopyKeys, listSiteCopyOverrides } from "@/lib/site-copy";
import { landingUi } from "@/lib/i18n";
import type { Locale } from "@/types/mad-pilgrim";

const labels: Record<string, string> = {
  kicker: "キッカー（ナビ下の小さい文言）",
  titleLine1: "見出し 1行目",
  titleLine2: "見出し 2行目（強調表示）",
  intro: "導入文",
  manifestoLead: "マニフェスト見出し上のラベル",
  manifesto: "マニフェスト見出し",
  manifestoNote: "マニフェスト補足文",
  highlightsTitle: "おすすめ巡礼セクションの見出し",
  highlightsIntro: "おすすめ巡礼セクションの説明文",
  methodTitle: "使い方セクションの見出し",
  methodIntro: "使い方セクションの説明文",
  discoverTitle: "探索セクションの見出し",
  discoverIntro: "探索セクションの説明文"
};

export default async function AdminCopyPage({
  searchParams
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale: localeParam } = await searchParams;
  const locale: Locale = localeParam === "en" ? "en" : "ja";
  const overrides = await listSiteCopyOverrides(locale);
  const defaults = landingUi[locale];

  return (
    <div>
      <h1 className="text-2xl font-bold">サイト文言</h1>
      <div className="mt-3 flex gap-2 text-sm">
        <a className={locale === "ja" ? "font-semibold underline" : "text-zinc-500"} href="/admin/copy?locale=ja">日本語</a>
        <a className={locale === "en" ? "font-semibold underline" : "text-zinc-500"} href="/admin/copy?locale=en">English</a>
      </div>

      <form action={updateCopyAction} className="mt-6 space-y-5">
        <input name="locale" type="hidden" value={locale} />
        {editableCopyKeys.map((key) => (
          <div key={key}>
            <label className="block text-sm font-semibold" htmlFor={`copy-${key}`}>{labels[key] || key}</label>
            <p className="mt-0.5 text-xs text-zinc-400">既定値: {defaults[key as keyof typeof defaults] as string}</p>
            <textarea
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
              defaultValue={overrides[key] ?? ""}
              id={`copy-${key}`}
              name={`copy:${key}`}
              placeholder={defaults[key as keyof typeof defaults] as string}
              rows={key === "intro" || key.endsWith("Intro") ? 3 : 1}
            />
          </div>
        ))}
        <button className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800" type="submit">
          保存
        </button>
        <p className="text-xs text-zinc-400">空欄のまま保存すると既定値が使われます。</p>
      </form>
    </div>
  );
}
