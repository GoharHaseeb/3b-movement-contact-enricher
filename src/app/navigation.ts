export const VIEWS = [
  "dashboard",
  "enrich",
  "members",
  "segments",
  "reports",
  "settings",
] as const;

export type ViewId = (typeof VIEWS)[number];

export type NavItem = {
  id: ViewId;
  label: string;
  available: boolean;
  hint?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", available: true },
  { id: "enrich", label: "Enrich Contacts", available: true },
  { id: "members", label: "Members", available: false, hint: "Soon" },
  { id: "segments", label: "Segments", available: false, hint: "Soon" },
  { id: "reports", label: "Reports", available: false, hint: "Soon" },
  { id: "settings", label: "Settings", available: true },
];

export const PAGE_COPY: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Studio workspace overview for contact operations.",
  },
  enrich: {
    title: "Enrich Contacts",
    subtitle: "Match segmented lists to the master database by email.",
  },
  members: {
    title: "Members",
    subtitle: "A searchable member directory will live here.",
  },
  segments: {
    title: "Segments",
    subtitle: "Saved lists like expired members and intro offers.",
  },
  reports: {
    title: "Reports",
    subtitle: "Match rates, coverage, and export history.",
  },
  settings: {
    title: "Settings",
    subtitle: "Connect Supabase and manage workspace preferences.",
  },
};

export function isViewId(value: string): value is ViewId {
  return (VIEWS as readonly string[]).includes(value);
}
