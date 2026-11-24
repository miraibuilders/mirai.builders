import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { contactRequests, leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { ButtonLink, InlineBanner, PageHeader, SectionHeader } from "@/ui";
import { ContactRequestsTable } from "./_components/contact-requests-table";
import "./contact-requests.css";

export const dynamic = "force-dynamic";

export default async function ContactRequestsPage() {
  const actor = await getCrmActor();
  if (!actor) redirect("/");
  if (!canEnqueueScan(actor.role)) {
    return (
      <div className="contact-requests-page">
        <PageHeader title="Contact requests" />
        <InlineBanner tone="danger" title="Forbidden">You do not have access to contact requests.</InlineBanner>
      </div>
    );
  }

  const rows = await getDb()
    .select({
      id: contactRequests.id,
      name: contactRequests.name,
      company: contactRequests.company,
      email: contactRequests.email,
      phone: contactRequests.phone,
      message: contactRequests.message,
      createdAt: contactRequests.createdAt,
      leadId: contactRequests.leadId,
      leadCompany: leads.company,
    })
    .from(contactRequests)
    .leftJoin(leads, eq(leads.id, contactRequests.leadId))
    .orderBy(desc(contactRequests.createdAt));

  const today = new Date().toISOString().slice(0, 10);
  const metrics = [
    { label: "Total requests", index: "01", value: rows.length },
    { label: "Unpromoted", index: "02", value: rows.filter((row) => !row.leadId).length },
    { label: "Promoted", index: "03", value: rows.filter((row) => row.leadId).length },
    {
      label: "Received today",
      index: "04",
      value: rows.filter((row) => row.createdAt.toISOString().slice(0, 10) === today).length,
    },
  ];

  return (
    <div className="contact-requests-page">
      <PageHeader
        title="Contact requests"
        description="Inquiries waiting to be promoted into the CRM."
        actions={<ButtonLink href="/leads" variant="secondary">Back to leads</ButtonLink>}
      />
      <div className="crm-kpi-strip" aria-label="Contact request metrics">
        {metrics.map((metric) => (
          <div className="crm-kpi-card" key={metric.index}>
            <div className="crm-kpi-label">
              <span>{metric.label}</span>
              <span className="ui-mono">{metric.index}</span>
            </div>
            <div className="crm-kpi-value">{metric.value}</div>
          </div>
        ))}
      </div>
      <div className="crm-panel-grid">
        <section className="crm-panel">
          <SectionHeader title="Promotion backlog" description="Requests without a linked lead." />
          <p className="ui-mono crm-panel-metric">
            {Math.round((rows.filter((row) => !row.leadId).length / Math.max(rows.length, 1)) * 100)}% pending
          </p>
        </section>
        <section className="crm-panel">
          <SectionHeader title="Newest inquiry" description="Most recent form submission." />
          <p className="ui-mono crm-panel-metric">
            {rows[0]?.createdAt.toISOString() ?? "none"}
          </p>
        </section>
      </div>
      <ContactRequestsTable rows={rows} />
    </div>
  );
}
