import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { contactRequests, documents, leadActivities, leads, scans } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { tierForScore, topPainFlag } from "@/lib/lead-view";
import { ButtonLink, InlineBanner, PageHeader, SectionHeader, SubmitButton } from "@/ui";
import { deleteLead, triggerLeadDetailScan, triggerLeadScan } from "../actions";
import { ActivityForm } from "./activity-form";
import { addActivity } from "./actions";
import "../leads.css";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const actor = await getCrmActor();
  if (!actor) redirect("/");
  const { id } = await params;
  const { notice } = await searchParams;
  if (!UUID_PATTERN.test(id)) notFound();

  const [lead] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) notFound();

  const canEdit = canEnqueueScan(actor.role);
  const [activities, docs, scanRows, contacts] = await Promise.all([
    getDb()
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, id))
      .orderBy(desc(leadActivities.createdAt)),
    getDb()
      .select({ id: documents.id, type: documents.type, templateVariant: documents.templateVariant })
      .from(documents)
      .where(eq(documents.leadId, id))
      .orderBy(desc(documents.createdAt)),
    getDb()
      .select({ id: scans.id, kind: scans.kind, status: scans.status, createdAt: scans.createdAt })
      .from(scans)
      .where(eq(scans.leadId, id))
      .orderBy(desc(scans.createdAt))
      .limit(1),
    getDb()
      .select()
      .from(contactRequests)
      .where(eq(contactRequests.leadId, id))
      .orderBy(desc(contactRequests.createdAt)),
  ]);

  const contact = contacts[0];
  const latestScan = scanRows[0];

  return (
    <div className="lead-detail-page">
      <PageHeader
        title={lead.company}
        description={`${lead.segment} / Stage: ${lead.stage}`}
        actions={<ButtonLink href="/leads" variant="secondary">Back to leads</ButtonLink>}
      />
      {notice ? <p className="lead-notice">Scan notice: {notice}</p> : null}
      {!canEdit ? <InlineBanner tone="danger" title="Forbidden">This lead is read-only for your role.</InlineBanner> : null}

      <section className="lead-overview">
        <SectionHeader title="Overview" />
        <dl className="lead-detail-list">
          <dt>Website</dt><dd>{lead.websiteUrl}</dd>
          <dt>Segment</dt><dd>{lead.segment}</dd>
          <dt>Reachability</dt><dd>{lead.reachability}</dd>
          <dt>Size proxy</dt><dd>{lead.sizeProxy}</dd>
          <dt>Score</dt><dd>{lead.score} / {tierForScore(lead.score)}</dd>
          <dt>Pain</dt><dd>{topPainFlag(lead.painFlags)}</dd>
          <dt>Stage</dt><dd>{lead.stage}</dd>
          <dt>Preferred template</dt><dd>{lead.preferredTemplate ?? "branded"}</dd>
          <dt>Next step</dt><dd>{lead.nextStep ?? "-"}</dd>
          <dt>Next step date</dt><dd>{lead.nextStepDate ?? "-"}</dd>
        </dl>
      </section>

      {contact ? (
        <section className="lead-section">
          <SectionHeader title="Contact request" />
          <p>{contact.name} / {contact.company}</p>
          <p>{contact.email} / {contact.phone}</p>
          <p>{contact.message}</p>
        </section>
      ) : null}

      {canEdit ? (
        <section className="lead-section">
          <SectionHeader title="Actions" />
          <div className="lead-actions">
            <form action={triggerLeadScan}>
              <input type="hidden" name="leadId" value={lead.id} />
              <SubmitButton>Trigger scan</SubmitButton>
            </form>
            <form action={triggerLeadDetailScan}>
              <input type="hidden" name="leadId" value={lead.id} />
              <SubmitButton variant="secondary">Analyse in detail</SubmitButton>
            </form>
            <ButtonLink href={`/leads/${lead.id}/edit`}>Edit</ButtonLink>
            <ButtonLink href="/documents" variant="secondary">Documents</ButtonLink>
          </div>
          <SectionHeader title="Add activity" />
          <ActivityForm leadId={lead.id} action={addActivity} />
          {actor.role === "admin" ? (
            <form action={deleteLead}>
              <input type="hidden" name="leadId" value={lead.id} />
              <SubmitButton variant="destructive">Delete lead</SubmitButton>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="lead-section">
        <SectionHeader title="Scans" />
        <p>{latestScan ? `${latestScan.kind} / ${latestScan.status} / ${latestScan.id}` : "No scans yet"}</p>
      </section>

      {canEdit && lead.detailBriefMd ? (
        <section className="lead-detail-brief-section">
          <SectionHeader title="Detail brief (internal)" />
          <pre className="lead-detail-brief">
            {lead.detailBriefMd.split("\n").slice(0, 10).join("\n")}
          </pre>
        </section>
      ) : null}

      <section className="lead-section">
        <SectionHeader title="Documents" />
        {docs.length === 0 ? (
          <p>No documents linked to this lead.</p>
        ) : (
          <ul>
            {docs.map((doc) => (
              <li key={doc.id}>{doc.type} / {doc.templateVariant} / {doc.id}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="lead-section">
        <SectionHeader title="Activity log" />
        <div className="ui-table-viewport ui-table-viewport--plain">
          <table className="lead-activity-list ui-table">
          <caption className="ui-sr-only">Lead activity history</caption>
          <thead>
            <tr>
              <th>When</th>
              <th>Note</th>
              <th>Next step</th>
              <th>Next date</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={4}>No activities yet.</td></tr>
            ) : activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.createdAt.toISOString()}</td>
                <td>{activity.note}</td>
                <td>{activity.nextStep ?? "-"}</td>
                <td>{activity.nextStepDate ?? "-"}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>
      <p><Link href="/leads">Back to leads</Link></p>
    </div>
  );
}
