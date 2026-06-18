import type { Locale, SpotStatus } from "@/types/mad-pilgrim";
import { statusLabels } from "@/lib/i18n";

const statusStyle: Record<SpotStatus, string> = {
  approved: "bg-shrine text-white",
  ai_suggested: "bg-zinc-200 text-zinc-800",
  unverified: "bg-zinc-100 text-zinc-500",
  hidden: "bg-zinc-900 text-white"
};

export function SpotStatusPill({ status, locale }: { status: SpotStatus; locale: Locale }) {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[status]}`}>
      {statusLabels[locale][status]}
    </span>
  );
}
