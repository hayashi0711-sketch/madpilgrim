import Link from "next/link";
import type { Locale } from "@/types/mad-pilgrim";

type Props = {
  locale: Locale;
  slug?: string;
};

export function LanguageSwitch({ locale, slug }: Props) {
  const targetLocale = locale === "ja" ? "en" : "ja";
  const href = slug ? `/${targetLocale}/spots/${slug}` : `/${targetLocale}`;

  return (
    <Link
      className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-ink hover:border-shrine hover:text-shrine"
      href={href}
    >
      {targetLocale.toUpperCase()}
    </Link>
  );
}
