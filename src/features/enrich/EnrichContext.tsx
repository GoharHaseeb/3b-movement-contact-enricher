import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { enrichSegment } from "../../lib/csv";
import { navigate } from "../../app/router";
import type { CsvTable, MatchSummary } from "../../types";
import { loadSample, readTable } from "./loadCsv";

type EnrichContextValue = {
  master: CsvTable | null;
  segment: CsvTable | null;
  summary: MatchSummary | null;
  error: string | null;
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
};

const EnrichContext = createContext<EnrichContextValue | null>(null);

export function EnrichProvider({ children }: { children: ReactNode }) {
  const [master, setMaster] = useState<CsvTable | null>(null);
  const [segment, setSegment] = useState<CsvTable | null>(null);
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMaster = useCallback(async (file: File) => {
    setError(null);
    const table = await readTable(file);
    setMaster(table);
    setSegment(null);
    setSummary(null);
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

  const value = useMemo<EnrichContextValue>(
    () => ({
      master,
      segment,
      summary,
      error,
      loadMaster,
      loadSegment,
      setMasterEmail: (column) => {
        setMaster((current) => (current ? { ...current, emailColumn: column } : current));
        setSummary(null);
      },
      setMasterPhone: (column) => {
        setMaster((current) => (current ? { ...current, phoneColumn: column || null } : current));
        setSummary(null);
      },
      setSegmentEmail: (column) => {
        setSegment((current) => (current ? { ...current, emailColumn: column } : current));
        setSummary(null);
      },
      setSegmentPhone: (column) => {
        setSegment((current) => (current ? { ...current, phoneColumn: column || null } : current));
        setSummary(null);
      },
      loadSamples,
      runMatch: () => {
        if (!master || !segment) return;
        setSummary(enrichSegment(master, segment));
      },
      clearResults: () => setSummary(null),
      resetWorkspace: () => {
        setMaster(null);
        setSegment(null);
        setSummary(null);
        setError(null);
      },
      clearSegment: () => {
        setSegment(null);
        setSummary(null);
      },
    }),
    [master, segment, summary, error, loadMaster, loadSegment, loadSamples],
  );

  return <EnrichContext.Provider value={value}>{children}</EnrichContext.Provider>;
}

export function useEnrich(): EnrichContextValue {
  const ctx = useContext(EnrichContext);
  if (!ctx) throw new Error("useEnrich must be used inside EnrichProvider");
  return ctx;
}
