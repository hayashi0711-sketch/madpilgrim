"use client";

import { deleteSpotAction } from "@/app/admin/actions";

const DELETE_CONFIRM_MESSAGE = "本当に削除しますか？関連する食事データも削除されます。";

export function DeleteSpotForm({
  id,
  returnCategory
}: {
  id: string;
  returnCategory: string;
}) {
  return (
    <form
      action={deleteSpotAction}
      className="mt-2"
      onSubmit={(event) => {
        if (!window.confirm(DELETE_CONFIRM_MESSAGE)) event.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={id} />
      <input name="returnCategory" type="hidden" value={returnCategory} />
      <button className="text-xs text-red-600 underline hover:text-red-800" type="submit">
        削除
      </button>
    </form>
  );
}
