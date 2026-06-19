import Link from "next/link";
import { toggleFeaturedAction } from "@/app/admin/actions";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function AdminSpotsPage() {
  const supabase = getSupabaseAdminClient();
  const { data: spots, error } = supabase
    ? await supabase
        .from("spots")
        .select("id, slug, title, category, status, is_featured")
        .order("created_at", { ascending: false })
    : { data: null, error: "Supabase admin client is not configured" };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">スポット管理</h1>
        <Link className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800" href="/admin/spots/new">
          + 新規追加
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          {typeof error === "string" ? error : error.message}
        </p>
      ) : null}

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-zinc-500">
            <th className="py-2">作品名</th>
            <th className="py-2">カテゴリ</th>
            <th className="py-2">状態</th>
            <th className="py-2">おすすめ表示</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {(spots || []).map((spot) => (
            <tr className="border-b border-black/5" key={spot.id}>
              <td className="py-2.5">{spot.title}</td>
              <td className="py-2.5">{spot.category}</td>
              <td className="py-2.5">{spot.status}</td>
              <td className="py-2.5">
                <form action={toggleFeaturedAction} className="flex items-center gap-2">
                  <input name="id" type="hidden" value={spot.id} />
                  <input defaultChecked={Boolean(spot.is_featured)} name="isFeatured" type="checkbox" />
                  <button className="text-xs text-zinc-500 underline hover:text-black" type="submit">更新</button>
                </form>
              </td>
              <td className="py-2.5 text-right">
                <Link className="text-zinc-600 hover:text-black hover:underline" href={`/admin/spots/${spot.id}`}>
                  編集
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
