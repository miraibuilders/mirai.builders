import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { getCrmActor } from "@/lib/crm-auth";
import { tierForScore } from "@/lib/lead-view";
import { Badge, EmptyState, PageHeader, SectionHeader } from "@/ui";
import "../leads.css";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const actor = await getCrmActor();
  if (!actor || actor.role !== "admin") redirect("/?notice=CRM_FORBIDDEN");

  const rows = await getDb()
    .select({
      id: leads.id,
      company: leads.company,
      stage: leads.stage,
      score: leads.score,
      nextStepDate: leads.nextStepDate,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt));

  const today = new Date().toISOString().slice(0, 10);
  const reviewRows = rows.filter((lead) =>
    lead.stage === "new" || (lead.nextStepDate !== null && lead.nextStepDate < today),
  );
  const summary = [
    { label: "Total leads", index: "01", value: rows.length },
    { label: "New stage", index: "02", value: rows.filter((lead) => lead.stage === "new").length },
    {
      label: "Overdue",
      index: "03",
      value: rows.filter((lead) => lead.nextStepDate !== null && lead.nextStepDate < today).length,
    },
    {
      label: "Tier A",
      index: "04",
      value: rows.filter((lead) => tierForScore(lead.score) === "A").length,
    },
  ];

  return (
    <div className="lead-review-page">
      <PageHeader
        title="Review queue"
        description="Admin-only leads that are new or have an overdue next step."
      />
      <div className="crm-kpi-strip" aria-label="Review queue metrics">
        {summary.map((item) => (
          <div className="crm-kpi-card" key={item.index}>
            <div className="crm-kpi-label">
              <span>{item.label}</span>
              <span className="ui-mono">{item.index}</span>
            </div>
            <div className="crm-kpi-value">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="crm-panel-grid">
        <section className="crm-panel">
          <SectionHeader title="Queue health" description={`${reviewRows.length} lead(s) in the queue.`} />
          <p className="ui-mono crm-panel-metric">{Math.round((reviewRows.length / Math.max(rows.length, 1)) * 100)}% flagged</p>
        </section>
        <section className="crm-panel">
          <SectionHeader title="Review policy" description="New stage or overdue next step." />
          <p className="ui-mono crm-panel-metric">Cutoff {today}</p>
        </section>
      </div>
      <SectionHeader title="Needs review" description={`${reviewRows.length} lead(s) in the queue.`} />
      {reviewRows.length === 0 ? (
        <EmptyState
          icon="check"
          title="Queue clear"
          description="No new or overdue leads need review right now."
        />
      ) : (
        <div className="ui-table-viewport ui-table-viewport--plain">
          <table className="ui-table">
          <caption className="ui-sr-only">Leads needing review</caption>
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col">Stage</th>
              <th scope="col">Score</th>
              <th scope="col">Next date</th>
            </tr>
          </thead>
          <tbody>
            {reviewRows.map((lead) => (
              <tr key={lead.id}>
                <td><Link href={`/leads/${lead.id}`}>{lead.company}</Link></td>
                <td><Badge tone="info">{lead.stage}</Badge></td>
                <td>
                  <span className="crm-score-cell">
                    <span className="crm-score-track" aria-hidden="true">
                      <span className="crm-score-fill" style={{ width: `${Math.max(0, Math.min(100, lead.score))}%` }} />
                    </span>
                    <span className="ui-mono">{lead.score}</span>
                  </span>
                </td>
                <td className="ui-mono">{lead.nextStepDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
