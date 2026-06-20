"use client";

import { bulkDeleteSpotsAction } from "@/app/admin/actions";

const BULK_DELETE_CONFIRM_MESSAGE = "選択したスポットを削除しますか？関連する食事データも削除されます。";

export function BulkDeleteSpotsForm({ returnCategory }: { returnCategory: string }) {
  return (
    <form
      action={bulkDeleteSpotsAction}
      id="bulk-delete-spots-form"
      onSubmit={(event) => {
        const checked = document.querySelectorAll<HTMLInputElement>('input[name="ids"]:checked');
        if (checked.length === 0) {
          event.preventDefault();
          window.alert("削除するスポットを選択してください。");
          return;
        }
        if (!window.confirm(BULK_DELETE_CONFIRM_MESSAGE)) event.preventDefault();
      }}
    >
      <input name="returnCategory" type="hidden" value={returnCategory} />
      <button
        className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        type="submit"
      >
        選択した項目を一括削除
      </button>
    </form>
  );
}
