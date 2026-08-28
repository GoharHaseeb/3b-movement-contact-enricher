import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  actions,
  extra,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </div>
      {extra}
    </header>
  );
}
