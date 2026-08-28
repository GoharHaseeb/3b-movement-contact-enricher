import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const STORAGE_KEY = "3b-movement-supabase";

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getEnvConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getStoredConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SupabaseConfig>;
    if (!parsed.url || !parsed.anonKey) return null;
    return { url: parsed.url, anonKey: parsed.anonKey };
  } catch {
    return null;
  }
}

export function getSupabaseConfig(): SupabaseConfig | null {
  return getEnvConfig() ?? getStoredConfig();
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createSupabase(config = getSupabaseConfig()): SupabaseClient | null {
  if (!config) return null;
  return createClient(config.url, config.anonKey);
}

export async function testSupabaseConnection(config: SupabaseConfig): Promise<string> {
  const client = createClient(config.url, config.anonKey);
  const { error } = await client.from("enrich_runs").select("id").limit(1);
  if (error) throw new Error(error.message);
  return "Connected. enrich_runs table is reachable.";
}
