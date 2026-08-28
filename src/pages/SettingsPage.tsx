import { useState } from "react";
import Button from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import {
  clearStoredConfig,
  getEnvConfig,
  getStoredConfig,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from "../lib/supabase";
import schemaSql from "../../supabase/schema.sql?raw";

export default function SettingsPage() {
  const envConfig = getEnvConfig();
  const stored = getStoredConfig();
  const [url, setUrl] = useState(stored?.url ?? envConfig?.url ?? "");
  const [anonKey, setAnonKey] = useState(stored?.anonKey ?? envConfig?.anonKey ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const connected = Boolean(getSupabaseConfig());

  async function handleCopySchema() {
    await navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleTest() {
    setError(null);
    setStatus("Testing connection…");
    try {
      const message = await testSupabaseConnection({ url: url.trim(), anonKey: anonKey.trim() });
      saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
      setStatus(message);
    } catch (err) {
      setStatus(null);
      setError(err instanceof Error ? err.message : "Connection failed.");
    }
  }

  function handleClear() {
    clearStoredConfig();
    if (!getEnvConfig()) {
      setUrl("");
      setAnonKey("");
    }
    setStatus("Cleared saved keys from this browser.");
    setError(null);
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Settings"
        subtitle="Connect the internal Supabase project. Never paste the service_role key here."
        extra={connected ? <Badge tone="ok">Connected</Badge> : <Badge tone="muted">Not connected</Badge>}
      />

      <Card>
        <CardHeader
          eyebrow="Database"
          title="Supabase"
          meta={envConfig ? "Using environment variables. Browser keys are a fallback." : "Saved in this browser until you add a .env file."}
        />
        <div className="settings-form">
          <label className="field">
            <span>Project URL</span>
            <input
              className="select"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://xxxx.supabase.co"
              autoComplete="off"
            />
          </label>
          <label className="field">
            <span>Anon public key</span>
            <input
              className="select"
              value={anonKey}
              onChange={(event) => setAnonKey(event.target.value)}
              placeholder="eyJhbGciOi…"
              autoComplete="off"
            />
          </label>
          <div className="table-actions">
            <Button onClick={() => void handleTest()} disabled={!url.trim() || !anonKey.trim()}>
              Save & test
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              Clear saved keys
            </Button>
          </div>
          {status ? <p className="settings-ok">{status}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </div>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Setup"
          title="Run the SQL schema once"
          meta="SQL Editor in your Supabase project → paste this schema"
        />
        <ol className="setup-list">
          <li>Open the SQL Editor in the connected Supabase project.</li>
          <li>Paste the schema (includes saved master tables) and run it once.</li>
          <li>Come back here and use Save & test if the master tables were just added.</li>
        </ol>
        <div className="table-actions">
          <Button variant="secondary" onClick={() => void handleCopySchema()}>
            {copied ? "Schema copied" : "Copy schema SQL"}
          </Button>
        </div>
        <p className="notice">
          The studio master list is stored once in Supabase. After that you only upload lists that need
          missing phones filled. Matching still runs in the browser. Do not commit real keys or member CSVs.
        </p>
      </Card>
    </div>
  );
}
