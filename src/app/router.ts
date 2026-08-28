import { useEffect, useState } from "react";
import { isViewId, type ViewId } from "./navigation";

function readView(): ViewId {
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (isViewId(raw)) return raw;
  return "dashboard";
}

export function navigate(view: ViewId): void {
  window.location.hash = `#/${view}`;
}

export function useHashRoute(): { view: ViewId; navigate: (view: ViewId) => void } {
  const [view, setView] = useState<ViewId>(readView);

  useEffect(() => {
    const onChange = () => setView(readView());
    window.addEventListener("hashchange", onChange);
    if (!window.location.hash) navigate("dashboard");
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return { view, navigate };
}
