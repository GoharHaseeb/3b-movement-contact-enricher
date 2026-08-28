export type CsvTable = {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  emailColumn: string;
  phoneColumn: string | null;
  persistedId?: string;
};

export type MatchStatus = "matched" | "email-not-found";

export type EnrichedRow = {
  values: Record<string, string>;
  status: MatchStatus;
  phoneFound: boolean;
};

export type MatchSummary = {
  total: number;
  matched: number;
  phoneFound: number;
  phoneMissing: number;
  emailsNotFound: number;
  matchRate: number;
  headers: string[];
  rows: EnrichedRow[];
  segmentFileName: string;
  emailColumn: string;
  phoneColumn: string;
  sharedColumnCount: number;
  masterOnlyCount: number;
  segmentOnlyCount: number;
};

export type ResultFilter = "all" | "matched" | "phone-missing" | "not-found";
