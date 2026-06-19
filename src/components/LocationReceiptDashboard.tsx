"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TrustIndicator } from "@/components/TrustIndicator";
import type { Locale, NearbyFood, Spot } from "@/types/mad-pilgrim";

function mapboxStatic(lng: number, lat: number, w: number, h: number, zoom = 13): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !lng || !lat) return null;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom},0/${w}x${h}?access_token=${token}`;
}

const FALLBACK_CARD = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=480&q=80";
const FALLBACK_HERO = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=88";

const categoryCode: Record<Spot["category"], string> = {
  anime: "ANIME",
  mv: "MV",
  drama: "DRAMA",
  movie: "MOVIE",
  cm: "CM",
  manga: "MANGA"
};

type DashboardView = "works" | "map" | "food";

export function LocationReceiptDashboard({
  spots,
  locale,
  foodsBySlug = {}
}: {
  spots: Spot[];
  locale: Locale;
  foodsBySlug?: Record<string, NearbyFood[]>;
}) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("mapbox-gl").Map | null>(null);
  const markers = useRef<Array<import("mapbox-gl").Marker>>([]);
  const [category, setCategory] = useState<"all" | Spot["category"]>("all");
  const [selectedIndex, setSelectedIndex] = useState(Math.min(2, Math.max(0, spots.length - 1)));
  const [activeView, setActiveView] = useState<DashboardView>("works");
  const [mapStyle, setMapStyle] = useState<"map" | "satellite">("map");
  const visibleSpots = useMemo(
    () => category === "all" ? spots : spots.filter((spot) => spot.category === category),
    [category, spots]
  );
  const selected = visibleSpots[selectedIndex] || visibleSpots[0];
  const selectedFoods = selected ? (foodsBySlug[selected.slug] ?? []) : [];
  const primaryFood = selectedFoods[0] ?? null;
  const approvedCount = spots.filter((s) => s.status === "approved").length;
  const approvedRate = spots.length ? Math.round((approvedCount / spots.length) * 100) : 0;
  const averageMatch = spots.length
    ? Math.round(spots.reduce((total, spot) => total + spot.confidenceScore, 0) / spots.length * 100)
    : 0;
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(0, visibleSpots.length - 1)));
  }, [visibleSpots.length]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapNode.current || !visibleSpots.length) return;
    let cancelled = false;

    async function setup() {
      const mapbox = await import("mapbox-gl");
      if (cancelled || !mapNode.current) return;
      mapbox.default.accessToken = token;
      const bounds = new mapbox.default.LngLatBounds();
      visibleSpots.forEach((spot) => bounds.extend([spot.lng, spot.lat]));
      const map = new mapbox.default.Map({
        container: mapNode.current,
        style: mapStyle === "satellite" ? "mapbox://styles/mapbox/satellite-streets-v12" : "mapbox://styles/mapbox/light-v11",
        bounds,
        fitBoundsOptions: { padding: 72 },
        attributionControl: true
      });
      mapInstance.current = map;
      markers.current = visibleSpots.map((spot, index) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = `receipt-marker ${index === selectedIndex ? "is-selected" : ""}`;
        el.textContent = String(index + 1).padStart(3, "0");
        el.title = spot.spotName[locale];
        el.onclick = () => setSelectedIndex(index);
        return new mapbox.default.Marker({ element: el, anchor: "bottom" })
          .setLngLat([spot.lng, spot.lat])
          .addTo(map);
      });
    }

    setup();
    return () => {
      cancelled = true;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [locale, visibleSpots, mapStyle]);

  useEffect(() => {
    markers.current.forEach((marker, index) => {
      marker.getElement().classList.toggle("is-selected", index === selectedIndex);
    });
    const spot = visibleSpots[selectedIndex];
    if (spot) mapInstance.current?.flyTo({ center: [spot.lng, spot.lat], zoom: 11.5, duration: 700 });
  }, [selectedIndex, visibleSpots]);

  useEffect(() => {
    if (activeView !== "map") return;
    const frame = requestAnimationFrame(() => mapInstance.current?.resize());
    return () => cancelAnimationFrame(frame);
  }, [activeView]);

  const dashboardViews: Array<{ id: DashboardView; ja: string; en: string }> = [
    { id: "works", ja: "作品", en: "WORKS" },
    { id: "map", ja: "地図", en: "MAP" },
    { id: "food", ja: primaryFood ? "食" : "詳細", en: primaryFood ? "FOOD" : "DETAILS" }
  ];

  return (
    <section className="receipt-shell" aria-label={locale === "ja" ? "ロケ地探索ダッシュボード" : "Location explorer dashboard"}>
      <header className="receipt-header">
        <div className="receipt-brand">MAD <span>Pilgrim</span></div>
        <div className="receipt-subbrand">
          <strong>LOCATION RECEIPT</strong>
          <span>{locale === "ja" ? "映像ロケ地ツーリズム" : "SCREEN TOURISM"}</span>
        </div>
        <h1>WORK / SCENE / PLACE / FOOD</h1>
        <div className="receipt-city">
          <span className="receipt-pin">⌖</span>
          <strong>{locale === "ja" ? "東京" : "TOKYO"}</strong>
          <small>TOKYO, JAPAN</small>
        </div>
        <div className="receipt-check">
          <strong>SOURCE CHECKED</strong>
          <span>2026.06.18&nbsp;&nbsp;13:42:07</span>
        </div>
      </header>

      <nav className="receipt-dashboard-mobile-tabs" aria-label={locale === "ja" ? "表示する情報" : "Dashboard view"} role="tablist">
        {dashboardViews.map((view, index) => (
          <button
            aria-controls={`receipt-panel-${view.id}`}
            aria-selected={activeView === view.id}
            id={`receipt-tab-${view.id}`}
            key={view.id}
            onClick={() => setActiveView(view.id)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const nextIndex = event.key === "Home"
                ? 0
                : event.key === "End"
                  ? dashboardViews.length - 1
                  : (index + (event.key === "ArrowRight" ? 1 : -1) + dashboardViews.length) % dashboardViews.length;
              const next = dashboardViews[nextIndex];
              setActiveView(next.id);
              document.getElementById(`receipt-tab-${next.id}`)?.focus();
            }}
            role="tab"
            tabIndex={activeView === view.id ? 0 : -1}
            type="button"
          >
            <small>0{index + 1}</small>
            {locale === "ja" ? view.ja : view.en}
          </button>
        ))}
      </nav>

      <div className="receipt-workspace receipt-linked-workspace">
        <div className="receipt-signal-rail" aria-hidden="true">
          <span>SELECTED SCENE</span>
          <i />
          <span>MAP PIN</span>
          <i />
          <span>{primaryFood ? "FOOD MATCH" : "LOCATION INFO"}</span>
        </div>
        <aside
          aria-labelledby="receipt-tab-works"
          className={`receipt-scenes receipt-linked-panel ${activeView !== "works" ? "is-mobile-inactive" : ""}`}
          id="receipt-panel-works"
          role="tabpanel"
        >
          <div className="receipt-blackbar">
            <strong>WORKS <em>&amp;</em> SCENES</strong>
            <span>更新&nbsp; 13:42</span>
          </div>
          <nav className="receipt-tabs" aria-label="Media type">
            {([
              ["all", "すべて"],
              ["drama", "ドラマ"],
              ["movie", "映画"],
              ["anime", "アニメ"],
              ["manga", "マンガ"],
              ["mv", "Music Video"]
            ] as const).map(([value, label]) => (
              <button
                aria-pressed={category === value}
                className={category === value ? "is-active" : ""}
                key={value}
                onClick={() => {
                  setCategory(value);
                  setSelectedIndex(0);
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="receipt-stats">
            <span>TOTAL SCENES</span><b>{visibleSpots.length.toString().padStart(3, "0")}</b>
            <span>VERIFIED</span><b title={locale === "ja" ? "人による承認済みスポットの割合" : "Share of spots approved by a human reviewer"}>{approvedRate}%</b>
          </div>
          <div className="receipt-scene-list">
            {visibleSpots.length === 0 ? (
              <div className="receipt-empty-state">
                {locale === "ja" ? "このカテゴリには確認済みスポットがまだありません。" : "No verified spots in this category yet."}
              </div>
            ) : null}
            {visibleSpots.map((spot, index) => (
              <button
                className={`receipt-scene ${selectedIndex === index ? "is-selected" : ""}`}
                data-category={spot.category}
                key={spot.id}
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                <span className="receipt-number">{String(index + 1).padStart(3, "0")}<small>{categoryCode[spot.category]}</small></span>
                <img alt={`${spot.title[locale]} — ${spot.spotName[locale]}`} height="102" src={mapboxStatic(spot.lng, spot.lat, 92, 102, 13) ?? FALLBACK_CARD} width="92" />
                <span className="receipt-scene-copy">
                  <strong>{spot.title[locale]}</strong>
                  <b>{spot.releaseYear}{spot.broadcaster ? ` / ${spot.broadcaster}` : ""}</b>
                  <span>
                    SCENE&nbsp;&nbsp;
                    {spot.sceneNumber ? `#${/^\d+$/.test(spot.sceneNumber) ? spot.sceneNumber.padStart(2, "0") : spot.sceneNumber}` : `#${String(index + 1).padStart(2, "0")}`}
                    &nbsp;&nbsp;{spot.sceneTimestamp[locale] || "21:03"}
                    {selectedIndex === index ? <mark className="receipt-selected-badge">SELECTED</mark> : null}
                  </span>
                  <span>PLACE&nbsp;&nbsp; {spot.spotName[locale]}</span>
                  <i title={spot.status === "approved" ? "出典確認と人による承認が完了" : "AI候補として人による確認待ち"}>
                    {spot.status === "approved" ? "検証済み" : "AI REVIEW"}
                  </i>
                </span>
                <span className="receipt-rate">{Math.round(spot.confidenceScore * 100)}%</span>
              </button>
            ))}
          </div>
          {selected ? (
            <Link className="receipt-view-all" href={`/${locale}/spots/${selected.slug}`}>
              VIEW ALL SCENES <span>→</span><b>{visibleSpots.length}</b>
            </Link>
          ) : (
            <div className="receipt-view-all">
              VIEW ALL SCENES <span>→</span><b>{visibleSpots.length}</b>
            </div>
          )}
        </aside>

        <section
          aria-labelledby="receipt-tab-map"
          className={`receipt-map receipt-linked-panel ${activeView !== "map" ? "is-mobile-inactive" : ""}`}
          id="receipt-panel-map"
          role="tabpanel"
        >
          <div className="receipt-blackbar">
            <strong>{locale === "ja" ? "撮影場所" : "FILMING LOCATION"} <small>LIVE MAP</small></strong>
            <span className="receipt-map-toggle">
              <button
                aria-pressed={mapStyle === "map"}
                className={mapStyle === "map" ? "is-active" : ""}
                onClick={() => setMapStyle("map")}
                type="button"
              >
                ▣ {locale === "ja" ? "地図" : "MAP"}
              </button>
              <button
                aria-pressed={mapStyle === "satellite"}
                className={mapStyle === "satellite" ? "is-active" : ""}
                onClick={() => setMapStyle("satellite")}
                type="button"
              >
                {locale === "ja" ? "航空写真" : "SATELLITE"}
              </button>
              <button
                aria-label={locale === "ja" ? "全画面表示" : "Fullscreen"}
                onClick={() => mapNode.current?.requestFullscreen()}
                type="button"
              >
                ⛶
              </button>
            </span>
          </div>
          <div className="receipt-map-canvas" ref={mapNode}>
            {!hasMapboxToken ? (
              <div className="receipt-map-fallback" aria-label="Tokyo route map preview">
                <svg viewBox="0 0 520 790" role="img" aria-label="Tokyo scene locations">
                  <defs>
                    <pattern id="minor-grid" width="34" height="34" patternUnits="userSpaceOnUse">
                      <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#d7d7d2" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="520" height="790" fill="#f4f4f1" />
                  <rect width="520" height="790" fill="url(#minor-grid)" opacity=".75" />
                  <path d="M0 195 C110 174 185 210 265 183 S420 108 520 128" className="map-road major" />
                  <path d="M80 0 C113 130 82 230 126 334 S183 532 164 790" className="map-road major" />
                  <path d="M230 0 C218 154 248 251 229 375 S202 635 255 790" className="map-road" />
                  <path d="M0 465 C117 430 252 465 355 430 S455 360 520 374" className="map-road" />
                  <path d="M0 652 C128 610 224 630 333 585 S438 490 520 505" className="map-road major" />
                  <path d="M390 0 C370 130 387 236 420 340 S463 558 445 790" className="map-rail" />
                  <path d="M520 430 C465 470 452 544 453 617 S470 724 520 750 V790 H420 C438 714 420 636 423 568 S447 457 520 410 Z" fill="#dceaf0" />
                  <path d="M158 72 L158 162 L142 208 L142 292 L96 326 L110 444 L182 500 L184 594 L274 650 L274 704 L178 748" className="map-route" />
                  <g className="map-districts">
                    <text x="42" y="62">新宿区</text><text x="315" y="162">千代田区</text>
                    <text x="18" y="331">渋谷区</text><text x="358" y="333">中央区</text>
                    <text x="26" y="500">目黒区</text><text x="320" y="611">品川区</text>
                    <text x="201" y="535">東京タワー</text><text x="355" y="507">レインボーブリッジ</text>
                  </g>
                  {visibleSpots.slice(0, 5).map((spot, index) => {
                    const points = [[418, 120], [410, 358], [108, 327], [158, 72], [178, 748]];
                    const [x, y] = points[index] || [260, 395];
                    const active = index === selectedIndex;
                    return (
                      <g
                        className={`map-pin-group ${active ? "is-selected" : ""}`}
                        key={spot.id}
                        onClick={() => setSelectedIndex(index)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedIndex(index);
                          }
                        }}
                        aria-label={spot.spotName[locale]}
                        role="button"
                        tabIndex={0}
                      >
                        <circle cx={x} cy={y + 18} r={active ? 16 : 7} className="map-pin-ring" />
                        <path d={`M${x - 15} ${y - 16}h30v24l-15 16-15-16z`} className="map-pin-shape" />
                        <text x={x} y={y + 1}>{String(index + 1).padStart(3, "0")}</text>
                      </g>
                    );
                  })}
                  <g className="map-scale"><path d="M16 760v8h64v-8" /><text x="16" y="752">500 m</text></g>
                </svg>
              </div>
            ) : null}
          </div>
        </section>

        <aside
          aria-labelledby="receipt-tab-food"
          className={`receipt-food receipt-linked-panel ${activeView !== "food" ? "is-mobile-inactive" : ""}`}
          id="receipt-panel-food"
          role="tabpanel"
        >
          {selected ? (
            <>
              <div className="receipt-blackbar">
                <strong>{primaryFood ? (locale === "ja" ? "作品に出た味" : "FOOD ON SCREEN") : (locale === "ja" ? "ロケ地情報" : "LOCATION NOTES")}</strong>
                <span>LIVE</span>
              </div>
              <div className="receipt-food-kicker">{primaryFood ? "SCREEN × FOOD LEDGER" : "SCENE × LOCATION LEDGER"}</div>
              <div className="receipt-food-image">
                <img
                  alt={primaryFood ? (locale === "ja" ? "作品に登場する料理のイメージ" : "Food experience connected to the scene") : selected.spotName[locale]}
                  height="245"
                  src={primaryFood
                    ? (mapboxStatic(selected.lng, selected.lat, 640, 245, 15) ?? FALLBACK_HERO)
                    : (mapboxStatic(selected.lng, selected.lat, 640, 245, 14) ?? FALLBACK_HERO)
                  }
                  width="640"
                />
                {primaryFood ? <span>AVAILABLE NOW</span> : <span>{selected.prefecture?.toUpperCase()} · {selected.city?.toUpperCase()}</span>}
                {primaryFood
                  ? <b title={locale === "ja" ? "作品と食体験の関連一致度" : "Match between the work and food experience"}>MATCH 100%</b>
                  : <b title={locale === "ja" ? "ロケ地情報の検証状態" : "Verification status for this location"}>{selected.sourceType === "official" ? "OFFICIAL" : "VERIFIED"}</b>}
              </div>
              <div className="receipt-dossier">
                <div className="receipt-scene-link">
                  <div>
                    <small>SCENE LINK</small>
                    <strong>
                      {selected.title[locale]}{" "}
                      <span>
                        {selected.sceneNumber ? `#${/^\d+$/.test(selected.sceneNumber) ? selected.sceneNumber.padStart(2, "0") : selected.sceneNumber}` : `#${String(selectedIndex + 1).padStart(2, "0")}`}
                        &nbsp;{selected.sceneTimestamp[locale] || ""}
                      </span>
                    </strong>
                    <b>{selected.releaseYear}{selected.broadcaster ? ` / ${selected.broadcaster}` : ""}</b>
                    <p>{selected.description[locale]}</p>
                  </div>
                  <img
                    alt={`${selected.title[locale]} scene reference`}
                    height="118"
                    src={mapboxStatic(selected.lng, selected.lat, 140, 118, 14) ?? FALLBACK_CARD}
                    width="140"
                  />
                </div>
                {primaryFood ? (
                  <dl>
                    <div><dt>DISH</dt><dd><strong>{primaryFood.name}</strong></dd></div>
                    <div>
                      <dt>VENUE</dt>
                      <dd>
                        <a className="receipt-venue-link" href={primaryFood.googleMapsUrl} rel="noreferrer" target="_blank">
                          <span><strong>{primaryFood.name}</strong><small>{primaryFood.address}</small></span>
                          <span>›</span>
                        </a>
                      </dd>
                    </div>
                    <div><dt>AVAILABLE</dt><dd><strong className="available">AVAILABLE NOW</strong></dd></div>
                    <div><dt>PRICE RANGE</dt><dd>{`¥${primaryFood.priceLevel * 500}〜¥${primaryFood.priceLevel * 1000 + 300}`}</dd></div>
                    <div><dt>TRAVEL TIME</dt><dd><strong className="walk">🚶 徒歩 {String(selectedFoods[0] ? 5 : 6).padStart(2, "0")} MIN</strong></dd></div>
                    <div><dt>SOURCE</dt><dd>{primaryFood.tags?.join(" / ") || (selected.sourceType === "official" ? "OFFICIAL" : selected.sourceType?.toUpperCase())}</dd></div>
                  </dl>
                ) : (
                  <dl>
                    <div><dt>SPOT</dt><dd><strong>{selected.spotName[locale]}</strong></dd></div>
                    <div><dt>AREA</dt><dd><strong>{selected.prefecture} / {selected.city}</strong></dd></div>
                    <div><dt>SCENE</dt><dd><strong>{selected.sceneNumber ? `#${selected.sceneNumber}` : "—"}&nbsp;{selected.sceneTimestamp[locale] || ""}</strong></dd></div>
                    <div><dt>CONFIDENCE</dt><dd>
                      <TrustIndicator kind="match" label="MATCH" title={locale === "ja" ? "作品内の場面と実在地点が一致する信頼度です。" : "Confidence that the scene matches this real-world location."}>
                        {Math.round(selected.confidenceScore * 100)}%
                      </TrustIndicator>
                    </dd></div>
                    <div><dt>SOURCE</dt><dd>
                      <TrustIndicator kind="source" label={selected.sourceType.toUpperCase()} title={locale === "ja" ? "ロケ地情報の根拠として登録された出典種別です。" : "The evidence-source type recorded for this location."} />
                    </dd></div>
                    <div><dt>ACCESS</dt><dd><small>{selected.visitTips?.[locale] ? selected.visitTips[locale].slice(0, 60) + "…" : "—"}</small></dd></div>
                  </dl>
                )}
                <div className="receipt-actions">
                  {primaryFood
                    ? <a href={primaryFood.googleMapsUrl ?? "https://maps.google.com"} rel="noreferrer" target="_blank">{locale === "ja" ? "このお店へ行く" : "Visit this restaurant"}</a>
                    : <a href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`} rel="noreferrer" target="_blank">{locale === "ja" ? "ロケ地をマップで見る" : "View on Google Maps"}</a>
                  }
                  <Link href={`/${locale}/spots/${selected.slug}`}>詳細を見る&nbsp; ↗</Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="receipt-blackbar">
                <strong>{locale === "ja" ? "ロケ地情報" : "LOCATION NOTES"}</strong>
                <span>LIVE</span>
              </div>
              <div className="receipt-food-kicker">SCENE × LOCATION LEDGER</div>
              <div className="receipt-dossier">
                <p className="receipt-empty-state">
                  {locale === "ja"
                    ? "このカテゴリには確認済みスポットがまだありません。別のカテゴリを選んでください。"
                    : "No verified spots in this category yet. Please choose another category."}
                </p>
              </div>
            </>
          )}
        </aside>
      </div>

      <footer className="receipt-footer">
        <div><small>LAST UPDATE</small><strong>2026.06.18&nbsp; 13:42</strong></div>
        <div>
          <TrustIndicator kind="match" label="SCENE MATCH" title={locale === "ja" ? "掲載スポット全体の平均シーン一致信頼度です。" : "Average scene-match confidence across listed spots."}>
            {averageMatch}%
          </TrustIndicator>
        </div>
        <div>
          <TrustIndicator kind="verified" label="VERIFIED" title={locale === "ja" ? "出典確認と人による承認が完了したスポット数です。" : "Spots whose evidence was checked and approved by a human reviewer."}>
            {String(approvedCount).padStart(3, "0")} / {String(spots.length).padStart(3, "0")}
          </TrustIndicator>
        </div>
        <div>
          <TrustIndicator kind="source" label="DATA SOURCE" title={locale === "ja" ? "公式・媒体・利用者報告・推定情報を区別して記録しています。" : "Sources are recorded as official, media, user-reported, or inferred."}>
            OFFICIAL / MEDIA / REPORT
          </TrustIndicator>
        </div>
        <div className="receipt-barcode"><i /><span>MADP-TRP-20260618-134207</span></div>
      </footer>
    </section>
  );
}
