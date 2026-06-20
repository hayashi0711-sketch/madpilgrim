import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/LandingPage";
import { TrustIndicator } from "@/components/TrustIndicator";
import { toYoutubeEmbedUrl } from "@/lib/youtube";
import type { Locale, NearbyFood, Spot, SpotCategory } from "@/types/mad-pilgrim";

const categoryLabels: Record<Locale, Record<SpotCategory, string>> = {
  ja: { anime: "アニメ", drama: "ドラマ", movie: "映画", mv: "Music Video", cm: "CM", manga: "マンガ" },
  en: { anime: "ANIME", drama: "DRAMA", movie: "MOVIE", mv: "MUSIC VIDEO", cm: "CM", manga: "MANGA" }
};

function InfoRow({
  label,
  children,
  emphasis = false
}: {
  label: string;
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="spot-detail-info-row">
      <dt>{label}</dt>
      <dd className={emphasis ? "is-emphasis" : undefined}>{children}</dd>
    </div>
  );
}

function mapboxStaticImage(lng: number, lat: number): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !lng || !lat) return null;
  const marker = `pin-l+c2a14d(${lng},${lat})`;
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${marker}/${lng},${lat},15,0/780x790@2x?access_token=${token}`;
}

function TextSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="spot-detail-text-section">
      <h3>{label}</h3>
      <p>{children}</p>
    </section>
  );
}

export function SpotReceiptHeader({
  locale,
  slug,
  spotName
}: {
  locale: Locale;
  slug: string;
  spotName: string;
}) {
  const altLocale = locale === "ja" ? "en" : "ja";
  return (
    <header className="receipt-header spot-detail-header">
      <Link className="receipt-brand spot-detail-brand" href={`/${locale}`}>
        <BrandMark className="receipt-brand-mark" />
        <span className="receipt-brand-text">MAD <span>Pilgrim</span></span>
      </Link>
      <div className="receipt-subbrand">
        <strong>SCENE RECEIPT</strong>
        <span>{locale === "ja" ? "映像ロケ地台帳" : "FILMING LOCATION RECORD"}</span>
      </div>
      <h1>{spotName.toUpperCase()}</h1>
      <nav className="spot-detail-header-links" aria-label={locale === "ja" ? "詳細ページナビゲーション" : "Detail page navigation"}>
        <Link href={`/${altLocale}/spots/${slug}`}>{altLocale.toUpperCase()} VERSION →</Link>
        <Link href={`/${locale}`}>← {locale === "ja" ? "一覧へ戻る" : "BACK TO LIST"}</Link>
      </nav>
    </header>
  );
}

export function SpotWorkPanel({
  locale,
  sceneNumber,
  spot
}: {
  locale: Locale;
  sceneNumber: string | null;
  spot: Spot;
}) {
  return (
    <aside className="receipt-scenes spot-detail-work">
      <div className="receipt-blackbar">
        <strong>{locale === "ja" ? "作品情報" : "WORK INFO"}</strong>
        <span className="spot-detail-category">{categoryLabels[locale][spot.category]}</span>
      </div>
      <div className="spot-detail-work-body">
        <section className="spot-detail-title-block">
          <small>WORK TITLE</small>
          <h2>{spot.title[locale]}</h2>
          {(spot.releaseYear || spot.broadcaster) && (
            <p>{spot.releaseYear}{spot.broadcaster ? ` / ${spot.broadcaster}` : ""}</p>
          )}
        </section>
        <dl className="spot-detail-info-list">
          {sceneNumber ? <InfoRow label="SCENE NO.">{sceneNumber}</InfoRow> : null}
          <InfoRow label="TIMESTAMP">{spot.sceneTimestamp[locale]}</InfoRow>
          <InfoRow label="PLACE">{spot.spotName[locale]}</InfoRow>
          <InfoRow label="MATCH RATE" emphasis>
            <TrustIndicator
              kind="match"
              label="MATCH"
              title={locale === "ja" ? "作品内の場面と実在地点が一致する信頼度です。" : "Confidence that the scene matches this real-world location."}
            >
              {Math.round(spot.confidenceScore * 100)}%
            </TrustIndicator>
          </InfoRow>
          <InfoRow label="SOURCE">
            <TrustIndicator
              kind="source"
              label={spot.sourceType.toUpperCase()}
              title={locale === "ja" ? "ロケ地情報の根拠として登録された出典種別です。" : "The evidence-source type recorded for this location."}
            />
          </InfoRow>
          <InfoRow label="STATUS">
            <TrustIndicator
              kind="verified"
              label={spot.status === "approved" ? (locale === "ja" ? "検証済み" : "VERIFIED") : "AI REVIEW"}
              title={spot.status === "approved"
                ? (locale === "ja" ? "出典を確認し、人による承認を経た情報です。" : "Evidence checked and approved by a human reviewer.")
                : (locale === "ja" ? "AI候補として確認待ちの情報です。" : "AI-suggested information awaiting human review.")}
            />
          </InfoRow>
        </dl>
        <TextSection label="VISIT TIPS">{spot.visitTips[locale]}</TextSection>
        <TextSection label="DESCRIPTION">{spot.description[locale]}</TextSection>
        <SpotYoutubeSection locale={locale} spot={spot} />
      </div>
    </aside>
  );
}

function SpotYoutubeSection({ locale, spot }: { locale: Locale; spot: Spot }) {
  if (!spot.youtubeUrl) return null;
  const embedUrl = toYoutubeEmbedUrl(spot.youtubeUrl);
  if (!embedUrl) return null;

  const channelLabel = spot.youtubeChannelName || (locale === "ja" ? "公式チャンネル" : "Official Channel");

  return (
    <section className="spot-detail-text-section spot-detail-youtube">
      <h3>{locale === "ja" ? "公式動画" : "OFFICIAL VIDEO"}</h3>
      <div className="spot-detail-youtube-frame">
        <iframe
          src={embedUrl}
          title={spot.title[locale]}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="spot-detail-youtube-credit">
        {locale === "ja" ? "出典：" : "Source: "}
        <a href={spot.youtubeUrl} rel="noreferrer" target="_blank">
          {channelLabel}{locale === "ja" ? "（リンク）" : " (link)"}
        </a>
      </p>
    </section>
  );
}

export function SpotMapPanel({
  locale,
  sceneNumber,
  spot
}: {
  locale: Locale;
  sceneNumber: string | null;
  spot: Spot;
}) {
  return (
    <section className="receipt-map spot-detail-map">
      <div className="receipt-blackbar">
        <strong>{locale === "ja" ? "撮影場所" : "FILMING LOCATION"} <small>MAP</small></strong>
        <span>{spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}</span>
      </div>
      <div className="receipt-map-canvas">
        {mapboxStaticImage(spot.lng, spot.lat) ? (
          <img
            alt={spot.spotName[locale]}
            className="receipt-map-static"
            height="790"
            src={mapboxStaticImage(spot.lng, spot.lat)!}
            width="780"
          />
        ) : (
        <div className="receipt-map-fallback" aria-label="Location map">
          <svg viewBox="0 0 520 790" role="img" aria-label={spot.spotName[locale]}>
            <defs>
              <pattern id={`spot-grid-${spot.id}`} width="34" height="34" patternUnits="userSpaceOnUse">
                <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#d7d7d2" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="520" height="790" fill="#f4f4f1" />
            <rect width="520" height="790" fill={`url(#spot-grid-${spot.id})`} opacity=".75" />
            <path d="M0 195 C110 174 185 210 265 183 S420 108 520 128" fill="none" stroke="#c7c8c5" strokeWidth="8" />
            <path d="M80 0 C113 130 82 230 126 334 S183 532 164 790" fill="none" stroke="#c7c8c5" strokeWidth="8" />
            <path d="M230 0 C218 154 248 251 229 375 S202 635 255 790" fill="none" stroke="#c7c8c5" strokeWidth="5" />
            <path d="M0 465 C117 430 252 465 355 430 S455 360 520 374" fill="none" stroke="#c7c8c5" strokeWidth="5" />
            <path d="M390 0 C370 130 387 236 420 340 S463 558 445 790" fill="none" stroke="#969996" strokeWidth="4" strokeDasharray="2 4" />
            <g>
              <circle cx="260" cy="395" r="20" fill="white" stroke="var(--color-navy)" strokeWidth="2" />
              <path d="M245 379h30v24l-15 16-15-16z" fill="var(--color-signal)" stroke="#fff" strokeWidth="2" />
              <text x="260" y="396" fill="#fff" textAnchor="middle" className="spot-detail-map-label">{sceneNumber ?? "●"}</text>
            </g>
            <text x="42" y="62" className="spot-detail-map-city">{spot.city || spot.prefecture}</text>
            <g fill="none" stroke="#111" strokeWidth="1">
              <path d="M16 760v8h64v-8" />
              <text x="16" y="752" fill="#111" stroke="none" className="spot-detail-map-scale">500 m</text>
            </g>
          </svg>
        </div>
        )}
      </div>
    </section>
  );
}

