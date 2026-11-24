import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { contactRequests, leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { ButtonLink, InlineBanner, PageHeader } from "@/ui";
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

  return (
    <div className="contact-requests-page">
      <PageHeader
        title="Contact requests"
        description="Inquiries waiting to be promoted into the CRM."
        actions={<ButtonLink href="/leads" variant="secondary">Back to leads</ButtonLink>}
      />
      <ContactRequestsTable rows={rows} />
    </div>
  );
}
