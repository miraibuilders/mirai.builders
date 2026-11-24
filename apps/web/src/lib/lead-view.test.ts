import assert from "node:assert/strict";
import test from "node:test";
import {
  filterLeads,
  isOverdue,
  painSeverity,
  sortLeads,
  tierForScore,
  type LeadViewRow,
} from "./lead-view";

function row(overrides: Partial<LeadViewRow> = {}): LeadViewRow {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    company: "Example Clinic",
    websiteUrl: "https://example.jp",
    segment: "clinic",
    stage: "new",
    score: 72,
    painFlags: ["missing_dmarc"],
    nextStep: "[NEXT_STEP_PLACEHOLDER]",
    nextStepDate: "2026-11-20",
    preferredTemplate: "branded",
    reachability: "cold_list",
    sizeProxy: 2,
    latestScanStatus: "done",
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    ...overrides,
  };
}

test("tier thresholds and pain severity helpers", () => {
  assert.equal(tierForScore(80), "A");
  assert.equal(tierForScore(79), "B");
  assert.equal(tierForScore(40), "C");
  assert.equal(tierForScore(39), "Reject");
  assert.equal(painSeverity([]), "none");
  assert.equal(painSeverity(["a"]), "low");
  assert.equal(painSeverity(["a", "b"]), "medium");
  assert.equal(painSeverity(["a", "b", "c"]), "high");
});

test("filters segment, overdue, and pain severity", () => {
  const rows = [
    row(),
    row({ id: "2", segment: "auto_shop", painFlags: ["a", "b", "c"], nextStepDate: "2099-01-01" }),
    row({ id: "3", stage: "won", nextStepDate: "2020-01-01" }),
  ];
  assert.deepEqual(filterLeads(rows, {
    segment: "clinic",
    overdue: false,
    painSeverity: "all",
    sort: "score",
    direction: "desc",
  }).map((item) => item.id), ["00000000-0000-4000-8000-000000000001", "3"]);
  assert.deepEqual(filterLeads(rows, {
    segment: "all",
    overdue: true,
    painSeverity: "all",
    sort: "score",
    direction: "desc",
  }).map((item) => item.id), ["00000000-0000-4000-8000-000000000001"]);
  assert.deepEqual(filterLeads(rows, {
    segment: "all",
    overdue: false,
    painSeverity: "high",
    sort: "score",
    direction: "desc",
  }).map((item) => item.id), ["2"]);
  assert.equal(isOverdue(row({ stage: "won", nextStepDate: "2020-01-01" })), false);
});

test("sorts lead rows", () => {
  const rows = [row({ id: "1", score: 40 }), row({ id: "2", score: 90 })];
  assert.deepEqual(sortLeads(rows, "score", "asc").map((item) => item.id), ["1", "2"]);
  assert.deepEqual(sortLeads(rows, "score", "desc").map((item) => item.id), ["2", "1"]);
});
