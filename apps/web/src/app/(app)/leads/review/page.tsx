import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { getCrmActor } from "@/lib/crm-auth";
import { Badge, EmptyState, PageHeader, SectionHeader } from "@/ui";

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

  return (
    <>
      <PageHeader
        title="Review queue"
        description="Admin-only leads that are new or have an overdue next step."
      />
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
                <td>{lead.score}</td>
                <td>{lead.nextStepDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </>
  );
}
