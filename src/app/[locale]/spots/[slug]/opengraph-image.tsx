import { ImageResponse } from "next/og";
import { getLocale } from "@/lib/i18n";
import { readSpot } from "@/lib/spots-adapter";

export const alt = "MAD Pilgrim — Filming location";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug: rawSlug } = await params;
  const locale = getLocale(localeParam);
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {}
  const spot = await readSpot(slug);

  const title = spot ? spot.title[locale] : "MAD Pilgrim";
  const place = spot ? spot.spotName[locale] : "";
  const eyebrow = locale === "ja" ? "ロケ地レシート / SCENE RECEIPT" : "LOCATION RECEIPT / SCENE RECORD";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 62px",
          background: "#f3f1ec",
          color: "#1d2128",
          border: "18px solid #121826",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 800, letterSpacing: -2 }}>
            MAD <span style={{ marginLeft: 10, fontWeight: 400 }}>Pilgrim</span>
          </div>
          <div style={{ display: "flex", color: "#c2a14d", fontSize: 18, letterSpacing: 2 }}>
            {eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: 24, color: "#121826", fontSize: 20, letterSpacing: 2 }}>
            {place}
          </div>
          <div style={{ display: "flex", maxWidth: 1020, fontFamily: "Georgia, serif", fontSize: 76, lineHeight: .98, letterSpacing: -3 }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 17 }}>
          <div style={{ display: "flex" }}>WORK / SCENE / PLACE / FOOD</div>
          <div style={{ display: "flex", padding: "13px 18px", background: "#c2a14d", color: "white" }}>
            MAD-PILGRIM.VERCEL.APP
          </div>
        </div>
      </div>
    ),
    size
  );
}
