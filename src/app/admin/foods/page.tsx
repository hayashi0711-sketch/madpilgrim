import Link from "next/link";
import { DeleteFoodForm } from "@/components/admin/DeleteFoodForm";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function AdminFoodsPage({
  searchParams
}: {
  searchParams: Promise<{ deleted?: string; error?: string; saved?: string }>;
}) {
  const { deleted, error: actionError, saved } = await searchParams;
  const supabase = getSupabaseAdminClient();
  let foods = null;
  let count = 0;
  let error: string | { message: string } | null = null;

  if (supabase) {
    const result = await supabase
      .from("admin_nearby_foods")
      .select("id, spot_title, spot_slug, name, rating, website_url, created_at", { count: "exact" })
      .order("created_at", { ascending: false });
    foods = result.data;
    count = result.count ?? 0;
    error = result.error;
  } else {
    error = "Supabase admin client is not configured";
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">店舗管理</h1>
        <Link className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800" href="/admin/foods/new">
          + 新規追加
        </Link>
      </div>

      {actionError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          保存に失敗しました: {actionError}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          保存しました。
        </p>
      ) : null}
      {deleted ? (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          削除しました。
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600">
          {typeof error === "string" ? error : error.message}
        </p>
      ) : null}

      <p className="mt-6 text-sm font-semibold">合計 {count} 件</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-zinc-500">
              <th className="py-2">作品名</th>
              <th className="py-2">店舗名</th>
              <th className="py-2">評価</th>
              <th className="py-2">ホームページ</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {(foods || []).map((food) => (
              <tr className="border-b border-black/5 align-top" key={food.id}>
                <td className="py-3 pr-4">
                  <span className="font-medium">{food.spot_title}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">/{food.spot_slug}</span>
                </td>
                <td className="py-3 pr-4 font-medium">{food.name}</td>
                <td className="py-3 pr-4">{food.rating ?? "—"}</td>
                <td className="py-3 pr-4">
                  {food.website_url ? (
                    <a className="text-blue-700 underline hover:text-blue-900" href={food.website_url} rel="noreferrer" target="_blank">
                      設定済み
                    </a>
                  ) : (
                    <span className="text-zinc-400">未設定</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link className="text-xs underline hover:text-zinc-600" href={`/admin/foods/${food.id}`}>
                      編集
                    </Link>
                    <DeleteFoodForm id={food.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
