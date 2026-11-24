import { ButtonLink, PageHeader } from "@/ui";

import { DocumentListTable, type DocumentRow } from "./_components/document-list-table";
import { getDb } from "@/lib/db";
import { documents } from "@mirai/db";
import { desc } from "drizzle-orm";

import "./documents.css";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const rows: DocumentRow[] = await getDb()
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
        description="Invoices, quotes, and agreements with mirrored PDF output."
        actions={
          <ButtonLink href="/documents/new" icon="plus">
            New document
          </ButtonLink>
        }
      />
      <DocumentListTable rows={rows} />
    </div>
  );
}
