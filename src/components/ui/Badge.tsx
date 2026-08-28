import type { ReactNode } from "react";

type Tone = "neutral" | "ok" | "warn" | "muted" | "accent";

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
