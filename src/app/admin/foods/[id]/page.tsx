import { notFound } from "next/navigation";
import { updateFoodAction } from "@/app/admin/actions";
import { FoodForm } from "@/components/admin/FoodForm";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function EditFoodPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: actionError } = await searchParams;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return (
      <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Supabase admin client is not configured
      </p>
    );
  }

  const [{ data: food, error }, { data: spots, error: spotsError }] = await Promise.all([
    supabase.from("admin_nearby_foods").select("*").eq("id", id).maybeSingle(),
    supabase.from("admin_spots").select("id, title").order("title", { ascending: true })
  ]);

  if (error || spotsError) {
    return (
      <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        読み込みに失敗しました: {(error || spotsError)?.message}
      </p>
    );
  }
  if (!food) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">店舗情報を編集</h1>
      {actionError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          保存に失敗しました: {actionError}
        </p>
      ) : null}
      <FoodForm
        action={updateFoodAction}
        foodId={id}
        initial={food}
        spots={spots ?? []}
        submitLabel="保存する"
      />
    </div>
  );
}
