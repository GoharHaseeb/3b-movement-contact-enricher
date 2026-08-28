import type { MatchSummary } from "../types";
import { createSupabase } from "./supabase";

export type SavedRun = {
  id: string;
  created_at: string;
  segment_file: string | null;
  master_file: string | null;
  total: number;
  matched: number;
  phones_found: number;
  phones_missing: number;
  emails_not_found: number;
  match_rate: number;
};

export async function saveEnrichRun(
  summary: MatchSummary,
  masterFileName: string | null,
): Promise<{ runId: string; rowCount: number }> {
  const client = createSupabase();
  if (!client) throw new Error("Supabase is not connected. Add keys in Settings.");

  const { data: run, error: runError } = await client
    .from("enrich_runs")
    .insert({
      segment_file: summary.segmentFileName,
      master_file: masterFileName,
      total: summary.total,
      matched: summary.matched,
      phones_found: summary.phoneFound,
      phones_missing: summary.phoneMissing,
      emails_not_found: summary.emailsNotFound,
      match_rate: Number(summary.matchRate.toFixed(2)),
    })
    .select("id")
    .single();

  if (runError || !run) throw new Error(runError?.message ?? "Could not save enrich run.");

  const rows = summary.rows.map((row) => ({
    run_id: run.id,
    email: row.values[summary.emailColumn] || row.values.Email || "",
    phone: row.values[summary.phoneColumn] || row.values.Phone || "",
    customer_name:
      row.values["Customer Name"] ||
      [row.values["First Name"], row.values["Last Name"]].filter(Boolean).join(" ").trim() ||
      "",
    match_status: row.values["Match Status"] || row.status,
    phone_status: row.values["Phone Status"] || (row.phoneFound ? "Found" : "Missing"),
    payload: row.values,
  }));

  const { error: rowError } = await client.from("enrich_rows").insert(rows);
  if (rowError) throw new Error(rowError.message);

  return { runId: run.id, rowCount: rows.length };
}

export async function listRecentRuns(limit = 8): Promise<SavedRun[]> {
  const client = createSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from("enrich_runs")
    .select(
      "id, created_at, segment_file, master_file, total, matched, phones_found, phones_missing, emails_not_found, match_rate",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedRun[];
}
