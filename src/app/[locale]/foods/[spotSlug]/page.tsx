import Link from "next/link";
import { notFound } from "next/navigation";
import { FoodCard } from "@/components/FoodCard";
import { getLocale, ui } from "@/lib/i18n";
import { listNearbyFoods, readSpot } from "@/lib/spots-adapter";

export default async function FoodsPage({
  params
}: {
  params: Promise<{ locale: string; spotSlug: string }>;
}) {
  const { locale: localeParam, spotSlug: rawSpotSlug } = await params;
  const locale = getLocale(localeParam);
  let spotSlug = rawSpotSlug;
  try {
    spotSlug = decodeURIComponent(rawSpotSlug);
  } catch {}
  const spot = await readSpot(spotSlug);
  if (!spot) notFound();
  const foods = await listNearbyFoods(spotSlug);

  return (
    <div className="min-h-screen bg-mist">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
        <Link className="text-sm font-semibold text-shrine hover:underline" href={`/${locale}/spots/${spotSlug}`}>
          ← {spot.spotName[locale]}
        </Link>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{ui[locale].food}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-700 sm:text-base sm:leading-8">{ui[locale].foodsIntro}</p>
        <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
