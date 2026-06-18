import { LocationReceiptDashboard } from "@/components/LocationReceiptDashboard";
import { getLocale } from "@/lib/i18n";
import { listNearbyFoodsForSpots, listSpots } from "@/lib/spots-adapter";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const spots = await listSpots();
  const foodsBySlug = await listNearbyFoodsForSpots(spots.map((s) => s.slug));

  return <LocationReceiptDashboard foodsBySlug={foodsBySlug} locale={locale} spots={spots} />;
}
