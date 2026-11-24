export type LeadSegment =
  | "professional_office"
  | "clinic"
  | "local_business"
  | "manufacturer"
  | "other"
  | "foreign_owned_smb"
  | "auto_shop"
  | "inbound_tourism";

export type LeadReachability = "referral" | "mika_network" | "cold_list";

export type Tier = "A" | "B" | "C" | "Reject";

export type ScanResult = {
  scannedAt: string;
  url: string;
  http: {
    status: number;
    headers: Record<string, string>;
  };
  technologies: {
    server: string | null;
    poweredBy: string | null;
    via: string | null;
    cfRay: boolean;
    generators: string[];
    phpVersion: string | null;
    phpEol: boolean;
    cms: {
      name: string;
      version: string | null;
      outdated: boolean;
    } | null;
  };
  tls: {
    valid: boolean;
    daysLeft: number | null;
    issuer: string | null;
    protocol: string | null;
    sans: string[];
    expiring: boolean;
  };
  dns: {
    a: boolean;
    aaaa: boolean;
    mx: boolean;
    spf: boolean;
    dmarc: boolean;
    dkimSelectors: string[];
  };
  exposed: string[];
  cookieNames: string[];
};

export type LeadScoreInput = {
  segment: LeadSegment;
  reachability: LeadReachability;
  websitePresent: boolean;
  sizeProxy: number;
};

export type ScoreInput = {
  scan: ScanResult;
  lead: LeadScoreInput;
};

export type ScoreBreakdown = {
  technicalDecay: number;
  segmentFit: number;
  reachability: number;
  websitePresence: number;
  sizeProxy: number;
  total: number;
};

export type ScoreResult = {
  score: number;
  tier: Tier;
  painFlags: string[];
  breakdown: ScoreBreakdown;
};

export type StoredScanResult = ScanResult & {
  score: ScoreResult;
};

export type DetailPage = {
  path: string;
  status: number;
  headers: Record<string, string>;
  generators: string[];
};

export type DetailScanResult = ScanResult & {
  pages: DetailPage[];
};

export type StoredDetailScanResult = StoredScanResult & {
  pages: DetailPage[];
};

export type FetchedPage = {
  status: number;
  headers: Record<string, string>;
  body: string;
};

export type ScanSources = {
  fetchPage(url: string): Promise<FetchedPage>;
  probePath(url: string, path: string): Promise<number>;
  readTls(url: string): Promise<ScanResult["tls"]>;
  readDns(url: string): Promise<ScanResult["dns"]>;
};
