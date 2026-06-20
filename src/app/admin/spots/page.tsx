import Link from "next/link";
import { notFound } from "next/navigation";
import { updateSpotAction, updateSpotListFieldsAction } from "@/app/admin/actions";
import { BulkDeleteSpotsForm } from "@/components/admin/BulkDeleteSpotsForm";
import { DeleteSpotForm } from "@/components/admin/DeleteSpotForm";
import { SelectAllSpotsCheckbox } from "@/components/admin/SelectAllSpotsCheckbox";
import { SpotForm } from "@/components/admin/SpotForm";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const categories = [
  { value: "anime", label: "アニメ" },
  { value: "drama", label: "ドラマ" },
  { value: "movie", label: "映画" },
  { value: "mv", label: "Music Video" },
  { value: "cm", label: "CM" },
  { value: "manga", label: "マンガ" }
];

const statuses = [
  { value: "approved", label: "公開" },
  { value: "ai_suggested", label: "確認待ち" },
  { value: "hidden", label: "非公開" },
  { value: "unverified", label: "未検証" }
];

const inputClass = "w-full min-w-28 rounded-md border border-black/15 px-2 py-1.5 text-xs";

export default async function AdminSpotsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; deleted?: string; error?: string; saved?: string; edit?: string }>;
}) {
  const { category, deleted, error: actionError, saved, edit } = await searchParams;
  const selectedCategory =
    typeof category === "string" && categories.some((item) => item.value === category) ? category : "";
  const editId = typeof edit === "string" && edit ? edit : "";
  const supabase = getSupabaseAdminClient();
  let spots = null;
  let count = 0;
  let error: string | { message: string } | null = null;

  if (supabase) {
    let query = supabase
        .from("spots")
        .select(
          "id, slug, title, category, status, is_featured, broadcaster, youtube_url, youtube_channel_name",
          { count: "exact" }
        );
    if (selectedCategory) query = query.eq("category", selectedCategory);
    const result = await query.order("created_at", { ascending: false });
    spots = result.data;
    count = result.count ?? 0;
    error = result.error;
  } else {
    error = "Supabase admin client is not configured";
  }

  const primaryFoodBySpot: Record<string, { id: string; name: string; dish_name: string | null; website_url: string | null }> = {};
  if (supabase && spots && spots.length > 0) {
    const { data: foods } = await supabase
      .from("nearby_foods")
      .select("id, spot_id, name, dish_name, website_url, rating, is_sponsored, created_at")
      .in("spot_id", spots.map((spot) => spot.id))
      .order("is_sponsored", { ascending: false })
      .order("rating", { ascending: false })
      .order("created_at", { ascending: true });
    for (const food of foods || []) {
      if (!primaryFoodBySpot[food.spot_id]) primaryFoodBySpot[food.spot_id] = food;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let editSpot: any = null;
  let editError: string | null = null;
  if (editId && supabase) {
    const { data, error: editFetchError } = await supabase.from("admin_spots").select("*").eq("id", editId).maybeSingle();
    if (editFetchError) editError = editFetchError.message;
    else if (!data) notFound();
    else editSpot = data;
  }

  const baseParams = (extra: Record<string, string> = {}) => {
    const sp = new URLSearchParams(extra);
    if (selectedCategory) sp.set("category", selectedCategory);
    const qs = sp.toString();
    return qs ? `/admin/spots?${qs}` : "/admin/spots";
  };
  const editUrl = (id: string) => baseParams({ edit: id });
  const closeEditUrl = baseParams();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">スポット管理</h1>
        <Link className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800" href="/admin/spots/new">
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

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <form action="/admin/spots" className="flex items-end gap-2" method="get">
              <label className="block text-sm font-semibold">
                カテゴリ
                <select className="mt-1 block rounded-md border border-black/15 px-3 py-2 text-sm" defaultValue={selectedCategory} name="category">
                  <option value="">すべて</option>
                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <button className="rounded-md border border-black/15 px-3 py-2 text-sm hover:bg-zinc-50" type="submit">
                絞り込む
              </button>
            </form>
            <div className="flex items-center gap-4">
              <BulkDeleteSpotsForm returnCategory={selectedCategory} />
              <p className="text-sm font-semibold">合計{count}件</p>
            </div>
          </div>

          <div className="mt-4 max-h-[75vh] overflow-auto rounded-md border border-black/10">
          <table className="w-full min-w-[1240px] text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-black/10 bg-zinc-50 text-left text-zinc-500">
                <th className="py-2 pl-3"><SelectAllSpotsCheckbox /></th>
                <th className="py-2">作品名</th>
                <th className="py-2">状態</th>
                <th className="py-2">おすすめ表示</th>
                <th className="py-2">カテゴリ</th>
                <th className="py-2">放送局 / アーティスト</th>
                <th className="py-2">YouTube URL</th>
                <th className="py-2">チャンネル名</th>
                <th className="py-2">おすすめ（料理名）</th>
                <th className="py-2">店舗名</th>
                <th className="py-2">店舗URL</th>
                <th className="py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {(spots || []).map((spot) => {
                const formId = `spot-list-${spot.id}`;
                const primaryFood = primaryFoodBySpot[spot.id];
                return (
                <tr className="border-b border-black/5 align-top" key={spot.id}>
                  <td className="py-2.5 pl-3">
                    <input form="bulk-delete-spots-form" name="ids" type="checkbox" value={spot.id} />
                  </td>
                  <td className="min-w-44 py-2.5 pr-3 font-medium">
                    {spot.title}
                    <Link className="mt-1 block text-xs font-normal text-zinc-500 hover:text-black hover:underline" href={editUrl(spot.id)}>
                      詳細編集
                    </Link>
                  </td>
                  <td className="py-2.5 pr-2">
                    <select className={inputClass} defaultValue={spot.status} form={formId} name="status">
                      {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 pr-2 text-center">
                    <input defaultChecked={Boolean(spot.is_featured)} form={formId} name="is_featured" type="checkbox" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <select className={inputClass} defaultValue={spot.category} form={formId} name="category">
                      {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </td>
                  <td className="py-2.5 pr-2">
                    <input className={inputClass} defaultValue={spot.broadcaster ?? ""} form={formId} name="broadcaster" type="text" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input className={inputClass} defaultValue={spot.youtube_url ?? ""} form={formId} name="youtube_url" type="url" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input className={inputClass} defaultValue={spot.youtube_channel_name ?? ""} form={formId} name="youtube_channel_name" type="text" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input className={inputClass} defaultValue={primaryFood?.dish_name ?? ""} form={formId} name="food_dish_name" type="text" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input className={inputClass} defaultValue={primaryFood?.name ?? ""} form={formId} name="food_name" type="text" />
                  </td>
                  <td className="py-2.5 pr-2">
                    <input className={inputClass} defaultValue={primaryFood?.website_url ?? ""} form={formId} name="food_website_url" type="url" />
                  </td>
                  <td className="py-2.5">
                    <form action={updateSpotListFieldsAction} className="flex items-center gap-2" id={formId}>
                      <input name="id" type="hidden" value={spot.id} />
                      <input name="returnCategory" type="hidden" value={selectedCategory} />
                      <input name="food_id" type="hidden" value={primaryFood?.id ?? ""} />
                      <button className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800" type="submit">
                        更新
                      </button>
                    </form>
                    <DeleteSpotForm id={spot.id} returnCategory={selectedCategory} />
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          </div>
        </div>

        {editId ? (
          <aside className="sticky top-20 h-[calc(100vh-6rem)] w-full max-w-md shrink-0 overflow-y-auto rounded-md border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">作品カードを編集</h2>
              <Link className="text-sm text-zinc-500 hover:text-black" href={closeEditUrl}>
                閉じる ✕
              </Link>
            </div>
            {editError ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                読み込みに失敗しました: {editError}
              </p>
            ) : editSpot ? (
              <SpotForm
                action={updateSpotAction}
                extraHidden={{ returnCategory: selectedCategory }}
                initial={editSpot}
                spotId={editId}
                submitLabel="保存する"
              />
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
