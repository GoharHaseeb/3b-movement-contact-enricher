import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { PAGE_COPY, type ViewId } from "../app/navigation";
import { NAV_ICONS } from "../components/ui/Icons";
import { navigate } from "../app/router";
import Button from "../components/ui/Button";

export default function ComingSoonPage({ view }: { view: ViewId }) {
  const copy = PAGE_COPY[view];
  const Icon = NAV_ICONS[view];

  return (
    <div className="page-stack">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button variant="secondary" onClick={() => navigate("enrich")}>
            Back to Enrich
          </Button>
        }
      />
      <Card>
        <EmptyState
          icon={<Icon size={22} />}
          title={`${copy.title} is on the roadmap`}
          body="This module is scaffolded so the workspace can grow. Enrich Contacts is available now."
          actionLabel="Open Enrich Contacts"
          onAction={() => navigate("enrich")}
        />
      </Card>
    </div>
  );
}
