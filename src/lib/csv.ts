import Papa from "papaparse";
import type { CsvTable, EnrichedRow, MatchSummary } from "../types";

const EMAIL_HINTS = [
  "email address",
  "emailaddress",
  "e-mail",
  "email",
  "member email",
  "primary email",
  "mail",
];

const PHONE_HINTS = [
  "phone number",
  "phonenumber",
  "mobile phone",
  "cell phone",
  "telephone",
  "mobile",
  "phone",
  "cell",
];

const NAME_HINTS = [
  "customer name",
  "full name",
  "member name",
  "client name",
  "contact name",
  "first name",
  "last name",
  "name",
];

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[_]+/g, " ");
}

function scoreHeader(header: string, hints: string[]): number {
  const normalized = normalizeHeader(header);
  const index = hints.findIndex(
    (hint) => normalized === hint || normalized.includes(hint),
  );
  if (index === -1) return -1;
  return hints.length - index;
}

export function detectColumn(headers: string[], hints: string[]): string | null {
  let best: { header: string; score: number } | null = null;
  for (const header of headers) {
    const score = scoreHeader(header, hints);
    if (score < 0) continue;
    if (!best || score > best.score) best = { header, score };
  }
  return best?.header ?? null;
}

export function detectEmailColumn(headers: string[]): string | null {
  return detectColumn(headers, EMAIL_HINTS);
}

export function detectPhoneColumn(headers: string[]): string | null {
  return detectColumn(headers, PHONE_HINTS);
}

export function normalizeEmail(value: string | undefined): string {
  if (!value) return "";
  let email = value.replace(/^mailto:/i, "").trim().toLowerCase();
  const bracket = email.match(/<([^>]+)>/);
  if (bracket?.[1]) email = bracket[1].trim().toLowerCase();
  return email;
}

function emailLookupKeys(email: string): string[] {
  const keys = [email];
  const at = email.lastIndexOf("@");
  if (at <= 0) return keys;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.includes("+")) {
    keys.push(`${local.split("+")[0]}@${domain}`);
  }
  return keys;
}

function findMasterRow(
  masterByEmail: Map<string, Record<string, string>>,
  email: string,
): Record<string, string> | undefined {
  for (const key of emailLookupKeys(email)) {
    const row = masterByEmail.get(key);
    if (row) return row;
  }
  return undefined;
}

export function hasPhoneValue(value: string | undefined): boolean {
  return Boolean(value && /\d/.test(value));
}

function stringify(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function parseCsv(fileName: string, text: string): Omit<CsvTable, "emailColumn" | "phoneColumn"> {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
  });

  const headers = (parsed.meta.fields ?? []).filter(Boolean);
  const rows = parsed.data
    .map((row) => {
      const next: Record<string, string> = {};
      for (const header of headers) {
        next[header] = stringify(row[header]);
      }
      return next;
    })
    .filter((row) => Object.values(row).some((value) => value.length > 0));

  if (headers.length === 0 || rows.length === 0) {
    throw new Error("This CSV appears to be empty. Please check the file and try again.");
  }

  return { fileName, headers, rows };
}

export function toCsv(headers: string[], rows: Record<string, string>[]): string {
  return Papa.unparse({
    fields: headers,
    data: rows.map((row) => headers.map((header) => row[header] ?? "")),
  });
}

export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type ColumnPlan = {
  output: string;
  key: string;
  segmentHeader: string | null;
  masterHeader: string | null;
};

function columnKey(header: string): string {
  if (scoreHeader(header, EMAIL_HINTS) >= 0) return "__email__";
  if (scoreHeader(header, PHONE_HINTS) >= 0) return "__phone__";
  return normalizeHeader(header);
}

function buildColumnPlan(master: CsvTable, segment: CsvTable): ColumnPlan[] {
  const plans: ColumnPlan[] = [];
  const byKey = new Map<string, ColumnPlan>();

  for (const header of segment.headers) {
    const key = columnKey(header);
    if (byKey.has(key)) continue;
    const plan: ColumnPlan = {
      output: key === "__phone__" ? "Phone" : header,
      key,
      segmentHeader: header,
      masterHeader: null,
    };
    byKey.set(key, plan);
    plans.push(plan);
  }

  for (const header of master.headers) {
    const key = columnKey(header);
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.masterHeader) existing.masterHeader = header;
      continue;
    }
    const plan: ColumnPlan = {
      output: key === "__phone__" ? "Phone" : header,
      key,
      segmentHeader: null,
      masterHeader: header,
    };
    byKey.set(key, plan);
    plans.push(plan);
  }

  if (!byKey.has("__phone__")) {
    plans.push({
      output: "Phone",
      key: "__phone__",
      segmentHeader: null,
      masterHeader: null,
    });
  }

  return plans;
}

function readByKey(
  row: Record<string, string> | undefined,
  headers: string[],
  key: string,
): string {
  if (!row) return "";
  for (const header of headers) {
    if (columnKey(header) !== key) continue;
    const value = stringify(row[header]);
    if (value) return value;
  }
  return "";
}

