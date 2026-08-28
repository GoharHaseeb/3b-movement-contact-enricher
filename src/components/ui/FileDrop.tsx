import { useRef, useState, type DragEvent, type ReactNode } from "react";
import Button from "./Button";
import { Icons } from "./Icons";

type FileDropProps = {
  id: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
  hint?: string;
  extraAction?: ReactNode;
  onFile: (file: File) => Promise<void> | void;
};

export default function FileDrop({
  id,
  label,
  disabled = false,
  disabledReason,
  hint,
  extraAction,
  onFile,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file || disabled) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      return;
    }
    setError(null);
    try {
      await onFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this CSV.");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setActive(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div
      className={`drop ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setActive(false)}
      onDrop={onDrop}
    >
      <div className="drop-icon">
        <Icons.upload size={20} />
      </div>
      <p className="drop-title">{disabled ? disabledReason : `Drop ${label} here`}</p>
      {hint && !disabled ? <p className="drop-hint">{hint}</p> : null}
      <div className="drop-actions">
        <Button disabled={disabled} onClick={() => inputRef.current?.click()}>
          Upload CSV
        </Button>
        {extraAction}
      </div>
      <input
        id={id}
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        disabled={disabled}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
