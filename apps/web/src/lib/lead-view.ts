export const LEAD_STAGES = ["new", "contacted", "checking", "quoted", "won", "lost"] as const;
export const LEAD_SEGMENTS = [
  "foreign_owned_smb",
  "professional_office",
  "auto_shop",
  "inbound_tourism",
  "clinic",
  "local_business",
  "manufacturer",
  "other",
] as const;
export const REACHABILITY_OPTIONS = ["referral", "mika_network", "cold_list"] as const;
export const TEMPLATE_OPTIONS = ["branded", "mono"] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export type LeadViewRow = {
  id: string;
  company: string;
  websiteUrl: string;
  segment: string;
  stage: string;
  score: number;
  painFlags: string[];
  nextStep: string | null;
  nextStepDate: string | null;
  preferredTemplate: string | null;
  reachability: string;
  sizeProxy: number;
  latestScanStatus: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export type LeadFilters = {
  segment: string;
  overdue: boolean;
  painSeverity: string;
  sort: string;
  direction: "asc" | "desc";
};

export function tierForScore(score: number): "A" | "B" | "C" | "Reject" {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "Reject";
}

export function topPainFlag(flags: string[]): string {
  return flags[0] ?? "None";
}

export function painSeverity(flags: string[]): "none" | "low" | "medium" | "high" {
  if (flags.length === 0) return "none";
  if (flags.length === 1) return "low";
  if (flags.length === 2) return "medium";
  return "high";
}

export function isOverdue(row: LeadViewRow, today = new Date().toISOString().slice(0, 10)): boolean {
  if (!row.nextStepDate || row.stage === "won" || row.stage === "lost") return false;
  return row.nextStepDate < today;
}

export function filterLeads(rows: LeadViewRow[], filters: LeadFilters): LeadViewRow[] {
  return rows.filter((row) => {
    if (filters.segment !== "all" && row.segment !== filters.segment) return false;
    if (filters.overdue && !isOverdue(row)) return false;
    if (filters.painSeverity !== "all" && painSeverity(row.painFlags) !== filters.painSeverity) return false;
    return true;
  });
}

export function sortLeads(rows: LeadViewRow[], sort: string, direction: "asc" | "desc"): LeadViewRow[] {
  const key = (["company", "segment", "score", "stage", "nextStepDate"] as const).includes(
    sort as "company",
  )
    ? sort
    : "score";
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const a = left[key as keyof LeadViewRow] ?? "";
    const b = right[key as keyof LeadViewRow] ?? "";
    if (typeof a === "number" && typeof b === "number") return (a - b) * factor;
    return String(a).localeCompare(String(b)) * factor;
  });
}

export function buildLeadsUrl(options: {
  view?: string;
  segment?: string;
  overdue?: boolean;
  painSeverity?: string;
  sort?: string;
  direction?: "asc" | "desc";
}): string {
  const params = new URLSearchParams();
  if (options.view) params.set("view", options.view);
  if (options.segment && options.segment !== "all") params.set("segment", options.segment);
  if (options.overdue) params.set("overdue", "1");
  if (options.painSeverity && options.painSeverity !== "all") params.set("pain", options.painSeverity);
  if (options.sort) params.set("sort", options.sort);
  if (options.direction) params.set("dir", options.direction);
  const query = params.toString();
  return query ? `/leads?${query}` : "/leads";
}
