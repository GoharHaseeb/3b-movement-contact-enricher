import type { CsvTable } from "../types";
import { hasPhoneValue, normalizeEmail } from "./csv";
import { createSupabase } from "./supabase";

const CONTACT_PAGE = 1000;
const INSERT_CHUNK = 400;

export type MasterMeta = {
  id: string;
  fileName: string;
  rowCount: number;
  phoneCount: number;
  updatedAt: string;
};

type ContactRow = {
  email: string;
  phone: string | null;
  payload: unknown;
};

function isMissingTable(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("master_sources") || lower.includes("schema cache") || lower.includes("does not exist");
}

function missingTableError(): Error {
  return new Error(
    "Master storage is not set up yet. Open Settings and run supabase/schema.sql in the Supabase SQL editor.",
  );
}

function asHeaders(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function asPayload(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const next: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    next[key] = entry == null ? "" : String(entry);
  }
  return next;
}

async function insertChunks(
  rows: Array<{
    source_id: string;
    email: string;
    phone: string;
    payload: Record<string, string>;
  }>,
): Promise<void> {
  const client = createSupabase();
  if (!client) throw new Error("Supabase is not connected. Add keys in Settings.");
  for (let index = 0; index < rows.length; index += INSERT_CHUNK) {
    const chunk = rows.slice(index, index + INSERT_CHUNK);
    const { error } = await client.from("master_contacts").insert(chunk);
    if (error) throw new Error(error.message);
  }
}

export async function getActiveMasterMeta(): Promise<MasterMeta | null> {
  const client = createSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("master_sources")
    .select("id, file_name, row_count, phone_count, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  return {
    id: data.id,
    fileName: data.file_name,
    rowCount: data.row_count,
    phoneCount: data.phone_count,
    updatedAt: data.updated_at,
  };
}

export async function loadStoredMaster(): Promise<CsvTable | null> {
  const client = createSupabase();
  if (!client) return null;

  const { data: source, error: sourceError } = await client
    .from("master_sources")
    .select("id, file_name, email_column, phone_column, headers, row_count, phone_count, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sourceError) {
    if (isMissingTable(sourceError.message)) throw missingTableError();
    throw new Error(sourceError.message);
  }
  if (!source) return null;

  const contacts: ContactRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await client
      .from("master_contacts")
      .select("email, phone, payload")
      .eq("source_id", source.id)
      .range(from, from + CONTACT_PAGE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as ContactRow[];
    contacts.push(...page);
    if (page.length < CONTACT_PAGE) break;
    from += CONTACT_PAGE;
  }

  const headers = asHeaders(source.headers);
  const rows = contacts.map((contact) => {
    const payload = asPayload(contact.payload);
    if (source.email_column && contact.email && !payload[source.email_column]) {
      payload[source.email_column] = contact.email;
    }
    if (source.phone_column && contact.phone && !payload[source.phone_column]) {
      payload[source.phone_column] = contact.phone;
    }
    return payload;
  });

  return {
    fileName: source.file_name,
    headers,
    rows,
    emailColumn: source.email_column,
    phoneColumn: source.phone_column,
    persistedId: source.id,
  };
}

export async function saveMaster(table: CsvTable): Promise<MasterMeta> {
  const client = createSupabase();
  if (!client) throw new Error("Supabase is not connected. Add keys in Settings.");

  const seen = new Set<string>();
  const contacts: Array<{ email: string; phone: string; payload: Record<string, string> }> = [];
  let phoneCount = 0;

  for (const row of table.rows) {
    const email = normalizeEmail(row[table.emailColumn]);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const phone = table.phoneColumn && hasPhoneValue(row[table.phoneColumn]) ? row[table.phoneColumn] : "";
    if (hasPhoneValue(phone)) phoneCount += 1;
    contacts.push({ email, phone, payload: row });
  }

  const { data: source, error: sourceError } = await client
    .from("master_sources")
    .insert({
      file_name: table.fileName,
      email_column: table.emailColumn,
      phone_column: table.phoneColumn,
      headers: table.headers,
      row_count: contacts.length,
      phone_count: phoneCount,
    })
    .select("id, file_name, row_count, phone_count, updated_at")
    .single();

  if (sourceError || !source) {
    if (sourceError && isMissingTable(sourceError.message)) throw missingTableError();
    throw new Error(sourceError?.message ?? "Could not save the master list.");
  }

  try {
    await insertChunks(
      contacts.map((contact) => ({
        source_id: source.id,
        email: contact.email,
        phone: contact.phone,
        payload: contact.payload,
      })),
    );
  } catch (err) {
    await client.from("master_sources").delete().eq("id", source.id);
    throw err;
  }

  await client.from("master_sources").delete().neq("id", source.id);

  return {
    id: source.id,
    fileName: source.file_name,
    rowCount: source.row_count,
    phoneCount: source.phone_count,
    updatedAt: source.updated_at,
  };
}

export async function updateMasterColumns(
  sourceId: string,
  emailColumn: string,
  phoneColumn: string | null,
): Promise<void> {
  const client = createSupabase();
  if (!client) return;
  const { error } = await client
    .from("master_sources")
    .update({
      email_column: emailColumn,
      phone_column: phoneColumn,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sourceId);
  if (error) throw new Error(error.message);
}
