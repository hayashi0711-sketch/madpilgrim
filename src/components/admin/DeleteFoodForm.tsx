"use client";

import { deleteFoodAction } from "@/app/admin/actions";

const DELETE_CONFIRM_MESSAGE = "この店舗情報を削除しますか？";

export function DeleteFoodForm({ id }: { id: string }) {
  return (
    <form
      action={deleteFoodAction}
      onSubmit={(event) => {
        if (!window.confirm(DELETE_CONFIRM_MESSAGE)) event.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={id} />
      <button className="text-xs text-red-600 underline hover:text-red-800" type="submit">
        削除
      </button>
    </form>
  );
}
