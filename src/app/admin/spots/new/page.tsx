import { createSpotAction } from "@/app/admin/actions";
import { SpotForm } from "@/components/admin/SpotForm";

export default async function NewSpotPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold">作品カードを追加</h1>
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          保存に失敗しました: {error}
        </p>
      ) : null}
      <SpotForm action={createSpotAction} submitLabel="作成する" />
    </div>
  );
}
