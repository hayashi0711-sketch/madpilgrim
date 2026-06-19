import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";
import { LocationReceiptDashboard } from "@/components/LocationReceiptDashboard";
import { getLocale, landingUi } from "@/lib/i18n";
import { listNearbyFoodsForSpots, listSpots } from "@/lib/spots-adapter";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const copy = landingUi[locale];
  const title = locale === "ja"
    ? "MAD Pilgrim | 映像ロケ地と作品につながる食体験"
    : "MAD Pilgrim | Filming Locations & Screen-to-Table";

  return {
    title,
    description: copy.intro,
    alternates: {
      canonical: `https://mad-pilgrim.vercel.app/${locale}`,
      languages: {
        ja: "https://mad-pilgrim.vercel.app/ja",
        en: "https://mad-pilgrim.vercel.app/en",
        "x-default": "https://mad-pilgrim.vercel.app/ja"
      }
    },
    openGraph: {
      title,
      description: copy.intro,
      type: "website",
      url: `https://mad-pilgrim.vercel.app/${locale}`
    }
  };
}

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const spots = await listSpots();
  const foodsBySlug = await listNearbyFoodsForSpots(spots.map((s) => s.slug));

  return (
    <>
      <LandingPage foodsBySlug={foodsBySlug} locale={locale} spots={spots} />
      <div id="discover" className="landing-dashboard-anchor">
        <LocationReceiptDashboard foodsBySlug={foodsBySlug} locale={locale} spots={spots} />
      </div>
    </>
  );
}
