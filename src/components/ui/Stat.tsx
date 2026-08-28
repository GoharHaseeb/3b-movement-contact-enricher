import type { ReactNode } from "react";

export default function Stat({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "ok" | "warn" | "accent";
}) {
  return (
    <article className={`stat stat-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {hint ? <p className="stat-hint">{hint}</p> : null}
      </div>
    </article>
  );
}
