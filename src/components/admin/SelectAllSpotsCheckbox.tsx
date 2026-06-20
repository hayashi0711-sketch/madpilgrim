"use client";

export function SelectAllSpotsCheckbox() {
  return (
    <input
      aria-label="すべて選択"
      onChange={(event) => {
        const checked = event.currentTarget.checked;
        document.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((checkbox) => {
          checkbox.checked = checked;
        });
      }}
      type="checkbox"
    />
  );
}
