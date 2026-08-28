import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import { Icons } from "../../components/ui/Icons";
import { useEnrich } from "./EnrichContext";
import ResultsWorkspace from "./ResultsWorkspace";
import SourceCard from "./SourceCard";
import StagePills from "./StagePills";

export default function EnrichPage() {
  const {
    master,
    segment,
    summary,
    error,
    loadMaster,
    loadSegment,
    setMasterEmail,
    setMasterPhone,
    setSegmentEmail,
    setSegmentPhone,
    loadSamples,
    runMatch,
    resetWorkspace,
    clearSegment,
  } = useEnrich();

  const canMatch = Boolean(master && segment);
  const [editSources, setEditSources] = useState(true);

  useEffect(() => {
    if (summary) setEditSources(false);
    else setEditSources(true);
  }, [summary]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Enrich Contacts"
        subtitle="Load a master database, drop a segmented list, then match on email."
        extra={<StagePills master={Boolean(master)} segment={Boolean(segment)} results={Boolean(summary)} />}
        actions={
          <>
            <Button variant="secondary" onClick={() => void loadSamples()}>
              Load sample data
            </Button>
            {master ? (
              <Button variant="ghost" onClick={resetWorkspace}>
                Reset workspace
              </Button>
            ) : null}
          </>
        }
      />

      {error ? <p className="form-error banner-error">{error}</p> : null}

      {summary && !editSources ? (
        <div className="source-compact">
          <div>
            <p className="actionbar-kicker">Sources</p>
            <p>
              <strong>{master?.fileName}</strong> ({master?.rows.length.toLocaleString()} master)
              {" · "}
              <strong>{segment?.fileName}</strong> ({segment?.rows.length.toLocaleString()} segment)
            </p>
          </div>
          <Button variant="secondary" onClick={() => setEditSources(true)}>
            Edit files
          </Button>
        </div>
      ) : (
        <div className="source-grid">
          <SourceCard
            kind="master"
            table={master}
            extraAction={
              <Button variant="secondary" onClick={() => void loadSamples()}>
                Use dummy files
              </Button>
            }
            onFile={loadMaster}
            onEmailColumn={setMasterEmail}
            onPhoneColumn={setMasterPhone}
            onClear={resetWorkspace}
          />
          <SourceCard
            kind="segment"
            table={segment}
            locked={!master}
            lockReason="Load a master CSV first."
            onFile={loadSegment}
            onEmailColumn={setSegmentEmail}
            onPhoneColumn={setSegmentPhone}
            onClear={clearSegment}
          />
        </div>
      )}

      {!summary || editSources ? (
        <div className="actionbar">
          <div>
            <p className="actionbar-kicker">Match</p>
            <p className="actionbar-copy">
              {canMatch
                ? `${master?.rows.length.toLocaleString()} master · ${segment?.rows.length.toLocaleString()} segment · match by email`
                : "Both sources required before matching."}
            </p>
          </div>
          <Button icon={<Icons.enrich size={16} />} disabled={!canMatch} onClick={runMatch}>
            Match Contacts
          </Button>
        </div>
      ) : null}

      {summary ? (
        <ResultsWorkspace
          summary={summary}
          masterFileName={master?.fileName ?? null}
          onReset={clearSegment}
        />
      ) : null}
    </div>
  );
}
