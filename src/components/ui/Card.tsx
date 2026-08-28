import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: boolean;
};

export function Card({ children, className = "", padding = true }: CardProps) {
  return <section className={`card ${padding ? "card-pad" : ""} ${className}`.trim()}>{children}</section>;
}

export function CardHeader({
  title,
  meta,
  action,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card-head">
      <div>
        {eyebrow ? <p className="card-eye">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {meta ? <div className="card-meta">{meta}</div> : null}
      </div>
      {action}
    </div>
  );
}
