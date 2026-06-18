import type { Locale, NearbyFood } from "@/types/mad-pilgrim";
import { ui } from "@/lib/i18n";

export function FoodCard({ food, locale }: { food: NearbyFood; locale: Locale }) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-ink">{food.name}</h3>
            {food.isSponsored ? (
              <span className="rounded bg-signal px-2 py-0.5 text-xs font-bold text-white">
                {ui[locale].sponsored}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-zinc-600">{food.category} / {"¥".repeat(food.priceLevel)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-mist px-3 py-1 text-sm font-semibold text-ink">★ {food.rating}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-700">{food.description[locale]}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {food.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
            {tag}
          </span>
        ))}
      </div>
      <a
        className="mt-4 inline-flex min-h-10 items-center rounded-md border border-black/15 px-4 py-2.5 text-sm font-semibold hover:border-shrine hover:text-shrine"
        href={food.googleMapsUrl}
        rel="noreferrer"
        target="_blank"
      >
        {ui[locale].openMap}
      </a>
    </article>
  );
}
