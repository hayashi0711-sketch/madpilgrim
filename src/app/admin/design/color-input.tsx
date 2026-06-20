"use client";

import { useState } from "react";

export function DesignTokenColorInput({
  id,
  name,
  value
}: {
  id: string;
  name: string;
  value: string;
}) {
  const [currentValue, setCurrentValue] = useState(value);

  return (
    <div className="mt-2 flex items-center gap-3">
      <input
        className="h-10 w-16 cursor-pointer rounded border border-black/15 bg-white p-1"
        id={id}
        name={name}
        onChange={(event) => setCurrentValue(event.target.value)}
        type="color"
        value={currentValue}
      />
      <span className="font-mono text-sm uppercase">{currentValue}</span>
    </div>
  );
}
