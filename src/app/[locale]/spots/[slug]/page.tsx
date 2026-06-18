import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = getLocale(localeParam);
  const spot = await readSpot(slug);
  if (!spot) return {};

  const altLocale = locale === "ja" ? "en" : "ja";
  const canonicalUrl = `${BASE_URL}/${locale}/spots/${slug}`;

  return {
    title: `${spot.seoTitle[locale]} | MAD Pilgrim`,
    description: spot.description[locale],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "ja": `${BASE_URL}/ja/spots/${slug}`,
        "en": `${BASE_URL}/en/spots/${slug}`,
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
  const { locale: localeParam, slug } = await params;
  const locale = getLocale(localeParam);
  const spot = await readSpot(slug);
  if (!spot) notFound();

  const foods = await listNearbyFoods(slug);
  const altLocale = locale === "ja" ? "en" : "ja";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: spot.spotName[locale],
    description: spot.description[locale],
    url: `${BASE_URL}/${locale}/spots/${slug}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.lat,
      longitude: spot.lng
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "work", value: spot.title[locale] },
      { "@type": "PropertyValue", name: "sceneTimestamp", value: spot.sceneTimestamp[locale] },
      { "@type": "PropertyValue", name: "confidenceScore", value: spot.confidenceScore },
      ...(spot.broadcaster ? [{ "@type": "PropertyValue", name: "broadcaster", value: spot.broadcaster }] : []),
      ...(spot.releaseYear ? [{ "@type": "PropertyValue", name: "releaseYear", value: spot.releaseYear }] : [])
    ],
    touristType: "Screen tourism / Filming location"
  };

  const sceneNum = spot.sceneNumber
    ? `#${/^\d+$/.test(spot.sceneNumber) ? spot.sceneNumber.padStart(2, "0") : spot.sceneNumber}`
    : null;

  const categoryLabel: Record<string, Record<string, string>> = {
    ja: { anime: "アニメ", drama: "ドラマ", movie: "映画", mv: "MV", cm: "CM" },
    en: { anime: "ANIME", drama: "DRAMA", movie: "MOVIE", mv: "MV", cm: "CM" }
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} type="application/ld+json" />

      <div className="receipt-shell" style={{ gridTemplateRows: "72px minmax(0,1fr) 56px" }}>

        {/* ── ヘッダー ── */}
        <header className="receipt-header" style={{ gridTemplateColumns: "180px 220px 1fr 160px" }}>
          <Link className="receipt-brand" href={`/${locale}`} style={{ fontSize: 28 }}>
            MAD <span>Pilgrim</span>
          </Link>
          <div className="receipt-subbrand">
            <strong>SCENE RECEIPT</strong>
            <span>{locale === "ja" ? "映像ロケ地台帳" : "FILMING LOCATION RECORD"}</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: 28, letterSpacing: 2, padding: "12px 26px" }}>
            {spot.spotName[locale].toUpperCase()}
          </h1>
          <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
            <Link
              href={`/${altLocale}/spots/${slug}`}
              style={{ fontFamily: "monospace", fontSize: 10, color: "#ff360b", textDecoration: "none" }}
            >
              {altLocale.toUpperCase()} VERSION →
            </Link>
            <Link
              href={`/${locale}`}
              style={{ fontFamily: "monospace", fontSize: 10, color: "#555", textDecoration: "none" }}
            >
              ← {locale === "ja" ? "一覧へ戻る" : "BACK TO LIST"}
            </Link>
          </div>
        </header>

        {/* ── ワークスペース ── */}
        <div className="receipt-workspace" style={{ gridTemplateColumns: "30fr 38fr 32fr" }}>

          {/* 左: シーン詳細 */}
          <aside className="receipt-scenes">
            <div className="receipt-blackbar">
              <strong>{locale === "ja" ? "作品情報" : "WORK INFO"}</strong>
              <span style={{ color: "#ff360b", fontFamily: "monospace", fontSize: 10 }}>
                {categoryLabel[locale][spot.category]}
              </span>
            </div>

            <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* タイトルブロック */}
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#ff360b", marginBottom: 4 }}>WORK TITLE</div>
                <div style={{ fontFamily: "Impact, 'Arial Narrow', sans-serif", fontSize: 32, lineHeight: 1.1, letterSpacing: 1 }}>
                  {spot.title[locale]}
                </div>
                {(spot.releaseYear || spot.broadcaster) && (
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", marginTop: 4 }}>
                    {spot.releaseYear}{spot.broadcaster ? ` / ${spot.broadcaster}` : ""}
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px dotted #aaa", paddingTop: 10 }}>
                <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {sceneNum && (
                    <div style={{ display: "grid", gridTemplateColumns: "88px 1fr" }}>
                      <dt style={{ fontFamily: "monospace", fontSize: 9, color: "#888", paddingTop: 2 }}>SCENE NO.</dt>
                      <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 16, fontWeight: "bold" }}>{sceneNum}</dd>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "88px 1fr" }}>
                    <dt style={{ fontFamily: "monospace", fontSize: 9, color: "#888", paddingTop: 2 }}>TIMESTAMP</dt>
                    <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 14 }}>{spot.sceneTimestamp[locale]}</dd>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "88px 1fr" }}>
                    <dt style={{ fontFamily: "monospace", fontSize: 9, color: "#888", paddingTop: 2 }}>PLACE</dt>
                    <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 13 }}>{spot.spotName[locale]}</dd>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "88px 1fr" }}>
                    <dt style={{ fontFamily: "monospace", fontSize: 9, color: "#888", paddingTop: 2 }}>MATCH RATE</dt>
                    <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 18, fontWeight: "bold", color: "#ff360b" }}>
                      {Math.round(spot.confidenceScore * 100)}%
                    </dd>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "88px 1fr" }}>
                    <dt style={{ fontFamily: "monospace", fontSize: 9, color: "#888", paddingTop: 2 }}>SOURCE</dt>
                    <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 11 }}>{spot.sourceType?.toUpperCase()}</dd>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "88px 1fr" }}>
                    <dt style={{ fontFamily: "monospace", fontSize: 9, color: "#888", paddingTop: 2 }}>STATUS</dt>
                    <dd style={{ margin: 0 }}>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        fontSize: 9,
                        fontFamily: "monospace",
                        background: spot.status === "approved" ? "#239857" : "#888",
                        color: "white",
                        borderRadius: 2
                      }}>
                        {spot.status === "approved" ? (locale === "ja" ? "検証済み" : "VERIFIED") : "AI REVIEW"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div style={{ borderTop: "1px dotted #aaa", paddingTop: 10 }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#888", marginBottom: 6 }}>VISIT TIPS</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: "#333" }}>{spot.visitTips[locale]}</p>
              </div>

              <div style={{ borderTop: "1px dotted #aaa", paddingTop: 10 }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#888", marginBottom: 6 }}>DESCRIPTION</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: "#333" }}>{spot.description[locale]}</p>
              </div>
            </div>
          </aside>

          {/* 中央: 地図プレースホルダー */}
          <section className="receipt-map">
            <div className="receipt-blackbar">
              <strong>{locale === "ja" ? "撮影場所" : "FILMING LOCATION"} <small>MAP</small></strong>
              <span style={{ fontFamily: "monospace", fontSize: 10 }}>
                {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
              </span>
            </div>
            <div className="receipt-map-canvas">
              <div className="receipt-map-fallback" aria-label="Location map">
                <svg viewBox="0 0 520 790" role="img" aria-label={spot.spotName[locale]}>
                  <defs>
                    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
                      <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#d7d7d2" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="520" height="790" fill="#f4f4f1" />
                  <rect width="520" height="790" fill="url(#grid)" opacity=".75" />
                  <path d="M0 195 C110 174 185 210 265 183 S420 108 520 128" fill="none" stroke="#c7c8c5" strokeWidth="8" />
                  <path d="M80 0 C113 130 82 230 126 334 S183 532 164 790" fill="none" stroke="#c7c8c5" strokeWidth="8" />
                  <path d="M230 0 C218 154 248 251 229 375 S202 635 255 790" fill="none" stroke="#c7c8c5" strokeWidth="5" />
                  <path d="M0 465 C117 430 252 465 355 430 S455 360 520 374" fill="none" stroke="#c7c8c5" strokeWidth="5" />
                  <path d="M390 0 C370 130 387 236 420 340 S463 558 445 790" fill="none" stroke="#969996" strokeWidth="4" strokeDasharray="2 4" />
                  {/* Single focused pin */}
                  <g>
                    <circle cx="260" cy="395" r="20" fill="white" stroke="#080808" strokeWidth="2" />
                    <path d="M245 379h30v24l-15 16-15-16z" fill="#ff360b" stroke="#fff" strokeWidth="2" />
                    <text x="260" y="396" fill="#fff" textAnchor="middle" style={{ font: "11px monospace", fontWeight: 700 }}>
                      {sceneNum ?? "●"}
                    </text>
                  </g>
                  <text x="42" y="62" style={{ font: "16px 'Yu Gothic', sans-serif", fill: "#292929" }}>
                    {spot.city || spot.prefecture}
                  </text>
                  <g fill="none" stroke="#111" strokeWidth="1">
                    <path d="M16 760v8h64v-8" />
                    <text x="16" y="752" fill="#111" stroke="none" style={{ font: "10px monospace" }}>500 m</text>
                  </g>
                </svg>
              </div>
            </div>
          </section>

          {/* 右: フード台帳 */}
          <aside className="receipt-food">
            <div className="receipt-blackbar">
              <strong>{locale === "ja" ? "作品に出た味" : "FOOD ON SCREEN"}</strong>
              <Link
                href={`/${locale}/foods/${slug}`}
                style={{ fontFamily: "monospace", fontSize: 10, color: "#aaa", textDecoration: "none" }}
              >
                {locale === "ja" ? "すべて見る →" : "VIEW ALL →"}
              </Link>
            </div>
            <div className="receipt-food-kicker">SCREEN × FOOD LEDGER</div>

            {foods.length > 0 ? (
              <>
                <div className="receipt-food-image">
                  <img
                    alt={foods[0].name}
                    height="245"
                    src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88"
                    width="640"
                  />
                  <span>AVAILABLE NOW</span>
                  <b>MATCH 100%</b>
                </div>
                <div className="receipt-dossier">
                  <div className="receipt-scene-link">
                    <div>
                      <small>SCENE LINK</small>
                      <strong>{spot.title[locale]} <span>{sceneNum}</span></strong>
                      <b>{spot.releaseYear}{spot.broadcaster ? ` / ${spot.broadcaster}` : ""}</b>
                      <p>{foods[0].description[locale]}</p>
                    </div>
                  </div>
                  <dl>
                    <div><dt>VENUE</dt><dd><span><strong>{foods[0].name}</strong><small>{foods[0].address}</small></span></dd></div>
                    <div><dt>AVAILABLE</dt><dd><strong className="available">AVAILABLE NOW</strong></dd></div>
                    <div><dt>RATING</dt><dd><strong>{foods[0].rating.toFixed(1)}</strong></dd></div>
                    <div><dt>TAGS</dt><dd>{foods[0].tags.join(" / ")}</dd></div>
                  </dl>
                  <div className="receipt-actions">
                    <a href={foods[0].googleMapsUrl} rel="noreferrer" target="_blank">
                      {locale === "ja" ? "このお店へ行く" : "Visit this spot"}
                    </a>
                    <Link href={`/${locale}/foods/${slug}`}>
                      {locale === "ja" ? "周辺の食体験" : "Nearby food"}&nbsp;↗
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: "24px 14px", fontFamily: "monospace", fontSize: 11, color: "#888", lineHeight: 2 }}>
                <div style={{ marginBottom: 8, color: "#ff360b", fontSize: 9 }}>SCREEN FOOD</div>
                {locale === "ja"
                  ? "このロケ地に対応する食体験データはまだ登録されていません。"
                  : "No screen food data registered for this location yet."}
              </div>
            )}
          </aside>
        </div>

        {/* ── フッター ── */}
        <footer className="receipt-footer" style={{ gridTemplateColumns: "1.2fr 1fr 1fr 1.5fr 1fr" }}>
          <div><small>SPOT</small><strong style={{ fontSize: 12 }}>{spot.spotName[locale]}</strong></div>
          <div><small>WORK</small><strong style={{ fontSize: 12 }}>{spot.title[locale]}</strong></div>
          <div><small>MATCH RATE</small><strong>{Math.round(spot.confidenceScore * 100)}% <i /></strong></div>
          <div><small>COORDINATES</small><span>{spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}</span></div>
          <div className="receipt-barcode"><i /><span>MADP-{slug.toUpperCase().slice(0, 12)}</span></div>
        </footer>
      </div>
    </>
  );
}
