import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAD Pilgrim",
  description: "AI-assisted pilgrimage and filming-location map."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
