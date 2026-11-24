import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { contactRequests, documents, leadActivities, leads, posts } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { computeDashboardSnapshot } from "@/lib/dashboard-metrics";
import { Badge, ButtonLink, PageHeader, SectionHeader } from "@/ui";
import "./dashboard.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const actor = await getCrmActor();
  if (!actor) redirect("/");

  const [leadRows, requestRows, documentRows, postRows, activityRows] = await Promise.all([
    getDb()
      .select({
        id: leads.id,
        company: leads.company,
        stage: leads.stage,
        score: leads.score,
        nextStep: leads.nextStep,
        nextStepDate: leads.nextStepDate,
      })
      .from(leads)
      .orderBy(desc(leads.createdAt)),
    getDb()
      .select({ id: contactRequests.id, leadId: contactRequests.leadId })
      .from(contactRequests)
      .orderBy(desc(contactRequests.createdAt)),
    getDb()
      .select({ id: documents.id })
      .from(documents)
      .orderBy(desc(documents.createdAt)),
    getDb()
      .select({ id: posts.id, status: posts.status })
      .from(posts)
      .orderBy(desc(posts.createdAt)),
    getDb()
      .select({
        id: leadActivities.id,
        company: leads.company,
        note: leadActivities.note,
        createdAt: leadActivities.createdAt,
      })
      .from(leadActivities)
      .innerJoin(leads, eq(leads.id, leadActivities.leadId))
      .orderBy(desc(leadActivities.createdAt))
      .limit(4),
  ]);

  const snapshot = computeDashboardSnapshot({
    leads: leadRows,
    contactRequests: requestRows,
    documents: documentRows,
    posts: postRows,
    activities: activityRows,
  });

  const kpis = [
    { label: "Total leads", index: "01", value: snapshot.totalLeads },
    { label: "Tier A priority", index: "02", value: snapshot.tierA },
    { label: "Overdue follow-up", index: "03", value: snapshot.overdue },
    { label: "Unpromoted inquiries", index: "04", value: snapshot.unpromotedRequests },
    { label: "PDF documents", index: "05", value: snapshot.documentCount },
  ];

  const canUseCrm = actor.role !== "user";
  const canUseCms = actor.role === "admin" || actor.role === "editor";
  const canUseAdmin = actor.role === "admin";

  return (
    <div className="dashboard-page container">
      <PageHeader
        title="Dashboard"
        description="Internal entry point for CRM and content workflows."
        actions={
          canEnqueueScan(actor.role) ? (
            <ButtonLink href="/leads/new" size="sm">
              New lead
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="dash-kpi-strip" aria-label="Dashboard metrics">
        {kpis.map((kpi) => (
          <div className="dash-kpi-card" key={kpi.index}>
            <div className="dash-kpi-label">
              <span>{kpi.label}</span>
              <span className="ui-mono">{kpi.index}</span>
            </div>
            <div className="dash-kpi-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      <section className="dash-card dash-workspaces">
        <SectionHeader title="Workspaces" description="Open a workspace to continue." />
        <nav className="dash-nav cms-nav" aria-label="Workspaces">
          {canUseCrm ? <ButtonLink href="/leads">Leads</ButtonLink> : null}
          {canUseCrm ? (
            <ButtonLink href="/contact-requests" variant="secondary">
              Contact requests
            </ButtonLink>
          ) : null}
          {canUseCrm ? (
            <ButtonLink href="/documents" variant="secondary">
              Documents
            </ButtonLink>
          ) : null}
          {canUseCms ? (
            <ButtonLink href="/cms" variant="secondary">
              CMS
            </ButtonLink>
          ) : null}
          {canUseAdmin ? (
            <ButtonLink href="/leads/review" variant="secondary">
              Review queue
            </ButtonLink>
          ) : null}
          {canUseAdmin ? (
            <ButtonLink href="/leads/sources" variant="secondary">
              Sources
            </ButtonLink>
          ) : null}
        </nav>
      </section>

      <div className="dash-split">
        <section className="dash-card dash-stack">
          <SectionHeader
            title="Focus queue"
            description="Leads awaiting initial discovery or overdue for next action."
          />
          {snapshot.focusQueue.length === 0 ? (
            <p className="dash-empty">No focus items right now.</p>
          ) : (
            <div className="dash-list">
              {snapshot.focusQueue.map((item) => (
                <div className="dash-list-row" key={item.lead.id}>
                  <div className="dash-list-main">
                    <strong>{item.lead.company}</strong>
                    <span className="ui-mono dash-list-meta">
                      {item.lead.nextStep ?? "No next step"} · Due {item.lead.nextStepDate ?? "not set"}
                    </span>
                  </div>
                  <div className="dash-list-actions">
                    {item.overdue ? <Badge tone="danger">Overdue</Badge> : null}
                    <Badge tone={item.tier === "A" ? "brand" : "neutral"}>Tier {item.tier}</Badge>
                    <ButtonLink size="sm" href={`/leads/${item.lead.id}`} variant="secondary">
                      Open
                    </ButtonLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dash-card dash-stack">
          <SectionHeader
            title="Recent activity"
            description="Latest CRM updates and post changes."
          />
          <div className="dash-list">
            {snapshot.recentActivity.map((activity) => (
              <div className="dash-activity-row" key={activity.id}>
                <div className="dash-activity-head">
                  <strong>{activity.company}</strong>
                  <span className="ui-mono">{activity.date}</span>
                </div>
                <p>{activity.note}</p>
              </div>
            ))}
            {snapshot.recentActivity.length === 0 ? (
              <p className="dash-empty">No activity recorded yet.</p>
            ) : null}
            <p className="ui-mono dash-catalog">
              CMS catalog: {snapshot.publishedPosts} published / {snapshot.totalPosts} total
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
