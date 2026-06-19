import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">管理画面</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link className="rounded-lg border border-black/10 bg-white p-5 hover:border-black/30" href="/admin/spots">
          <h2 className="font-semibold">スポット管理</h2>
          <p className="mt-1 text-sm text-zinc-500">作品カードの編集・追加、トップページの「おすすめ」表示の切り替え。</p>
        </Link>
        <Link className="rounded-lg border border-black/10 bg-white p-5 hover:border-black/30" href="/admin/copy">
          <h2 className="font-semibold">サイト文言</h2>
          <p className="mt-1 text-sm text-zinc-500">トップページのキャッチコピー・見出し等のテキストを編集。</p>
        </Link>
      </div>
    </div>
  );
}
