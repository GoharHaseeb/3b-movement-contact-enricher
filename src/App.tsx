import AppShell from "./components/ui/AppShell";
import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardPage from "./pages/DashboardPage";
import EnrichPage from "./features/enrich/EnrichPage";
import { EnrichProvider } from "./features/enrich/EnrichContext";
import SettingsPage from "./pages/SettingsPage";
import type { ViewId } from "./app/navigation";

function renderView(view: ViewId) {
  if (view === "dashboard") return <DashboardPage />;
  if (view === "enrich") return <EnrichPage />;
  if (view === "settings") return <SettingsPage />;
  return <ComingSoonPage view={view} />;
}

export default function App() {
  return (
    <EnrichProvider>
      <AppShell>{renderView}</AppShell>
    </EnrichProvider>
  );
}
