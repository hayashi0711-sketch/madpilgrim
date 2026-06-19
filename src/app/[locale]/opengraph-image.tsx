import { ImageResponse } from "next/og";
import { getLocale } from "@/lib/i18n";

export const alt = "MAD Pilgrim — Filming locations and screen-to-table experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = getLocale(localeParam);
  const title = locale === "ja" ? "シーンを旅して、物語を味わう。" : "Travel through the scene. Taste the story.";
  const eyebrow = locale === "ja"
    ? "映像ロケ地ツーリズム × SCREEN-TO-TABLE"
    : "FILMING-LOCATION TOURISM × SCREEN-TO-TABLE";

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
          background: "#f3f0e8",
          color: "#080808",
          border: "18px solid #080808",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 800, letterSpacing: -2 }}>
            MAD <span style={{ marginLeft: 10, fontWeight: 400 }}>Pilgrim</span>
          </div>
          <div style={{ display: "flex", color: "#c2a14d", fontSize: 18, letterSpacing: 2 }}>
            SCENE / SERVE — ISSUE 001
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: 28, color: "#1849d6", fontSize: 18, letterSpacing: 2 }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", maxWidth: 1020, fontFamily: "Georgia, serif", fontSize: 88, lineHeight: .95, letterSpacing: -5 }}>
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
