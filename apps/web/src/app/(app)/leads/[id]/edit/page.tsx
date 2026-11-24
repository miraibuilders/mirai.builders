import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { canEnqueueScan, getCrmActor } from "@/lib/crm-auth";
import { ButtonLink, InlineBanner, PageHeader } from "@/ui";
import { LeadForm } from "../../_components/lead-form";
import { updateLead } from "../actions";
import "../../leads.css";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getCrmActor();
  if (!actor) redirect("/");
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const [lead] = await getDb().select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) notFound();
  if (!canEnqueueScan(actor.role)) {
    return (
      <div className="leads-page">
        <PageHeader title="Edit lead" />
        <InlineBanner tone="danger" title="Forbidden">You cannot edit CRM leads.</InlineBanner>
      </div>
    );
  }

  return (
    <div className="leads-page">
      <PageHeader
        title="Edit lead"
        description={`Update details for ${lead.company}.`}
        actions={<ButtonLink href={`/leads/${lead.id}`} variant="secondary">Back to lead</ButtonLink>}
      />
      <LeadForm
        action={updateLead}
        submitLabel="Save lead"
        hiddenValues={{ id: lead.id }}
        initial={{
          company: lead.company,
          websiteUrl: lead.websiteUrl,
          segment: lead.segment,
          reachability: lead.reachability,
          sizeProxy: lead.sizeProxy,
          nextStep: lead.nextStep ?? "",
          nextStepDate: lead.nextStepDate ?? "",
          preferredTemplate: lead.preferredTemplate ?? "branded",
          note: "",
        }}
      />
    </div>
  );
}
