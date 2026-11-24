import assert from "node:assert/strict";
import test from "node:test";
import { SCORING_CONFIG } from "./config.js";
import { scoreScan } from "./score.js";
import type { LeadScoreInput, ScanResult } from "../scanner/types.js";

function baseScan(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    scannedAt: "2026-11-22T00:00:00.000Z",
    url: "https://example.jp/",
    http: { status: 200, headers: {} },
    technologies: {
      server: null,
      poweredBy: null,
      via: null,
      cfRay: false,
      generators: [],
      phpVersion: null,
      phpEol: false,
      cms: null,
    },
    tls: {
      valid: true,
      daysLeft: 90,
      issuer: null,
      protocol: "TLSv1.3",
      sans: [],
      expiring: false,
    },
    dns: { a: true, aaaa: false, mx: true, spf: true, dmarc: true, dkimSelectors: [] },
    exposed: [],
    cookieNames: [],
    ...overrides,
  };
}

const baseLead: LeadScoreInput = {
  segment: "professional_office",
  reachability: "referral",
  websitePresent: true,
  sizeProxy: 5,
};

test("weights live in one config object with the required maxima", () => {
  assert.equal(SCORING_CONFIG.technicalDecay.max, 40);
  assert.equal(SCORING_CONFIG.segmentFit.max, 25);
  assert.equal(SCORING_CONFIG.reachability.max, 20);
  assert.equal(SCORING_CONFIG.websitePresence.max, 10);
  assert.equal(SCORING_CONFIG.sizeProxy.max, 5);
  assert.deepEqual(SCORING_CONFIG.thresholds, { A: 80, B: 60, C: 40 });
});

test("scores a clean target lead as B at 60", () => {
  const result = scoreScan({ scan: baseScan(), lead: baseLead });
  assert.equal(result.score, 60);
  assert.equal(result.tier, "B");
  assert.deepEqual(result.breakdown, {
    technicalDecay: 0,
    segmentFit: 25,
    reachability: 20,
    websitePresence: 10,
    sizeProxy: 5,
    total: 60,
  });
});

test("scores all technical decay signals and caps at 40", () => {
  const scan = baseScan({
    technologies: {
      server: "nginx",
      poweredBy: "PHP/7.4",
      via: null,
      cfRay: false,
      generators: ["WordPress 5.8"],
      phpVersion: "7.4",
      phpEol: true,
      cms: { name: "WordPress", version: "5.8", outdated: true },
    },
    tls: {
      valid: false,
      daysLeft: -1,
      issuer: null,
      protocol: null,
      sans: [],
      expiring: true,
    },
    dns: { a: true, aaaa: false, mx: true, spf: true, dmarc: false, dkimSelectors: [] },
    exposed: [".git/config"],
  });
  const result = scoreScan({ scan, lead: baseLead });
  assert.equal(result.breakdown.technicalDecay, 40);
  assert.equal(result.score, 100);
  assert.equal(result.tier, "A");
  assert.deepEqual(result.painFlags, [
    "eol_php",
    "outdated_cms",
    "missing_dmarc",
    "expiring_tls",
    "exposed_secrets",
  ]);
});

test("applies adjacent, non-target, reachability, presence, and size rules", () => {
  const adjacent = scoreScan({
    scan: baseScan(),
    lead: { ...baseLead, segment: "clinic", reachability: "mika_network", sizeProxy: 2 },
  });
  assert.equal(adjacent.breakdown.segmentFit, 12);
  assert.equal(adjacent.breakdown.reachability, 15);
  assert.equal(adjacent.breakdown.sizeProxy, 2);

  const nonTarget = scoreScan({
    scan: baseScan({ http: { status: 404, headers: {} } }),
    lead: { ...baseLead, segment: "other", reachability: "cold_list", websitePresent: false, sizeProxy: 99 },
  });
  assert.equal(nonTarget.breakdown.segmentFit, 0);
  assert.equal(nonTarget.breakdown.reachability, 5);
  assert.equal(nonTarget.breakdown.websitePresence, 0);
  assert.equal(nonTarget.breakdown.sizeProxy, 5);
  assert.equal(nonTarget.score, 10);
  assert.equal(nonTarget.tier, "Reject");
});

test("applies B and C threshold boundaries", () => {
  const b = scoreScan({
    scan: baseScan(),
    lead: { segment: "foreign_owned_smb", reachability: "referral", websitePresent: true, sizeProxy: 5 },
  });
  assert.equal(b.score, 60);
  assert.equal(b.tier, "B");

  const c = scoreScan({
    scan: baseScan(),
    lead: { segment: "foreign_owned_smb", reachability: "cold_list", websitePresent: true, sizeProxy: 0 },
  });
  assert.equal(c.score, 40);
  assert.equal(c.tier, "C");
});
