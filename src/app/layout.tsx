import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Hina_Mincho, BIZ_UDPGothic } from "next/font/google";
import { getDesignTokens } from "@/lib/design-tokens";
import "./globals.css";

const headingFont = Hina_Mincho({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const bodyFont = BIZ_UDPGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mad-pilgrim.vercel.app"),
  title: "MAD Pilgrim",
  description: "Filming-location tourism and screen-to-table experiences."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tokens = await getDesignTokens();

  return (
    <html
      lang="ja"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      style={tokens as CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
