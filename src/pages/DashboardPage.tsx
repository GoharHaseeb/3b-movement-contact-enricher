import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import Stat from "../components/ui/Stat";
import { Icons } from "../components/ui/Icons";
import { navigate } from "../app/router";
import { useEnrich } from "../features/enrich/EnrichContext";
import { getSupabaseConfig } from "../lib/supabase";
import { getActiveMasterMeta, type MasterMeta } from "../lib/supabaseMaster";
import { listRecentRuns, type SavedRun } from "../lib/supabaseSync";

export default function DashboardPage() {
  const { master, segment, summary, loadSamples } = useEnrich();
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [savedMaster, setSavedMaster] = useState<MasterMeta | null>(null);
  const connected = Boolean(getSupabaseConfig());
  const masterCount = savedMaster?.rowCount ?? master?.rows.length;
  const masterHint = savedMaster
    ? `${savedMaster.fileName} · saved`
    : master
      ? master.fileName
      : "Upload once on Enrich";

  useEffect(() => {
    if (!connected) return;
    void listRecentRuns()
      .then(setRuns)
      .catch(() => setRuns([]));
    void getActiveMasterMeta()
      .then(setSavedMaster)
      .catch(() => setSavedMaster(null));
  }, [connected, summary, master]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        subtitle="Contact operations for the 3B Movement studio workspace."
        actions={
          <Button icon={<Icons.enrich size={16} />} onClick={() => navigate("enrich")}>
            Open Enrich Contacts
          </Button>
        }
      />

      <div className="stat-grid">
        <Stat
          label="Master contacts"
          value={masterCount != null ? masterCount.toLocaleString() : "—"}
          hint={masterHint}
          icon={<Icons.database />}
          tone={masterCount ? "ok" : "default"}
        />
        <Stat
          label="Segment rows"
          value={segment ? segment.rows.length.toLocaleString() : "—"}
          hint={segment ? segment.fileName : "No segment loaded"}
          icon={<Icons.layers />}
        />
        <Stat
          label="Last match rate"
          value={summary ? `${summary.matchRate.toFixed(1)}%` : "—"}
          hint={summary ? `${summary.matched} matched` : "No run yet"}
          icon={<Icons.percent />}
          tone={summary ? "accent" : "default"}
        />
        <Stat
          label="Phones recovered"
          value={summary ? summary.phoneFound.toLocaleString() : "—"}
          hint={summary ? `${summary.phoneMissing} still missing` : "Run an enrich job"}
          icon={<Icons.phone />}
          tone={summary ? "ok" : "default"}
        />
      </div>

      <div className="dash-grid">
        <Card>
          <CardHeader
            eyebrow="Pipeline"
            title="Enrich workspace"
            meta="Save master once → drop lists → fill phones."
          />
          <div className="dash-points">
            <div>
              <span>1</span>
              <p>
                <strong>Master CSV</strong>
                Upload the full studio list once. It stays in Supabase.
              </p>
            </div>
            <div>
              <span>2</span>
              <p>
                <strong>List CSV</strong>
                Expired members, intro offers, former lists — as often as you need.
              </p>
            </div>
            <div>
              <span>3</span>
              <p>
                <strong>Match & export</strong>
                Fill missing phones, review coverage, download.
              </p>
            </div>
          </div>
          <div className="card-footer-row">
            <Button onClick={() => navigate("enrich")}>
              {savedMaster || master ? "Upload a list" : "Save master first"}
            </Button>
            <Button variant="secondary" onClick={() => void loadSamples()}>
              Load dummy sample
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Activity"
            title="Recent runs"
            meta={connected ? "From Supabase" : "Local session only."}
            action={
              connected ? null : (
                <Button variant="ghost" onClick={() => navigate("settings")}>
                  Connect
                </Button>
              )
            }
          />
          {runs.length > 0 ? (
            <div className="activity">
              {runs.map((run) => (
                <div className="activity-row" key={run.id}>
                  <div className="file-mark">
                    <Icons.check />
                  </div>
                  <div>
                    <strong>{run.segment_file || "Enrich run"}</strong>
                    <p>
                      {run.total} contacts · {Number(run.match_rate).toFixed(1)}% · {run.phones_found} phones
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : summary ? (
            <div className="activity">
              <div className="activity-row">
                <div className="file-mark">
                  <Icons.check />
                </div>
                <div>
                  <strong>Match complete</strong>
                  <p>
                    {summary.segmentFileName} · {summary.total} contacts · {summary.matchRate.toFixed(1)}%
                  </p>
                </div>
                <Button variant="ghost" onClick={() => navigate("enrich")}>
                  View
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Icons.chart />}
              title="No enrich jobs yet"
              body="Run a match from Enrich Contacts. Sample CSVs are dummy data only."
              actionLabel="Go to Enrich"
              onAction={() => navigate("enrich")}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
