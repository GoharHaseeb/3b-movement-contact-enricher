import type { ReactNode } from "react";
import type { CsvTable } from "../../types";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import FileDrop from "../../components/ui/FileDrop";
import { Icons } from "../../components/ui/Icons";

type SourceCardProps = {
  kind: "master" | "segment";
  table: CsvTable | null;
  locked?: boolean;
  lockReason?: string;
  extraAction?: ReactNode;
  onFile: (file: File) => Promise<void>;
  onEmailColumn: (column: string) => void;
  onPhoneColumn: (column: string) => void;
  onClear?: () => void;
};

export default function SourceCard({
  kind,
  table,
  locked = false,
  lockReason,
  extraAction,
  onFile,
  onEmailColumn,
  onPhoneColumn,
  onClear,
}: SourceCardProps) {
  const isMaster = kind === "master";
  const title = isMaster ? "Master database" : "Segmented list";
  const eyebrow = isMaster ? "Source" : "Input";

  return (
    <Card>
      <CardHeader
        eyebrow={eyebrow}
        title={title}
        meta={
          isMaster
            ? "Complete member file. Used as the lookup table."
            : "Expired, intro, former, or any exported subset."
        }
        action={
          table ? (
            <Badge tone="ok">Ready</Badge>
          ) : locked ? (
            <Badge tone="muted">Waiting</Badge>
          ) : (
            <Badge>Needed</Badge>
          )
        }
      />

      {table ? (
        <div className="source-loaded">
          <div className="file-row">
            <div className="file-mark">
              <Icons.file />
            </div>
            <div className="file-copy">
              <strong>{table.fileName}</strong>
              <span>{table.rows.length.toLocaleString()} contacts · {table.headers.length} columns</span>
            </div>
            {onClear ? (
              <Button variant="ghost" onClick={onClear}>
                Replace
              </Button>
            ) : null}
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Email column</span>
              <select
                className="select"
                value={table.emailColumn}
                onChange={(event) => onEmailColumn(event.target.value)}
              >
                {table.headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Phone column</span>
              <select
                className="select"
                value={table.phoneColumn ?? ""}
                onChange={(event) => onPhoneColumn(event.target.value)}
              >
                <option value="">Auto-detect</option>
                {table.headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : (
        <FileDrop
          id={`${kind}-csv`}
          label={isMaster ? "master CSV" : "segment CSV"}
          disabled={locked}
          disabledReason={lockReason}
          hint={isMaster ? "Mindbody, Punchpass, or studio exports work." : "We’ll keep these rows and fill missing fields."}
          extraAction={extraAction}
          onFile={onFile}
        />
      )}
    </Card>
  );
}
