import { useState, type ReactNode } from "react";
import type { ViewId } from "../../app/navigation";
import { useHashRoute } from "../../app/router";
import { useEnrich } from "../../features/enrich/EnrichContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ children }: { children: (view: ViewId) => ReactNode }) {
  const { view, navigate } = useHashRoute();
  const { master } = useEnrich();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar
        view={view}
        open={menuOpen}
        onNavigate={navigate}
        onClose={() => setMenuOpen(false)}
      />
      <div className="shell-main">
        <TopBar
          masterLoaded={Boolean(master)}
          masterFileName={master?.fileName ?? null}
          onMenu={() => setMenuOpen(true)}
        />
        <main id="main" className="content">
          {children(view)}
        </main>
      </div>
    </div>
  );
}
