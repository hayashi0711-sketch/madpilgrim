import { notFound } from "next/navigation";
import { updateSpotAction } from "@/app/admin/actions";
import { SpotForm } from "@/components/admin/SpotForm";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export default async function EditSpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client is not configured");

  const { data: spot } = await supabase.from("admin_spots").select("*").eq("id", id).maybeSingle();
  if (!spot) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">作品カードを編集</h1>
      <SpotForm action={updateSpotAction} initial={spot} spotId={id} submitLabel="保存する" />
    </div>
  );
}