export function SpotFoodPanel({
  food,
  locale,
  sceneNumber,
  slug,
  spot
}: {
  food: NearbyFood | null;
  locale: Locale;
  sceneNumber: string | null;
  slug: string;
  spot: Spot;
}) {
  const foodImageUrl = spot.foodImageType
    ? `/images/food-types/${spot.foodImageType}.jpg`
    : "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88";

  return (
    <aside className="receipt-food spot-detail-food">
      <div className="receipt-blackbar">
        <strong>{locale === "ja" ? "作品に出た味" : "FOOD ON SCREEN"}</strong>
        <span className="receipt-blackbar-end">
          <span className={`receipt-category-tag receipt-category-tag-${spot.category}`}>
            {categoryLabels[locale][spot.category]}
          </span>
          <Link className="spot-detail-view-all" href={`/${locale}/foods/${slug}`}>
            {locale === "ja" ? "すべて見る →" : "VIEW ALL →"}
          </Link>
        </span>
      </div>
      <div className="receipt-food-kicker">SCREEN × FOOD LEDGER</div>
      {food ? (
        <>
          <div className="receipt-food-image">
            <img
              alt={food.name}
              height="245"
              src={foodImageUrl}
              width="640"
            />
            <span>AVAILABLE NOW</span>
            <b>MATCH 100%</b>
          </div>
          <div className="receipt-dossier">
            <div className="receipt-scene-link spot-detail-scene-link">
              <div>
                <small>SCENE LINK</small>
                <strong>{spot.title[locale]} <span>{sceneNumber}</span></strong>
                <b>{spot.releaseYear}{spot.broadcaster ? ` / ${spot.broadcaster}` : ""}</b>
                <p>{food.description[locale]}</p>
              </div>
            </div>
            <dl>
              <div><dt>おすすめ</dt><dd><strong>{food.dishName || food.name}</strong></dd></div>
              <div>
                <dt>店舗名</dt>
                <dd>
                  <span>
                    <strong>{food.name}</strong>
                    <small>{food.address}</small>
                  </span>
                </dd>
              </div>
              {food.websiteUrl ? (
                <div>
                  <dt>URL</dt>
                  <dd>
                    <a href={food.websiteUrl} rel="noreferrer" target="_blank">
                      {locale === "ja" ? "店舗ホームページ" : "Official website"}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div><dt>RATING</dt><dd><strong>{food.rating.toFixed(1)}</strong></dd></div>
              <div><dt>TAGS</dt><dd>{food.tags.join(" / ")}</dd></div>
            </dl>
            <div className="receipt-actions">
              <a href={food.googleMapsUrl} rel="noreferrer" target="_blank">{locale === "ja" ? "このお店へ行く" : "Visit this spot"}</a>
              <Link href={`/${locale}/foods/${slug}`}>{locale === "ja" ? "周辺の食体験" : "Nearby food"}&nbsp;↗</Link>
            </div>
          </div>
        </>
      ) : (
        <div className="spot-detail-empty-food">
          <small>SCREEN FOOD</small>
          {locale === "ja" ? "このロケ地に対応する食体験データはまだ登録されていません。" : "No screen food data registered for this location yet."}
        </div>
      )}
    </aside>
  );
}

export function SpotReceiptFooter({ locale, slug, spot }: { locale: Locale; slug: string; spot: Spot }) {
  return (
    <footer className="receipt-footer spot-detail-footer">
      <div><small>SPOT</small><strong>{spot.spotName[locale]}</strong></div>
      <div><small>WORK</small><strong>{spot.title[locale]}</strong></div>
      <div>
        <TrustIndicator
          kind="match"
          label="MATCH RATE"
          title={locale === "ja" ? "作品内の場面と実在地点が一致する信頼度です。" : "Confidence that the scene matches this real-world location."}
        >
          {Math.round(spot.confidenceScore * 100)}%
        </TrustIndicator>
      </div>
      <div><small>COORDINATES</small><span>{spot.lat.toFixed(5)}, {spot.lng.toFixed(5)}</span></div>
      <div className="receipt-barcode"><i /><span>MADP-{slug.toUpperCase().slice(0, 12)}</span></div>
    </footer>
  );
}
