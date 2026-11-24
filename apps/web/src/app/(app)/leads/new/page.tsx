import { redirect } from "next/navigation";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { ButtonLink, InlineBanner, PageHeader } from "@/ui";
import { createLead } from "../actions";
import { LeadForm } from "../_components/lead-form";
import "../leads.css";

export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const actor = await getCrmActor();
  if (!actor) redirect("/");
  if (!canEnqueueScan(actor.role)) {
    return (
      <div className="leads-page">
        <PageHeader title="New lead" />
        <InlineBanner tone="danger" title="Forbidden">You cannot create CRM leads.</InlineBanner>
      </div>
    );
  }

  return (
    <div className="leads-page">
      <PageHeader
        title="New lead"
        description="Add a company and its website before running a scan."
        actions={<ButtonLink href="/leads" variant="secondary">Back to leads</ButtonLink>}
      />
      <LeadForm action={createLead} submitLabel="Create lead" />
    </div>
  );
}
