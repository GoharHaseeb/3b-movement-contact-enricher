import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { enrichSegment } from "../../lib/csv";
import { navigate } from "../../app/router";
import { getSupabaseConfig } from "../../lib/supabase";
import { loadStoredMaster, saveMaster, updateMasterColumns } from "../../lib/supabaseMaster";
import type { CsvTable, MatchSummary } from "../../types";
import { loadSample, readTable } from "./loadCsv";

type EnrichContextValue = {
  master: CsvTable | null;
  segment: CsvTable | null;
  summary: MatchSummary | null;
  error: string | null;
  notice: string | null;
  hydrating: boolean;
  replacingMaster: boolean;
  masterPersisted: boolean;
  loadMaster: (file: File) => Promise<void>;
  loadSegment: (file: File) => Promise<void>;
  setMasterEmail: (column: string) => void;
  setMasterPhone: (column: string) => void;
  setSegmentEmail: (column: string) => void;
  setSegmentPhone: (column: string) => void;
  loadSamples: () => Promise<void>;
  runMatch: () => void;
  clearResults: () => void;
  resetWorkspace: () => void;
  clearSegment: () => void;
  beginReplaceMaster: () => void;
  cancelReplaceMaster: () => void;
};

const EnrichContext = createContext<EnrichContextValue | null>(null);

export function EnrichProvider({ children }: { children: ReactNode }) {
  const [master, setMaster] = useState<CsvTable | null>(null);
  const [segment, setSegment] = useState<CsvTable | null>(null);
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(() => Boolean(getSupabaseConfig()));
  const [replacingMaster, setReplacingMaster] = useState(false);
  const masterRef = useRef<CsvTable | null>(null);

  useEffect(() => {
    masterRef.current = master;
  }, [master]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!getSupabaseConfig()) {
        setHydrating(false);
        return;
      }
      setHydrating(true);
      try {
        const stored = await loadStoredMaster();
        if (cancelled) return;
        if (stored) {
          setMaster(stored);
          setNotice(
            `Loaded saved master · ${stored.rows.length.toLocaleString()} contacts. Upload a list to fill missing phones.`,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load the saved master list.");
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistColumns = useCallback((next: CsvTable) => {
    if (!next.persistedId) return;
    void updateMasterColumns(next.persistedId, next.emailColumn, next.phoneColumn).catch((err) => {
      setError(err instanceof Error ? err.message : "Could not update saved master columns.");
    });
  }, []);

  const loadMaster = useCallback(async (file: File) => {
    setError(null);
    const table = await readTable(file);
    setMaster(table);
    setSummary(null);
    setReplacingMaster(false);

    if (!getSupabaseConfig()) {
      setNotice("Master loaded in this session only. Connect Supabase in Settings to keep it.");
      return;
    }

    setNotice("Saving master list to Supabase…");
    try {
      const saved = await saveMaster(table);
      setMaster({ ...table, persistedId: saved.id });
      setNotice(
        `Saved ${saved.rowCount.toLocaleString()} contacts. You only need to upload this master file once.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the master list.");
      setNotice(null);
    }
  }, []);

  const loadSegment = useCallback(async (file: File) => {
    setError(null);
    const table = await readTable(file);
    setSegment(table);
    setSummary(null);
  }, []);

  const loadSamples = useCallback(async () => {
    setError(null);
    try {
      const [masterTable, segmentTable] = await Promise.all([
        loadSample("/samples/master-contacts.csv", "master-contacts.csv"),
        loadSample("/samples/expired-members.csv", "expired-members.csv"),
      ]);
      setMaster(masterTable);
      setSegment(segmentTable);
      setSummary(null);
      setReplacingMaster(false);
      setNotice("Dummy files loaded for this session only. They were not saved to Supabase.");
      navigate("enrich");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sample files.");
    }
  }, []);

  const loadDemoResults = useCallback(async () => {
    setError(null);
    try {
      const [masterTable, segmentTable] = await Promise.all([
        loadSample("/samples/master-contacts.csv", "master-contacts.csv"),
        loadSample("/samples/expired-members.csv", "expired-members.csv"),
      ]);
      setMaster(masterTable);
      setSegment(segmentTable);
      setSummary(enrichSegment(masterTable, segmentTable));
      navigate("enrich");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load sample files.");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") void loadDemoResults();
  }, [loadDemoResults]);

  useEffect(() => {
    if (!master || !segment) return;
    setSummary(enrichSegment(master, segment));
  }, [master, segment]);

  const value = useMemo<EnrichContextValue>(
    () => ({
      master,
      segment,
      summary,
      error,
      notice,
      hydrating,
      replacingMaster,
      masterPersisted: Boolean(master?.persistedId),
      loadMaster,
      loadSegment,
      setMasterEmail: (column) => {
        setMaster((current) => {
          if (!current) return current;
          const next = { ...current, emailColumn: column };
          persistColumns(next);
          return next;
        });
      },
      setMasterPhone: (column) => {
        setMaster((current) => {
          if (!current) return current;
          const next = { ...current, phoneColumn: column || null };
          persistColumns(next);
          return next;
        });
      },
      setSegmentEmail: (column) => {
        setSegment((current) => (current ? { ...current, emailColumn: column } : current));
      },
      setSegmentPhone: (column) => {
        setSegment((current) => (current ? { ...current, phoneColumn: column || null } : current));
      },
      loadSamples,
      runMatch: () => {
        if (!master || !segment) return;
        setSummary(enrichSegment(master, segment));
      },
      clearResults: () => setSummary(null),
      resetWorkspace: () => {
        if (!masterRef.current?.persistedId) setMaster(null);
        setSegment(null);
        setSummary(null);
        setError(null);
        setReplacingMaster(false);
        setNotice(
          masterRef.current?.persistedId
            ? "List cleared. Saved master is still ready for the next file."
            : null,
        );
      },
      clearSegment: () => {
        setSegment(null);
        setSummary(null);
      },
      beginReplaceMaster: () => setReplacingMaster(true),
      cancelReplaceMaster: () => setReplacingMaster(false),
    }),
    [master, segment, summary, error, notice, hydrating, replacingMaster, loadMaster, loadSegment, loadSamples, persistColumns],
  );

  return <EnrichContext.Provider value={value}>{children}</EnrichContext.Provider>;
}

export function useEnrich(): EnrichContextValue {
  const ctx = useContext(EnrichContext);
  if (!ctx) throw new Error("useEnrich must be used inside EnrichProvider");
  return ctx;
}
