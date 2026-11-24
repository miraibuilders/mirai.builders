"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  DataTable,
  KanbanBoard,
  KanbanHint,
  SubmitButton,
  type DataTableColumn,
  type KanbanCardData,
  type KanbanColumnData,
} from "@/ui";
import { moveLeadStage, triggerLeadScan } from "../actions";
import {
  isOverdue,
  LEAD_STAGES,
  tierForScore,
  topPainFlag,
  type LeadStage,
  type LeadViewRow,
} from "@/lib/lead-view";

const STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  checking: "Checking",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export function LeadsBoard({
  leads,
  view,
  segment,
  overdue,
  painSeverity,
  sort,
  direction,
  canEdit,
}: {
  leads: LeadViewRow[];
  view: string;
  segment: string;
  overdue: boolean;
  painSeverity: string;
  sort: string;
  direction: "asc" | "desc";
  canEdit: boolean;
}) {
  const router = useRouter();
  const [optimisticStage, setOptimisticStage] = useState<Record<string, LeadStage>>({});
  const [timedOut, setTimedOut] = useState(false);
  const hasPendingScan = leads.some((lead) =>
    lead.latestScanStatus === "queued" || lead.latestScanStatus === "running",
  );

  useEffect(() => {
    setOptimisticStage({});
  }, [leads]);

  useEffect(() => {
    if (!hasPendingScan) {
      setTimedOut(false);
      return;
    }
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt >= 30000) {
        setTimedOut(true);
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, 2000);
    return () => clearInterval(timer);
  }, [hasPendingScan, router]);

  const tableColumns = useMemo<DataTableColumn<LeadViewRow>[]>(() => [
    {
      id: "company",
      header: "Company",
      sortValue: (lead) => lead.company,
      cell: (lead) => (
        <span className="crm-company-cell">
          <Link href={`/leads/${lead.id}`}>{lead.company}</Link>
          <span className="ui-mono crm-company-url">{lead.websiteUrl}</span>
        </span>
      ),
    },
    {
      id: "segment",
      header: "Segment",
      sortValue: (lead) => lead.segment,
      cell: (lead) => <Badge tone="neutral">{lead.segment}</Badge>,
    },
    {
      id: "score",
      header: "Score",
      numeric: true,
      sortValue: (lead) => lead.score,
      cell: (lead) => (
        <span className="crm-score-cell">
          <span className="crm-score-track" aria-hidden="true">
            <span className="crm-score-fill" style={{ width: `${Math.max(0, Math.min(100, lead.score))}%` }} />
          </span>
          <span className="ui-mono">{lead.score}</span>
        </span>
      ),
    },
    { id: "tier", header: "Tier", cell: (lead) => <Badge tone={tierForScore(lead.score) === "A" ? "brand" : "neutral"}>{tierForScore(lead.score)}</Badge> },
    { id: "stage", header: "Stage", sortValue: (lead) => lead.stage, cell: (lead) => <Badge tone="info">{lead.stage}</Badge> },
    { id: "pain", header: "Pain", sortValue: (lead) => topPainFlag(lead.painFlags), cell: (lead) => <Badge tone="neutral">{topPainFlag(lead.painFlags)}</Badge> },
    {
      id: "nextStepDate",
      header: "Next date",
      sortValue: (lead) => lead.nextStepDate ?? "",
      cell: (lead) => (
        <span className={isOverdue(lead) ? "ui-mono crm-date crm-date-overdue" : "ui-mono crm-date"}>
          {lead.nextStepDate ?? "-"}
        </span>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (lead) => (
        <span className="crm-contact-cell">
          <strong>{lead.contactName ?? "-"}</strong>
          <span>{lead.contactEmail ?? "-"}</span>
          <span>{lead.contactPhone ?? "-"}</span>
        </span>
      ),
    },
  ], []);

  const initialSort = useMemo(() => {
    const known = new Set(["company", "segment", "score", "stage", "pain", "nextStepDate"]);
    return known.has(sort) ? { id: sort, dir: direction } : null;
  }, [sort, direction]);

  const kanbanColumns = useMemo<KanbanColumnData[]>(() =>
    LEAD_STAGES.map((stage) => {
      const columnLeads = leads.filter(
        (lead) => (optimisticStage[lead.id] ?? lead.stage) === stage,
      );
      const cards: KanbanCardData[] = columnLeads.map((lead) => {
        const currentStage = optimisticStage[lead.id] ?? lead.stage;
        return {
          id: lead.id,
          title: lead.company,
          label: `${lead.company}, score ${lead.score}`,
          badge: <span className="ui-kanban-score">Score: {lead.score}</span>,
          meta: (
            <>
              <span className="ui-kanban-tier">Tier: {tierForScore(lead.score)}</span>
              <span className="crm-card-score-track" aria-hidden="true">
                <span style={{ width: `${Math.max(0, Math.min(100, lead.score))}%` }} />
              </span>
              <span>Pain: {topPainFlag(lead.painFlags)}</span>
            </>
          ),
          attributes: {
            className: "lead-card",
            "data-lead-id": lead.id,
            "data-stage": currentStage,
            "data-scan-status": lead.latestScanStatus ?? "none",
          },
          actions: (
            <div className="lead-card-actions">
              <Link className="lead-card-link" href={`/leads/${lead.id}`}>Open</Link>
              {lead.latestScanStatus ? (
                <Badge tone={lead.latestScanStatus === "failed" ? "danger" : "info"}>
                  {lead.latestScanStatus}
                </Badge>
              ) : null}
              {canEdit ? (
                <form action={triggerLeadScan}>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <SubmitButton size="sm">Trigger scan</SubmitButton>
                </form>
              ) : null}
            </div>
          ),
        };
      });
      return {
        id: stage,
        title: STAGE_LABELS[stage],
        cards,
        attributes: { className: "leads-column", "data-stage": stage },
      };
    }),
  [leads, optimisticStage, canEdit]);

  const handleMove = async (leadId: string, fromColumnId: string, toColumnId: string) => {
    void fromColumnId;
    const toStage = toColumnId as LeadStage;
    setOptimisticStage((current) => ({ ...current, [leadId]: toStage }));
    try {
      const formData = new FormData();
      formData.set("leadId", leadId);
      formData.set("stage", toStage);
      await moveLeadStage(formData);
      router.refresh();
    } catch (cause) {
      setOptimisticStage((current) => {
        const next = { ...current };
        delete next[leadId];
        return next;
      });
      throw cause;
    }
  };

  if (view === "table") {
    return (
      <>
        {timedOut ? <p className="leads-timeout" role="status">scan did not complete — check the worker</p> : null}
        <DataTable
          rows={leads}
          columns={tableColumns}
          rowId={(lead) => lead.id}
          rowAttributes={(lead) => ({
            "data-lead-id": lead.id,
            "data-stage": optimisticStage[lead.id] ?? lead.stage,
          })}
          className="leads-table"
          caption={`Leads filtered by ${segment}${painSeverity !== "all" ? `, pain ${painSeverity}` : ""}${overdue ? ", overdue" : ""}`}
          initialSort={initialSort}
          searchPlaceholder="Search leads"
          getSearchText={(lead) => [
            lead.company,
            lead.segment,
            lead.stage,
            lead.score,
            tierForScore(lead.score),
            topPainFlag(lead.painFlags),
            lead.contactName,
            lead.contactEmail,
            lead.contactPhone,
          ].join(" ")}
          filters={[
            {
              id: "stage",
              label: "Stage",
              options: LEAD_STAGES.map((stage) => ({ label: STAGE_LABELS[stage], value: stage })),
              predicate: (lead, value) => lead.stage === value,
            },
          ]}
          emptyState={{
            title: "No leads match",
            description: "Adjust the segment, pain, overdue, or search controls to see more leads.",
          }}
          syncUrl
        />
      </>
    );
  }

  return (
    <>
      {timedOut ? <p className="leads-timeout" role="status">scan did not complete — check the worker</p> : null}
      <KanbanHint />
      <KanbanBoard
        columns={kanbanColumns}
        onMove={handleMove}
        className="leads-kanban"
      />
    </>
  );
}
