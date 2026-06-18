"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale, NearbyFood, Spot } from "@/types/mad-pilgrim";

const coverImages = [
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=480&q=80",
  "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=480&q=80"
];

const foodImages = [
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=88",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=88"
];

const categoryCode: Record<Spot["category"], string> = {
  anime: "ANIME",
  mv: "MV",
  drama: "DRAMA",
  movie: "MOVIE",
  cm: "CM"
};

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
  const visibleSpots = useMemo(
    () => category === "all" ? spots : spots.filter((spot) => spot.category === category),
    [category, spots]
  );
  const selected = visibleSpots[selectedIndex] || visibleSpots[0];
  const selectedFoods = selected ? (foodsBySlug[selected.slug] ?? []) : [];
  const primaryFood = selectedFoods[0] ?? null;
  const approvedCount = spots.filter((s) => s.status === "approved").length;
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
        style: "mapbox://styles/mapbox/light-v11",
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
  }, [locale, visibleSpots]);

  useEffect(() => {
    markers.current.forEach((marker, index) => {
      marker.getElement().classList.toggle("is-selected", index === selectedIndex);
    });
    const spot = visibleSpots[selectedIndex];
    if (spot) mapInstance.current?.flyTo({ center: [spot.lng, spot.lat], zoom: 11.5, duration: 700 });
  }, [selectedIndex, visibleSpots]);

  if (!selected) return null;

  return (
    <main className="receipt-shell">
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

      <div className="receipt-workspace">
        <aside className="receipt-scenes">
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
              ["mv", "MV"]
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
            <span>VERIFIED</span><b>96%</b>
          </div>
          <div className="receipt-scene-list">
            {visibleSpots.map((spot, index) => (
              <button
                className={`receipt-scene ${selectedIndex === index ? "is-selected" : ""}`}
                key={spot.id}
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                <span className="receipt-number">{String(index + 1).padStart(3, "0")}<small>{categoryCode[spot.category]}</small></span>
                <img alt={`${spot.title[locale]} — ${spot.spotName[locale]}`} height="102" src={coverImages[index % coverImages.length]} width="92" />
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
                  <i>{spot.status === "approved" ? "検証済み" : "AI REVIEW"}</i>
                </span>
                <span className="receipt-rate">{Math.round(spot.confidenceScore * 100)}%</span>
              </button>
            ))}
          </div>
          <Link className="receipt-view-all" href={`/${locale}/spots/${selected.slug}`}>
            VIEW ALL SCENES <span>→</span><b>{visibleSpots.length}</b>
          </Link>
        </aside>

        <section className="receipt-map">
          <div className="receipt-blackbar">
            <strong>{locale === "ja" ? "撮影場所" : "FILMING LOCATION"} <small>LIVE MAP</small></strong>
            <span>▣&nbsp; 地図&nbsp;&nbsp;&nbsp; 航空写真&nbsp;&nbsp;&nbsp; ⛶</span>
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
            {hasMapboxToken ? (
              <svg className="receipt-live-route" viewBox="0 0 520 790" preserveAspectRatio="none" aria-hidden="true">
                <path d="M158 72 L158 162 L142 208 L142 292 L96 326 L110 444 L182 500 L184 594 L274 650 L274 704 L178 748" />
              </svg>
            ) : null}
          </div>
        </section>

        <aside className="receipt-food">
          <div className="receipt-blackbar">
            <strong>{locale === "ja" ? "作品に出た味" : "FOOD ON SCREEN"}</strong>
            <span>LIVE</span>
          </div>
          <div className="receipt-food-kicker">SCREEN × FOOD LEDGER</div>
          <div className="receipt-food-image">
            <img alt={locale === "ja" ? "作品に登場する料理のイメージ" : "Food experience connected to the scene"} height="245" src={foodImages[selectedIndex % foodImages.length]} width="640" />
            <span>AVAILABLE NOW</span>
            <b>MATCH 100%</b>
          </div>
          <div className="receipt-dossier">
            <div className="receipt-scene-link">
              <div>
                <small>SCENE LINK</small>
                <strong>
                    {selected.title[locale]}{" "}
                    <span>
                      {selected.sceneNumber ? `#${/^\d+$/.test(selected.sceneNumber) ? selected.sceneNumber.padStart(2, "0") : selected.sceneNumber}` : `#${String(selectedIndex + 1).padStart(2, "0")}`}
                      &nbsp;{selected.sceneTimestamp[locale] || "21:03"}
                    </span>
                  </strong>
                <b>{selected.releaseYear}{selected.broadcaster ? ` / ${selected.broadcaster}` : ""}</b>
                <p>{selected.description[locale]}</p>
              </div>
              <img alt={`${selected.title[locale]} scene reference`} height="118" src={coverImages[(selectedIndex + 1) % coverImages.length]} width="140" />
            </div>
            <dl>
              <div><dt>DISH</dt><dd><strong>{primaryFood ? primaryFood.name : (locale === "ja" ? "—" : "—")}</strong></dd></div>
              <div><dt>VENUE</dt><dd><span><strong>{primaryFood ? primaryFood.name : "N/A"}</strong><small>{primaryFood ? primaryFood.address : ""}</small></span>{primaryFood ? <span>›</span> : null}</dd></div>
              <div><dt>AVAILABLE</dt><dd><strong className="available">{primaryFood ? "AVAILABLE NOW" : "—"}</strong></dd></div>
              <div><dt>PRICE RANGE</dt><dd>{primaryFood ? `¥${primaryFood.priceLevel * 500} - ¥${primaryFood.priceLevel * 1000 + 300}` : "—"}</dd></div>
              <div><dt>TRAVEL TIME</dt><dd><strong className="walk">🚶 徒歩 06 MIN</strong></dd></div>
              <div><dt>SOURCE</dt><dd>{primaryFood?.tags?.join(" / ") || (selected.sourceType === "official" ? "OFFICIAL" : selected.sourceType?.toUpperCase())}</dd></div>
            </dl>
            <div className="receipt-evidence">
              <span>EVIDENCE</span>
              {coverImages.slice(0, 4).map((image, index) => <img alt={`Evidence ${index + 1}`} height="52" key={image} src={image} width="58" />)}
              <b>+3<br /><small>MORE</small></b>
            </div>
            <div className="receipt-actions">
              <a href={primaryFood?.googleMapsUrl ?? "https://maps.google.com"} rel="noreferrer" target="_blank">{locale === "ja" ? "このお店へ行く" : "Visit this spot"}</a>
              <Link href={`/${locale}/spots/${selected.slug}`}>ルートを見る&nbsp; ↗</Link>
            </div>
          </div>
        </aside>
      </div>

      <footer className="receipt-footer">
        <div><small>LAST UPDATE</small><strong>2026.06.18&nbsp; 13:42</strong></div>
        <div><small>SCENE MATCH RATE</small><strong>96% <i /></strong></div>
        <div><small>SPOTS VERIFIED</small><strong>{String(approvedCount).padStart(3, "0")} / {String(spots.length).padStart(3, "0")}</strong></div>
        <div><small>DATA SOURCE</small><span>Official / Media / User Report / AI Verify</span></div>
        <div className="receipt-barcode"><i /><span>MADP-TRP-20260618-134207</span></div>
      </footer>
    </main>
  );
}
