import { safeShortText } from "./scanner/allowlist.js";
import type { DetailScanResult } from "./scanner/types.js";

function text(value: string | null | undefined, fallback: string): string {
  return safeShortText(value, 200) ?? fallback;
}

function list(values: string[], fallback: string): string {
  return values.length > 0 ? values.map((value) => `- ${text(value, fallback)}`).join("\n") : `- ${fallback}`;
}

export function buildDetailBrief(result: DetailScanResult): string {
  const cms = result.technologies.cms;
  const cmsLabel = cms ? `${cms.name}${cms.version ? ` ${cms.version}` : ""}` : "CMS not identified";
  const tlsLabel = result.tls.valid
    ? result.tls.expiring
      ? `valid but expiring in ${result.tls.daysLeft ?? 0} days`
      : "valid"
    : "not valid or not available";
  const dnsLabel = [
    result.dns.mx ? "MX present" : "MX missing",
    result.dns.spf ? "SPF present" : "SPF missing",
    result.dns.dmarc ? "DMARC present" : "DMARC missing",
  ].join(", ");

  const checkedPaths = result.pages
    .map((page) => `- ${safeShortText(page.path, 160)} — HTTP ${page.status}`)
    .join("\n");
  const generators = [...new Set(result.pages.flatMap((page) => page.generators))].sort();

  return [
    "# Internal detail brief",
    `Generated: ${result.scannedAt}`,
    `Target: ${safeShortText(result.url, 200)}`,
    "",
    "## What the scanner found",
    `- Root HTTP status: ${result.http.status}`,
    `- Server: ${text(result.technologies.server, "not disclosed")}`,
    `- CMS fingerprint: ${text(cmsLabel, "not identified")}`,
    `- PHP fingerprint: ${text(result.technologies.phpVersion, "not disclosed")}${result.technologies.phpEol ? " (EOL)" : ""}`,
    `- TLS: ${tlsLabel}`,
    `- DNS: ${dnsLabel}`,
    `- Cookie names observed: ${result.cookieNames.length > 0 ? result.cookieNames.map((name) => text(name, "name")).join(", ") : "none"}`,
    `- Exposed paths: ${result.exposed.length > 0 ? result.exposed.map((value) => text(value, "path")).join(", ") : "none"}`,
    "- Detail paths checked (headers/meta only):",
    checkedPaths,
    "- Generator fingerprints from detail paths:",
    list(generators, "none"),
    "",
    "## What it implies",
    `- ${result.technologies.phpEol || (cms?.outdated ?? false) ? "Observed platform fingerprints indicate ageing components worth checking before any replacement work." : "No strong ageing-platform fingerprint was observed in the allowed signals."}`,
    `- ${!result.dns.dmarc ? "Missing DMARC suggests email authentication for this domain may need attention." : "Email authentication signals are present; verify configuration during the call."}`,
    `- ${result.exposed.length > 0 ? "Exposed-path probes returned a positive signal; confirm safely with the owner rather than treating it as a breach." : "No positive exposed-path signal was returned by the allowlisted probes."}`,
    "",
    "## Suggested talking points for Mika's call",
    "1. Ask how the current website and email settings are maintained, then relate the answer to the observed platform, TLS, and DNS signals.",
    "2. Explain that the External Check is a calm first pass based on public technical signals, not a security audit or a judgement about staff.",
    "3. Offer a concrete next step: confirm the aging-component and email-authentication findings, then credit the ¥29,800 check against follow-up work.",
    "",
  ].join("\n");
}
