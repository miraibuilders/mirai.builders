import { desc } from "drizzle-orm";
import { documents } from "@mirai/db";
import { getDb } from "@/lib/db";
import { ButtonLink, PageHeader } from "@/ui";
import { DocumentListTable } from "./_components/document-list-table";
import "./documents.css";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const rows = await getDb()
    .select({
      id: documents.id,
      type: documents.type,
      partnerName: documents.partnerName,
      issueDate: documents.issueDate,
      templateVariant: documents.templateVariant,
    })
    .from(documents)
    .orderBy(desc(documents.createdAt));

  return (
    <div className="documents-page">
      <PageHeader
        title="Documents"
        description="Generated PDFs and their delivery status."
        actions={<ButtonLink href="/documents/new">New document</ButtonLink>}
      />
      <DocumentListTable rows={rows} />
    </div>
  );
}
