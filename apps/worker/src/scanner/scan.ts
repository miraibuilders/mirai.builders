import { scanWebsite as scanWithSources, scanWebsiteDetailed as detailedScanWithSources } from "./checks.js";
import type { DetailScanResult, ScanSources, ScanResult } from "./types.js";

export function scanWebsite(url: string, sources?: ScanSources): Promise<ScanResult> {
  return sources ? scanWithSources(url, sources) : scanWithSources(url);
}

export function scanWebsiteDetailed(url: string, sources?: ScanSources): Promise<DetailScanResult> {
  return sources ? detailedScanWithSources(url, sources) : detailedScanWithSources(url);
}
