import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import Stat from "../../components/ui/Stat";
import { Icons } from "../../components/ui/Icons";
import {
  buildDownloadName,
  downloadCsv,
  exportHeadersFor,
  previewHeadersFor,
  toCsv,
} from "../../lib/csv";
import type { MatchSummary, ResultFilter } from "../../types";
import { getSupabaseConfig } from "../../lib/supabase";
import { saveEnrichRun } from "../../lib/supabaseSync";

const FILTERS: { id: ResultFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "matched", label: "Matched" },
  { id: "phone-missing", label: "Phone missing" },
  { id: "not-found", label: "Not found" },
];

const PAGE_SIZE = 10;

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function ResultsWorkspace({
  summary,
  masterFileName,
  onReset,
}: {
  summary: MatchSummary;
  masterFileName?: string | null;
  onReset: () => void;
}) {
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [saveState, setSaveState] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const canSave = Boolean(getSupabaseConfig());

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return summary.rows.filter((row) => {
      if (filter === "matched" && row.status !== "matched") return false;
      if (filter === "phone-missing" && row.phoneFound) return false;
      if (filter === "not-found" && row.status !== "email-not-found") return false;
      if (!q) return true;
      return Object.values(row.values).some((value) => value.toLowerCase().includes(q));
    });
  }, [filter, query, summary.rows]);

  useEffect(() => {
    setPage(1);
  }, [filter, query, summary]);

  const previewHeaders = useMemo(() => previewHeadersFor(summary), [summary]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = visible.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, visible.length);

  async function handleSave() {
    setSaveError(null);
    setSaveState("Saving…");
    try {
      const result = await saveEnrichRun(summary, masterFileName ?? null);
      setSaveState(`Saved ${result.rowCount} rows to Supabase.`);
    } catch (err) {
      setSaveState(null);
      setSaveError(err instanceof Error ? err.message : "Could not save to Supabase.");
    }
  }

  function handleDownload() {
    const headers = exportHeadersFor(summary);
    downloadCsv(
      buildDownloadName(summary.segmentFileName),
      toCsv(
        headers,
        summary.rows.map((row) => row.values),
      ),
    );
  }

  return (
    <div className="results-workspace">
      <div className="stat-grid">
        <Stat
          label="Total contacts"
          value={summary.total.toLocaleString()}
          hint={summary.segmentFileName}
          icon={<Icons.users />}
        />
        <Stat
          label="Phones found"
          value={summary.phoneFound.toLocaleString()}
          tone="ok"
          hint="Filled from master"
          icon={<Icons.phone />}
        />
        <Stat
          label="Phones missing"
          value={summary.phoneMissing.toLocaleString()}
          hint="No number on this list"
          icon={<Icons.alert />}
        />
        <Stat
          label="Emails not found"
          value={summary.emailsNotFound.toLocaleString()}
          tone="warn"
          hint="No master row"
          icon={<Icons.alert />}
        />
        <Stat
          label="Match rate"
          value={formatRate(summary.matchRate)}
          tone="accent"
          hint={`${summary.matched.toLocaleString()} matched`}
          icon={<Icons.percent />}
        />
      </div>

      <Card padding={false}>
        <div className="table-card">
          <CardHeader
            eyebrow="Output"
            title="Enriched list"
            meta={
              <>
                {rangeStart}–{rangeEnd} of {visible.length.toLocaleString()}
                {" · "}
                {summary.sharedColumnCount} shared
                {" · "}
                {summary.masterOnlyCount} from master
                {" · "}
                {summary.segmentOnlyCount} from segment
              </>
            }
            action={
              <div className="table-actions">
                <Button variant="secondary" onClick={onReset}>
                  New segment
                </Button>
                <Button
                  variant="secondary"
                  disabled={!canSave}
                  onClick={() => void handleSave()}
                >
                  Save to Supabase
                </Button>
                <Button icon={<Icons.download size={16} />} onClick={handleDownload}>
                  Export CSV
                </Button>
              </div>
            }
          />

          <div className="table-toolbar">
            <div className="seg">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`seg-btn ${filter === item.id ? "is-active" : ""}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="table-toolbar-end">
              <label className="search">
                <Icons.search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email, or phone"
                />
              </label>
              <Button icon={<Icons.download size={16} />} onClick={handleDownload}>
                Export CSV
              </Button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {previewHeaders.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, index) => (
                  <tr key={`${row.values[summary.emailColumn] ?? "row"}-${index}`}>
                    {previewHeaders.map((header) => {
                      const value = row.values[header] ?? "";
                      if (header === "Match Status") {
                        return (
                          <td key={header}>
                            <Badge tone={row.status === "matched" ? "ok" : "warn"}>{value}</Badge>
                          </td>
                        );
                      }
                      if (header === "Phone Status") {
                        return (
                          <td key={header}>
                            <Badge tone={row.phoneFound ? "ok" : "muted"}>
                              {value}
                            </Badge>
                          </td>
                        );
                      }
                      if (header === summary.phoneColumn || header.toLowerCase() === "phone") {
                        return (
                          <td key={header} className={value ? "phone-cell" : "phone-cell is-empty"}>
                            {value || "—"}
                          </td>
                        );
                      }
                      return <td key={header}>{value || "—"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <p>
              Showing {rangeStart}–{rangeEnd} of {visible.length.toLocaleString()} · 10 per page
            </p>
            <div className="pagination-controls">
              <Button
                variant="secondary"
                icon={<Icons.chevronLeft size={16} />}
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <span className="page-indicator">
                Page {currentPage} / {pageCount}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Next
                <Icons.chevronRight size={16} />
              </Button>
            </div>
          </div>
          {saveState ? <p className="settings-ok table-foot">{saveState}</p> : null}
          {saveError ? <p className="form-error table-foot">{saveError}</p> : null}
          <p className="table-foot">
            Same columns were merged. Unique columns from both files are kept. The master list stays saved
            for the next file. Save this enrich run if you want a history copy.
          </p>
        </div>
      </Card>
    </div>
  );
}