function phoneFromRow(
  row: Record<string, string> | undefined,
  headers: string[],
  preferred: string | null,
): string {
  if (!row) return "";
  if (preferred && hasPhoneValue(row[preferred])) return row[preferred];
  const detected = detectColumn(headers, PHONE_HINTS);
  if (detected && hasPhoneValue(row[detected])) return row[detected];
  for (const header of headers) {
    if (scoreHeader(header, PHONE_HINTS) >= 0 && hasPhoneValue(row[header])) {
      return row[header];
    }
  }
  return "";
}

export function enrichSegment(master: CsvTable, segment: CsvTable): MatchSummary {
  const masterByEmail = new Map<string, Record<string, string>>();
  for (const row of master.rows) {
    const email = normalizeEmail(row[master.emailColumn]);
    if (!email || masterByEmail.has(email)) continue;
    masterByEmail.set(email, row);
  }

  const masterPhoneHeader = master.phoneColumn ?? detectPhoneColumn(master.headers);
  const segmentPhoneHeader = segment.phoneColumn ?? detectPhoneColumn(segment.headers);
  const plans = buildColumnPlan(master, segment);
  const statusHeaders = ["Match Status", "Phone Status"].filter(
    (header) => !plans.some((plan) => plan.output === header),
  );
  const headers = [...plans.map((plan) => plan.output), ...statusHeaders];
  const emailOutput = plans.find((plan) => plan.key === "__email__")?.output ?? segment.emailColumn;
  const phoneHeader = "Phone";
  const rows: EnrichedRow[] = [];

  let matched = 0;
  let phoneFound = 0;
  let phoneMissing = 0;
  let emailsNotFound = 0;

  for (const source of segment.rows) {
    const values: Record<string, string> = {};
    const email = normalizeEmail(source[segment.emailColumn]);
    const masterRow = email ? findMasterRow(masterByEmail, email) : undefined;

    for (const plan of plans) {
      if (plan.key === "__phone__") continue;
      const fromSegment = readByKey(source, segment.headers, plan.key);
      const fromMaster = readByKey(masterRow, master.headers, plan.key);
      values[plan.output] = fromSegment || fromMaster;
    }

    const resolvedPhone =
      phoneFromRow(source, segment.headers, segmentPhoneHeader) ||
      phoneFromRow(masterRow, master.headers, masterPhoneHeader);
    values[phoneHeader] = resolvedPhone;
    const found = hasPhoneValue(resolvedPhone);
    if (found) phoneFound += 1;
    else phoneMissing += 1;

    if (!masterRow) {
      emailsNotFound += 1;
      values["Match Status"] = "Email not found";
      values["Phone Status"] = found ? "Present (unmatched)" : "Missing";
      rows.push({
        values,
        status: "email-not-found",
        phoneFound: found,
      });
      continue;
    }

    matched += 1;
    values["Match Status"] = "Matched";
    values["Phone Status"] = found ? "Found" : "Missing";

    rows.push({
      values,
      status: "matched",
      phoneFound: found,
    });
  }

  const total = rows.length;
  return {
    total,
    matched,
    phoneFound,
    phoneMissing,
    emailsNotFound,
    matchRate: total === 0 ? 0 : (matched / total) * 100,
    headers,
    rows,
    segmentFileName: segment.fileName,
    emailColumn: emailOutput,
    phoneColumn: phoneHeader,
    sharedColumnCount: plans.filter((plan) => plan.segmentHeader && plan.masterHeader).length,
    masterOnlyCount: plans.filter((plan) => !plan.segmentHeader && plan.masterHeader).length,
    segmentOnlyCount: plans.filter((plan) => plan.segmentHeader && !plan.masterHeader).length,
  };
}

export function pickNameHeaders(headers: string[]): string[] {
  return headers.filter((header) => scoreHeader(header, NAME_HINTS) >= 0);
}

export function exportHeadersFor(summary: MatchSummary): string[] {
  const ordered: string[] = [];
  const add = (header: string | null | undefined) => {
    if (header && summary.headers.includes(header) && !ordered.includes(header)) {
      ordered.push(header);
    }
  };

  for (const header of pickNameHeaders(summary.headers)) add(header);
  add(summary.emailColumn);
  add(summary.phoneColumn);
  add("Phone");
  for (const header of summary.headers) {
    if (header === "Match Status" || header === "Phone Status") continue;
    add(header);
  }
  add("Match Status");
  add("Phone Status");
  return ordered;
}

export function previewHeadersFor(summary: MatchSummary): string[] {
  return exportHeadersFor(summary);
}

export function buildDownloadName(segmentFileName: string): string {
  const base = segmentFileName.replace(/\.csv$/i, "").replace(/[^\w.-]+/g, "-");
  const stamp = new Date().toISOString().slice(0, 10);
  return `3B-Movement-enriched-${base}-${stamp}.csv`;
}
