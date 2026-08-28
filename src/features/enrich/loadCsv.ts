import {
  detectEmailColumn,
  detectPhoneColumn,
  parseCsv,
} from "../../lib/csv";
import type { CsvTable } from "../../types";

export async function readTable(file: File): Promise<CsvTable> {
  const text = await file.text();
  const parsed = parseCsv(file.name, text);
  const emailColumn = detectEmailColumn(parsed.headers);
  if (!emailColumn) {
    throw new Error("No email column was found. The CSV needs a member email field.");
  }
  return {
    ...parsed,
    emailColumn,
    phoneColumn: detectPhoneColumn(parsed.headers),
  };
}

export async function loadSample(path: string, fileName: string): Promise<CsvTable> {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Sample file could not be loaded.");
  const text = await response.text();
  const parsed = parseCsv(fileName, text);
  const emailColumn = detectEmailColumn(parsed.headers);
  if (!emailColumn) throw new Error("Sample file is missing an email column.");
  return {
    ...parsed,
    emailColumn,
    phoneColumn: detectPhoneColumn(parsed.headers),
  };
}
