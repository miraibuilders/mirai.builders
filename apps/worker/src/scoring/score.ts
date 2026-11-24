import { SCORING_CONFIG } from "./config.js";
import type { LeadReachability, LeadSegment, ScoreInput, ScoreResult, Tier } from "../scanner/types.js";

function technicalFlags(input: ScoreInput): string[] {
  const flags: string[] = [];
  if (input.scan.technologies.phpEol) flags.push("eol_php");
  if (input.scan.technologies.cms?.outdated) flags.push("outdated_cms");
  if (!input.scan.dns.dmarc) flags.push("missing_dmarc");
  if (!input.scan.tls.valid || input.scan.tls.expiring) flags.push("expiring_tls");
  if (input.scan.exposed.length > 0) flags.push("exposed_secrets");
  return flags;
}

function technicalDecayPoints(flags: string[]): number {
  const weights = SCORING_CONFIG.technicalDecay;
  let points = 0;
  if (flags.includes("eol_php")) points += weights.eolPhp;
  if (flags.includes("outdated_cms")) points += weights.outdatedCms;
  if (flags.includes("missing_dmarc")) points += weights.missingDmarc;
  if (flags.includes("expiring_tls")) points += weights.expiringTls;
  if (flags.includes("exposed_secrets")) points += weights.exposedSecrets;
  return Math.min(points, weights.max);
}

function segmentFitPoints(segment: LeadSegment): number {
  const config = SCORING_CONFIG.segmentFit;
  const targetSegments: readonly string[] = config.targetSegments;
  const adjacentSegments: readonly string[] = config.adjacentSegments;
  if (targetSegments.includes(segment)) return config.target;
  if (adjacentSegments.includes(segment)) return config.adjacent;
  return config.nonTarget;
}

function reachabilityPoints(reachability: LeadReachability): number {
  const config = SCORING_CONFIG.reachability;
  if (reachability === "referral") return config.referral;
  if (reachability === "mika_network") return config.mikaNetwork;
  return config.coldList;
}

function websitePresencePoints(input: ScoreInput): number {
  const config = SCORING_CONFIG.websitePresence;
  if (!input.lead.websitePresent) return config.none;
  if (input.scan.http.status >= 200 && input.scan.http.status < 400) return config.live;
  return config.parkedOrExpired;
}

function sizeProxyPoints(sizeProxy: number): number {
  const config = SCORING_CONFIG.sizeProxy;
  return Math.min(config.max, Math.max(0, sizeProxy) * config.pointsPerStaff);
}

function tierForScore(score: number): Tier {
  const thresholds = SCORING_CONFIG.thresholds;
  if (score >= thresholds.A) return "A";
  if (score >= thresholds.B) return "B";
  if (score >= thresholds.C) return "C";
  return "Reject";
}

export function scoreScan(input: ScoreInput): ScoreResult {
  const flags = technicalFlags(input);
  const breakdown = {
    technicalDecay: technicalDecayPoints(flags),
    segmentFit: segmentFitPoints(input.lead.segment),
    reachability: reachabilityPoints(input.lead.reachability),
    websitePresence: websitePresencePoints(input),
    sizeProxy: sizeProxyPoints(input.lead.sizeProxy),
    total: 0,
  };
  breakdown.total = Math.min(
    100,
    breakdown.technicalDecay +
      breakdown.segmentFit +
      breakdown.reachability +
      breakdown.websitePresence +
      breakdown.sizeProxy,
  );
  return {
    score: breakdown.total,
    tier: tierForScore(breakdown.total),
    painFlags: flags,
    breakdown,
  };
}
