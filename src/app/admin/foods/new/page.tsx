import { createFoodAction } from "@/app/admin/actions";
import { FoodForm } from "@/components/admin/FoodForm";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function NewFoodPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: actionError } = await searchParams;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return (
      <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Supabase admin client is not configured
      </p>
    );
  }

  const { data: spots, error } = await supabase
    .from("admin_spots")
    .select("id, title")
    .order("title", { ascending: true });

  if (error) {
    return (
      <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        読み込みに失敗しました: {error.message}
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">店舗情報を追加</h1>
      {actionError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          保存に失敗しました: {actionError}
        </p>
      ) : null}
      <FoodForm action={createFoodAction} spots={spots ?? []} submitLabel="作成する" />
    </div>
  );
}
