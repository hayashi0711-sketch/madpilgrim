import { notFound } from "next/navigation";
import { updateSpotAction } from "@/app/admin/actions";
import { SpotForm } from "@/components/admin/SpotForm";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function EditSpotPage({
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

  const { data: spot, error } = await supabase.from("admin_spots").select("*").eq("id", id).maybeSingle();
  if (error) {
    return (
      <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        読み込みに失敗しました: {error.message}
      </p>
    );
  }
  if (!spot) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">作品カードを編集</h1>
      {actionError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          保存に失敗しました: {actionError}
        </p>
      ) : null}
      <SpotForm action={updateSpotAction} initial={spot} spotId={id} submitLabel="保存する" />
    </div>
  );
}
