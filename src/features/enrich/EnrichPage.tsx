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
    notice,
    hydrating,
    replacingMaster,
    masterPersisted,
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
    beginReplaceMaster,
    cancelReplaceMaster,
  } = useEnrich();

  const canMatch = Boolean(master && segment);
  const showMasterDrop = !hydrating && (!master || replacingMaster);
  const [editSources, setEditSources] = useState(true);

  useEffect(() => {
    if (summary) setEditSources(false);
    else setEditSources(true);
  }, [summary]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Enrich Contacts"
        subtitle={
          masterPersisted
            ? "Master list is saved. Upload a segment to fill missing phones."
            : "Save the studio master once, then drop lists that need numbers filled in."
        }
        extra={<StagePills master={Boolean(master)} segment={Boolean(segment)} results={Boolean(summary)} />}
        actions={
          <>
            <Button variant="secondary" onClick={() => void loadSamples()}>
              Load sample data
            </Button>
            {segment || summary ? (
              <Button variant="ghost" onClick={resetWorkspace}>
                New list
              </Button>
            ) : null}
          </>
        }
      />

      {hydrating ? <p className="settings-ok">Loading saved master from Supabase…</p> : null}
      {notice ? <p className="settings-ok">{notice}</p> : null}
      {error ? <p className="form-error banner-error">{error}</p> : null}

      {summary && !editSources ? (
        <div className="source-compact">
          <div>
            <p className="actionbar-kicker">{masterPersisted ? "Saved master" : "Sources"}</p>
            <p>
              <strong>{master?.fileName}</strong> ({master?.rows.length.toLocaleString()} master)
              {" · "}
              <strong>{segment?.fileName}</strong> ({segment?.rows.length.toLocaleString()} list)
            </p>
          </div>
          <Button variant="secondary" onClick={() => setEditSources(true)}>
            Change list
          </Button>
        </div>
      ) : (
        <>
          {master && !replacingMaster ? (
            <div className="master-saved">
              <div className="file-row">
                <div className="file-mark">
                  <Icons.database />
                </div>
                <div className="file-copy">
                  <strong>{master.fileName}</strong>
                  <span>
                    {master.rows.length.toLocaleString()} contacts saved
                    {masterPersisted ? " in Supabase" : " in this session"}
                    {" · email "}
                    {master.emailColumn}
                  </span>
                </div>
                <Button variant="ghost" onClick={beginReplaceMaster}>
                  Replace master
                </Button>
              </div>
            </div>
          ) : null}

          <div className={`source-grid ${showMasterDrop ? "" : "is-single"}`.trim()}>
            {showMasterDrop ? (
              <SourceCard
                kind="master"
                table={null}
                persisted={masterPersisted}
                extraAction={
                  master ? (
                    <Button variant="secondary" onClick={cancelReplaceMaster}>
                      Keep current master
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => void loadSamples()}>
                      Use dummy files
                    </Button>
                  )
                }
                onFile={loadMaster}
                onEmailColumn={setMasterEmail}
                onPhoneColumn={setMasterPhone}
              />
            ) : null}
            <SourceCard
              kind="segment"
              table={segment}
              locked={!master}
              lockReason={hydrating ? "Loading saved master…" : "Save a master CSV first."}
              persisted={false}
              onFile={loadSegment}
              onEmailColumn={setSegmentEmail}
              onPhoneColumn={setSegmentPhone}
              onClear={clearSegment}
              clearLabel="Change list"
            />
          </div>
        </>
      )}

      {!summary || editSources ? (
        <div className="actionbar">
          <div>
            <p className="actionbar-kicker">Match</p>
            <p className="actionbar-copy">
              {canMatch
                ? `Ready · ${master?.rows.length.toLocaleString()} master · ${segment?.rows.length.toLocaleString()} list · match by email`
                : master
                  ? "Upload a list. Matching starts as soon as the file is in."
                  : "Save a master CSV once, then upload lists to fill missing phones."}
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
