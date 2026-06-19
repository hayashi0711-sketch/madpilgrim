import { createSpotAction } from "@/app/admin/actions";
import { SpotForm } from "@/components/admin/SpotForm";

export default function NewSpotPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">作品カードを追加</h1>
      <SpotForm action={createSpotAction} submitLabel="作成する" />
    </div>
  );
}
