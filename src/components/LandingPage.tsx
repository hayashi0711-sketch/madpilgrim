import Link from "next/link";
import { categoryIconSrc } from "@/lib/category-icons";
import type { LandingCopy } from "@/lib/site-copy";
import type { Locale, NearbyFood, Spot, SpotCategory } from "@/types/mad-pilgrim";

const fallbackImages: Record<SpotCategory, string> = {
  drama: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=88",
  movie: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85",
  anime: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=85",
  mv: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85",
  cm: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=85",
  manga: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200&q=85"
};

const categoryCodes: Record<SpotCategory, string> = {
  drama: "DRAMA",
  movie: "MOVIE",
  anime: "ANIME",
  mv: "MV",
  cm: "CM",
  manga: "MANGA"
};

const HERO_IMAGE = "/images/mad-pilgrim-hero.png";

function mapboxStaticImage(spot: Spot, width = 1200, height = 525, zoom = 16): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !spot.lng || !spot.lat) return null;

  const marker = `pin-s+ff360b(${spot.lng},${spot.lat})`;
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${marker}/${spot.lng},${spot.lat},${zoom},24,50/${width}x${height}@2x?access_token=${token}`;
}

function spotImage(spot: Spot): string {
  return fallbackImages[spot.category] || mapboxStaticImage(spot) || HERO_IMAGE;
}

export function BrandMark({ className = "landing-brand-mark" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="42" height="42" rx="2" />
      <path d="M12 34V14h10.5C31.1 14 36 17.8 36 24s-4.9 10-13.5 10H12Z" />
      <circle cx="24" cy="24" r="4" />
      <path d="M24 4v7M24 37v7M4 24h7M37 24h7" />
    </svg>
  );
}

function pickHighlights(spots: Spot[]): Spot[] {
  const featured = spots.filter((spot) => spot.isFeatured);
  if (featured.length) return featured.slice(0, 3);

  const picked: Spot[] = [];
  const usedCategories = new Set<SpotCategory>();

  for (const spot of spots) {
    if (!usedCategories.has(spot.category)) {
      picked.push(spot);
      usedCategories.add(spot.category);
    }
    if (picked.length === 3) break;
  }

  for (const spot of spots) {
    if (picked.length === 3) break;
    if (!picked.some((item) => item.id === spot.id)) picked.push(spot);
  }

  return picked;
}

export function LandingPage({
  copy,
  locale,
  spots,
  foodsBySlug
}: {
  copy: LandingCopy;
  locale: Locale;
  spots: Spot[];
  foodsBySlug: Record<string, NearbyFood[]>;
}) {
  const highlights = pickHighlights(spots);
  const heroSpot = highlights[0] || spots[0];
  const workCount = new Set(spots.map((spot) => `${spot.title.ja}::${spot.title.en}`)).size;
  const foodCount = Object.values(foodsBySlug).reduce((total, foods) => total + foods.length, 0);
  const altLocale = locale === "ja" ? "en" : "ja";

  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <Link className="landing-wordmark" href={`/${locale}`} aria-label="MAD Pilgrim home">
          <BrandMark className="landing-brand-mark" />
          <span className="landing-brand-name">
            <strong>MAD</strong>
            <span>Pilgrim</span>
          </span>
        </Link>
        <div className="landing-nav-issue">
          <span>SCENE / SERVE</span>
          <small>ISSUE 001 — TOKYO</small>
        </div>
        <nav aria-label={copy.navigation}>
          <a href="#highlights">{copy.highlights}</a>
          <a href="#how-it-works">{copy.howItWorks}</a>
          <a href="#discover">{copy.explore}</a>
          <Link href={`/${altLocale}`}>{altLocale.toUpperCase()}</Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-kicker">
              <span>{copy.kicker}</span>
              <span>{String(spots.length).padStart(3, "0")} VERIFIED PLACES</span>
            </div>
            <h1>
              {copy.titleLine1}
              <em>{copy.titleLine2}</em>
            </h1>
            <p>{copy.intro}</p>
            <div className="landing-hero-actions">
              <a className="landing-button landing-button-primary" href="#discover">
                {copy.primaryCta}<span>↓</span>
              </a>
              {heroSpot ? (
                <Link className="landing-button landing-button-secondary" href={`/${locale}/spots/${heroSpot.slug}`}>
                  {copy.secondaryCta}<span>↗</span>
                </Link>
              ) : null}
            </div>
          </div>

          {heroSpot ? (
            <div className="landing-hero-visual">
              <img
                src={HERO_IMAGE}
                alt={locale === "ja"
                  ? "夜の街を望むカフェテーブルに、料理、旅行鞄、フィルムが並ぶシネマティックな旅のイメージ"
                  : "A cinematic travel scene with food, a travel bag, and film on a café table overlooking a city at night"}
                decoding="async"
                fetchPriority="high"
              />
              <span className="landing-vertical-type">TRAVEL THROUGH THE SCENE</span>
            </div>
          ) : null}

          <div className="landing-stats" aria-label={copy.currentArchive}>
            <div><strong>{String(workCount).padStart(2, "0")}</strong><span>{copy.works}</span></div>
            <div><strong>{String(spots.length).padStart(2, "0")}</strong><span>{copy.places}</span></div>
            <div><strong>{String(foodCount).padStart(2, "0")}</strong><span>{copy.foodExperiences}</span></div>
            <p>{copy.archiveNote}</p>
          </div>
        </section>

        <section className="landing-manifesto">
          <p>{copy.manifestoLead}</p>
          <h2>{copy.manifesto}</h2>
          <span>{copy.manifestoNote}</span>
        </section>

        <section className="landing-highlights" id="highlights">
          <div className="landing-section-heading">
            <div>
              <span>01 / EDITORIAL PICKS</span>
              <h2>{copy.highlightsTitle}</h2>
            </div>
            <p>{copy.highlightsIntro}</p>
          </div>

          <div className="landing-highlight-grid">
            {highlights.map((spot, index) => {
              const foods = foodsBySlug[spot.slug] || [];
              return (
                <Link className="landing-story-card" data-category={spot.category} href={`/${locale}/spots/${spot.slug}`} key={spot.id}>
                  <div className="landing-story-image">
                    <img
                      src={spotImage(spot)}
                      alt={`${spot.spotName[locale]}のロケーション画像`}
                      decoding="async"
                      loading="lazy"
                    />
                    <span className="landing-story-number">{String(index + 1).padStart(2, "0")}</span>
                    {categoryIconSrc(spot.category) ? (
                      <img
                        alt={categoryCodes[spot.category]}
                        className="landing-story-category-icon"
                        src={categoryIconSrc(spot.category)!}
                      />
                    ) : (
                      <span className="landing-story-category">{categoryCodes[spot.category]}</span>
                    )}
                    <span className="landing-story-location">⌖ {spot.city || spot.prefecture}</span>
                    <span className="landing-story-visual-note">LOCATION MOOD / EDITORIAL IMAGE</span>
                    {foods.length ? (
                      <span className="landing-story-food">FOOD × {foods.length}</span>
                    ) : null}
                  </div>
                  <div className="landing-story-meta">
                    <span>WORK / {spot.releaseYear || "—"}</span>
                    <span>{Math.round(spot.confidenceScore * 100)}% MATCH</span>
                  </div>
                  <div className="landing-story-title">
                    <small>{locale === "ja" ? "作品名" : "TITLE"}</small>
                    <h3>{spot.title[locale]}</h3>
                  </div>
                  <p>{spot.spotName[locale]}</p>
                  <div className="landing-story-footer">
                    <span>{foods.length ? `${foods.length} ${copy.foodLinks}` : copy.locationOnly}</span>
                    <b>{copy.openStory} ↗</b>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="landing-method" id="how-it-works">
          <div className="landing-section-heading landing-section-heading-dark">
            <div>
              <span>02 / SCENE TO STREET</span>
              <h2>{copy.methodTitle}</h2>
            </div>
            <p>{copy.methodIntro}</p>
          </div>
          <div className="landing-method-grid">
            {copy.steps.map((step, index) => (
              <article key={step.title}>
                <span>0{index + 1}</span>
                <small>{step.label}</small>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
          <div className="landing-trust-strip">
            <span>RELATION TYPE</span>
            <span>VERIFICATION STATUS</span>
            <span>EVIDENCE SOURCE</span>
            <span>LAST CHECKED</span>
            <b>{copy.trustNote}</b>
          </div>
        </section>

        <section className="landing-discover-intro">
          <span>03 / LOCATION RECEIPT</span>
          <h2>{copy.discoverTitle}</h2>
          <p>{copy.discoverIntro}</p>
          <a href="#discover">{copy.openExplorer} ↓</a>
        </section>
      </main>
    </div>
  );
}
