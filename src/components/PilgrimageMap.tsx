"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale, Spot, SpotCategory } from "@/types/mad-pilgrim";
import { cardLabelClass, categoryLabels, ui } from "@/lib/i18n";
import { SpotStatusPill } from "@/components/SpotStatusPill";

const categories: Array<SpotCategory | "all"> = ["all", "anime", "mv", "drama", "movie", "cm"];

function fallbackPinPosition(spot: Spot, spots: Spot[]) {
  const lats = spots.map((item) => item.lat);
  const lngs = spots.map((item) => item.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return {
    left: `${((spot.lng - minLng) / lngRange) * 68 + 14}%`,
    top: `${((maxLat - spot.lat) / latRange) * 58 + 16}%`
  };
}

export function PilgrimageMap({ spots, locale }: { spots: Spot[]; locale: Locale }) {
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("mapbox-gl").Map | null>(null);
  const mapboxRef = useRef<typeof import("mapbox-gl") | null>(null);
  const markersRef = useRef<Array<import("mapbox-gl").Marker>>([]);
  const [mapReady, setMapReady] = useState(false);
  const [category, setCategory] = useState<SpotCategory | "all">("all");
  const [approvedOnly, setApprovedOnly] = useState(false);
  const filtered = spots.filter((spot) => {
    const categoryMatch = category === "all" || spot.category === category;
    const statusMatch = !approvedOnly || spot.status === "approved";
    return categoryMatch && statusMatch;
  });

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapRef.current) return;

    let cancelled = false;

    async function setupMap() {
      const mapbox = await import("mapbox-gl");
      if (cancelled || !mapRef.current) return;

      mapbox.default.accessToken = token;
      mapboxRef.current = mapbox;
      mapInstanceRef.current = new mapbox.default.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [139.7005, 35.6595],
        zoom: 10.5
      });
      setMapReady(true);
    }

    setupMap();
    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      mapboxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const mapbox = mapboxRef.current;
    if (!map || !mapbox) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = filtered.map((spot) => {
      const marker = document.createElement("a");
      marker.href = `/${locale}/spots/${spot.slug}`;
      marker.className =
        spot.status === "approved"
          ? "block h-4 w-4 rounded-full border-2 border-white bg-shrine shadow-lg"
          : "block h-4 w-4 rounded-full border-2 border-white bg-zinc-400 shadow-lg";
      marker.title = spot.spotName[locale];
      return new mapbox.default.Marker(marker).setLngLat([spot.lng, spot.lat]).addTo(map);
    });
  }, [filtered, locale, mapReady]);

  return (
    <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6">
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-panel">
        <div ref={mapRef} className="relative min-h-[300px] bg-[#d9dfd6] sm:min-h-[380px] lg:min-h-[470px]">
          {!hasMapboxToken ? (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.65),rgba(185,150,91,.18)),radial-gradient(circle_at_25%_30%,rgba(228,87,46,.18),transparent_28%),radial-gradient(circle_at_70%_55%,rgba(18,21,28,.14),transparent_24%)]" />
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(18,21,28,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,21,28,.08)_1px,transparent_1px)] [background-size:28px_28px]" />
              {filtered.map((spot) => (
                <Link
                  key={spot.id}
                  aria-label={spot.spotName[locale]}
                  className={`absolute h-5 w-5 rounded-full border-2 border-white shadow-lg transition hover:scale-125 ${
                    spot.status === "approved" ? "bg-shrine" : "bg-zinc-400"
                  }`}
                  href={`/${locale}/spots/${spot.slug}`}
                  style={fallbackPinPosition(spot, spots)}
                  title={spot.spotName[locale]}
                />
              ))}
              <div className="absolute bottom-4 left-4 right-4 rounded-md border border-black/10 bg-white/95 px-4 py-3 shadow-sm sm:right-auto sm:max-w-xs">
                <p className="text-sm font-semibold text-ink">{ui[locale].mapPreview}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">{ui[locale].mapPreviewNote}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="rounded-lg border border-black/10 bg-white p-5 shadow-panel">
        <div className="flex flex-wrap gap-2.5">
          {categories.map((item) => (
            <button
              key={item}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold ${
                category === item ? "bg-night text-white" : "bg-zinc-100 text-zinc-700"
              }`}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item === "all" ? ui[locale].all : categoryLabels[locale][item]}
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            checked={approvedOnly}
            className="h-4 w-4 rounded border-zinc-300 text-shrine focus:ring-shrine"
            onChange={(event) => setApprovedOnly(event.target.checked)}
            type="checkbox"
          />
          {ui[locale].approvedOnly}
        </label>

        <div className="mt-5 space-y-4">
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-black/15 px-4 py-6 text-center text-sm text-zinc-600">
              {ui[locale].noSpots}
            </p>
          ) : null}
          {filtered.map((spot) => (
            <article key={spot.id} className="rounded-lg border border-black/10 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cardLabelClass(locale)}>{categoryLabels[locale][spot.category]}</p>
                  <h3 className="mt-1 text-base font-bold sm:text-lg">{spot.spotName[locale]}</h3>
                  <p className="text-sm text-zinc-600">{spot.title[locale]}</p>
                </div>
                <SpotStatusPill locale={locale} status={spot.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-700">{spot.description[locale]}</p>
              <Link
                className="mt-4 inline-flex min-h-10 items-center rounded-md bg-night px-4 py-2.5 text-sm font-semibold text-white hover:bg-shrine"
                href={`/${locale}/spots/${spot.slug}`}
              >
                {ui[locale].viewSpot}
              </Link>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
