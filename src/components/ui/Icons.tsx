import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const Icons = {
  dashboard: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  ),
  enrich: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v18" />
      <path d="M8 7l4-4 4 4" />
      <path d="M4 14h7" />
      <path d="M13 18h7" />
    </Svg>
  ),
  users: (p: IconProps) => (
    <Svg {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a3 3 0 0 1 0 5.75" />
    </Svg>
  ),
  layers: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 14l9 5 9-5" />
    </Svg>
  ),
  chart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15v-4" />
      <path d="M12 15V8" />
      <path d="M16 15v-6" />
    </Svg>
  ),
  settings: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Svg>
  ),
  upload: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 16V6" />
      <path d="M8 10l4-4 4 4" />
      <path d="M4 18h16" />
    </Svg>
  ),
  download: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v10" />
      <path d="M8 11l4 4 4-4" />
      <path d="M4 19h16" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12.5 9.5 17 19 7.5" />
    </Svg>
  ),
  database: (p: IconProps) => (
    <Svg {...p}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </Svg>
  ),
  file: (p: IconProps) => (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </Svg>
  ),
  menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  ),
  close: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Svg>
  ),
  phone: (p: IconProps) => (
    <Svg {...p}>
      <path d="M7 3h4l1.5 4-2.5 1.5a12 12 0 0 0 5.5 5.5L17 12l4 1.5V18a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 2-3Z" />
    </Svg>
  ),
  percent: (p: IconProps) => (
    <Svg {...p}>
      <path d="M19 5 5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </Svg>
  ),
  alert: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.7 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0Z" />
    </Svg>
  ),
  search: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  ),
  chevronLeft: (p: IconProps) => (
    <Svg {...p}>
      <path d="m15 6-6 6 6 6" />
    </Svg>
  ),
  chevronRight: (p: IconProps) => (
    <Svg {...p}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  ),
} as const;

export const NAV_ICONS = {
  dashboard: Icons.dashboard,
  enrich: Icons.enrich,
  members: Icons.users,
  segments: Icons.layers,
  reports: Icons.chart,
  settings: Icons.settings,
} as const;
