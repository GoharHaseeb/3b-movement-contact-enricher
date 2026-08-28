import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "subtle";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
};

export default function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {icon}
      {children}
    </button>
  );
}
