"use client";

import { useMemo, useState } from "react";
import { Badge, Button, InlineBanner } from "@/ui";
import { DataTable, type DataTableColumn, type DataTableFilter } from "@/ui/data-table";

interface DemoRow {
  id: string;
  company: string;
  segment: string;
  score: number;
  stage: string;
  nextStepDate: string;
  tier: string;
}

const segments = ["professional_office", "retail", "manufacturing"];
const stages = ["New", "Contacted", "Checking", "Quoted", "Won", "Lost"];
const tiers = ["A", "B", "C"];

const rows: DemoRow[] = Array.from({ length: 100 }, (_, index) => ({
  id: `row-${index + 1}`,
  company: `Company ${String(index + 1).padStart(3, "0")}`,
  segment: segments[index % segments.length],
  score: 30 + ((index * 7) % 70),
  stage: stages[index % stages.length],
  nextStepDate: `2026-11-${String((index % 28) + 1).padStart(2, "0")}`,
  tier: tiers[index % tiers.length],
}));

const columns: DataTableColumn<DemoRow>[] = [
  { id: "company", header: "Company", cell: (row) => row.company, sortValue: (row) => row.company },
  { id: "segment", header: "Segment", cell: (row) => row.segment, sortValue: (row) => row.segment },
  {
    id: "score",
    header: "Score",
    cell: (row) => row.score,
    sortValue: (row) => row.score,
    align: "right",
    numeric: true,
  },
  {
    id: "tier",
    header: "Tier",
    cell: (row) => <Badge tone={row.tier === "A" ? "success" : row.tier === "B" ? "info" : "warning"} icon="star">Tier {row.tier}</Badge>,
    sortValue: (row) => row.tier,
  },
  {
    id: "stage",
    header: "Stage",
    cell: (row) => <Badge icon="chevron-right">{row.stage}</Badge>,
    sortValue: (row) => row.stage,
  },
  { id: "date", header: "Next step", cell: (row) => row.nextStepDate, sortValue: (row) => row.nextStepDate, numeric: true, align: "right" },
];

const filters: DataTableFilter<DemoRow>[] = [
  {
    id: "segment",
    label: "Segment",
    options: segments.map((value) => ({ label: value, value })),
    predicate: (row, value) => row.segment === value,
  },
  {
    id: "stage",
    label: "Stage",
    options: stages.map((value) => ({ label: value, value })),
    predicate: (row, value) => row.stage === value,
  },
  {
    id: "tier",
    label: "Tier",
    options: tiers.map((value) => ({ label: value, value })),
    predicate: (row, value) => row.tier === value,
  },
];

export default function DataTableDemoPage() {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [lastBulkAction, setLastBulkAction] = useState("none");
  const [large, setLarge] = useState(false);

  const data = useMemo(() => {
    if (showEmpty) return [];
    if (!large) return rows;
    return Array.from({ length: 250 }, (_, index) => ({
      ...rows[index % rows.length],
      id: `large-${index + 1}`,
      company: `Large ${String(index + 1).padStart(3, "0")}`,
    }));
  }, [showEmpty, large]);

  return (
    <main className="ui-demo-page" style={{ maxWidth: "1120px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "32px", lineHeight: 1.25 }}>Data table demo</h1>
      <div className="ui-demo-inline" style={{ margin: "16px 0" }}>
        <Button variant="secondary" onClick={() => setLoading((value) => !value)}>
          {loading ? "Stop loading" : "Show loading"}
        </Button>
        <Button variant="secondary" onClick={() => setShowError((value) => !value)}>
          {showError ? "Clear error" : "Show error"}
        </Button>
        <Button variant="secondary" onClick={() => setShowEmpty((value) => !value)}>
          {showEmpty ? "Restore rows" : "Show empty"}
        </Button>
        <Button variant="secondary" onClick={() => setLarge((value) => !value)}>
          {large ? "Use 100 rows" : "Use 250 rows"}
        </Button>
      </div>
      {showError ? <InlineBanner tone="warning">Error state is active.</InlineBanner> : null}
      <p aria-live="polite">Last bulk action: {lastBulkAction}</p>
      <DataTable
        rows={data}
        columns={columns}
        caption="Demo companies"
        searchPlaceholder="Search companies"
        filters={filters}
        selectable
        bulkActions={[
          { label: "Mark reviewed", onAction: (ids) => setLastBulkAction(`reviewed ${ids.length}`) },
          { label: "Add to DNC", tone: "destructive", onAction: (ids) => setLastBulkAction(`dnc ${ids.length}`) },
        ]}
        loading={loading}
        error={showError ? "Demo server error" : null}
        onRetry={() => setShowError(false)}
        emptyState={{ title: "No companies", description: "Create a lead to see it here." }}
      />
    </main>
  );
}
