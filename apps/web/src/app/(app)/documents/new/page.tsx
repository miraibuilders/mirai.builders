import { asc } from "drizzle-orm";
import { leads } from "@mirai/db";
import { getDb } from "@/lib/db";
import { ButtonLink, PageHeader } from "@/ui";
import { DocumentForm } from "./document-form";
import "../documents.css";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
  const leadOptions = await getDb()
    .select({
      id: leads.id,
      company: leads.company,
      preferredTemplate: leads.preferredTemplate,
    })
    .from(leads)
    .orderBy(asc(leads.company));

  return (
    <div className="documents-page">
      <PageHeader
        title="New document"
        description="Select a lead and choose the PDF template variant."
        actions={<ButtonLink href="/documents" variant="secondary">Back to documents</ButtonLink>}
      />
      <DocumentForm leads={leadOptions} />
    </div>
  );
}
