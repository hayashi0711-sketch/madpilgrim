import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SpotFoodPanel,
  SpotMapPanel,
  SpotReceiptFooter,
  SpotReceiptHeader,
  SpotWorkPanel
} from "@/components/SpotDetail/SpotDetailReceipt";
import { spots } from "@/data/sample-spots";
import { getLocale } from "@/lib/i18n";
import { listNearbyFoods, readSpot } from "@/lib/spots-adapter";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const BASE_URL = "https://mad-pilgrim.vercel.app";

export function generateStaticParams() {
  return spots.flatMap((spot) => [
    { locale: "ja", slug: spot.slug },
    { locale: "en", slug: spot.slug }
  ]);
}

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug: rawSlug } = await params;
  const locale = getLocale(localeParam);
  const slug = decodeSlug(rawSlug);
  const spot = await readSpot(slug);
  if (!spot) return {};

  const canonicalUrl = `${BASE_URL}/${locale}/spots/${slug}`;
  return {
    title: `${spot.seoTitle[locale]} | MAD Pilgrim`,
    description: spot.description[locale],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ja: `${BASE_URL}/ja/spots/${slug}`,
        en: `${BASE_URL}/en/spots/${slug}`,
        "x-default": `${BASE_URL}/ja/spots/${slug}`
      }
    },
    openGraph: {
      title: spot.seoTitle[locale],
      description: spot.description[locale],
      type: "article",
      url: canonicalUrl,
      ...(spot.ogImageUrl ? { images: [{ url: spot.ogImageUrl, width: 1200, height: 630 }] } : {})
    },
    other: {
      "og:locale": locale === "ja" ? "ja_JP" : "en_US",
      "og:locale:alternate": locale === "ja" ? "en_US" : "ja_JP"
    }
  };
}

export default async function SpotPage({ params }: Props) {
  const { locale: localeParam, slug: rawSlug } = await params;
  const locale = getLocale(localeParam);
  const slug = decodeSlug(rawSlug);
  const spot = await readSpot(slug);
  if (!spot) notFound();

  const foods = await listNearbyFoods(slug);
  const sceneNumber = spot.sceneNumber
    ? `#${/^\d+$/.test(spot.sceneNumber) ? spot.sceneNumber.padStart(2, "0") : spot.sceneNumber}`
    : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: spot.spotName[locale],
    description: spot.description[locale],
    url: `${BASE_URL}/${locale}/spots/${slug}`,
    geo: { "@type": "GeoCoordinates", latitude: spot.lat, longitude: spot.lng },
    additionalProperty: [
      { "@type": "PropertyValue", name: "work", value: spot.title[locale] },
      { "@type": "PropertyValue", name: "sceneTimestamp", value: spot.sceneTimestamp[locale] },
      { "@type": "PropertyValue", name: "confidenceScore", value: spot.confidenceScore },
      ...(spot.broadcaster ? [{ "@type": "PropertyValue", name: "broadcaster", value: spot.broadcaster }] : []),
      ...(spot.releaseYear ? [{ "@type": "PropertyValue", name: "releaseYear", value: spot.releaseYear }] : [])
    ],
    touristType: "Screen tourism / Filming location"
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} type="application/ld+json" />
      <div className="receipt-shell spot-detail-shell">
        <SpotReceiptHeader locale={locale} slug={slug} spotName={spot.spotName[locale]} />
        <main className="receipt-workspace spot-detail-workspace">
          <SpotWorkPanel locale={locale} sceneNumber={sceneNumber} spot={spot} />
          <SpotMapPanel locale={locale} sceneNumber={sceneNumber} spot={spot} />
          <SpotFoodPanel food={foods[0] ?? null} locale={locale} sceneNumber={sceneNumber} slug={slug} spot={spot} />
        </main>
        <SpotReceiptFooter locale={locale} slug={slug} spot={spot} />
      </div>
    </>
  );
}
