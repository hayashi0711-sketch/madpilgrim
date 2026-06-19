import type { ReactNode } from "react";

export type TrustKind = "verified" | "match" | "source";

function TrustIcon({ kind }: { kind: TrustKind }) {
  if (kind === "match") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    );
  }
  if (kind === "source") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h6M9 16h6" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 2 20 5v6c0 5-3.2 9-8 11-4.8-2-8-6-8-11V5z" />
      <path d="m8.5 12 2.3 2.3 4.8-5" />
    </svg>
  );
}

export function TrustIndicator({
  children,
  kind,
  label,
  title
}: {
  children?: ReactNode;
  kind: TrustKind;
  label: string;
  title: string;
}) {
  return (
    <span className={`trust-indicator trust-indicator-${kind}`} aria-label={`${label}: ${title}`} title={title}>
      <TrustIcon kind={kind} />
      <span>{label}</span>
      {children ? <strong>{children}</strong> : null}
    </span>
  );
}
