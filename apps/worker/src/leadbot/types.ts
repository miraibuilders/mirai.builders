export type DncKind = "corporate_number" | "domain" | "phone" | "name_key";

export type QueryClient = {
  query(sql: string, values?: unknown[]): Promise<unknown>;
};

export type DncCandidate = {
  kind: DncKind;
  value: string;
};

export function queryRows(result: unknown): unknown[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: unknown }).rows;
    return Array.isArray(rows) ? rows : [];
  }
  return [];
}
