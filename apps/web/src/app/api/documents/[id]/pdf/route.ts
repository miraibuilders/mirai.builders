import { eq } from "drizzle-orm";
import { documents } from "@mirai/db";
import { getDb } from "@/lib/db";
import { renderDocumentPdf } from "@/lib/documents/pdf";
import type { DocumentRenderData } from "@/lib/documents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("[DOCUMENT_ERROR_INVALID]", { status: 400 });
  }

  const [row] = await getDb().select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!row) return new Response("[DOCUMENT_ERROR_NOT_FOUND]", { status: 404 });

  const data: DocumentRenderData = {
    id: row.id,
    type: row.type,
    leadId: row.leadId,
    partnerName: row.partnerName,
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    issuerName: row.issuerName,
    invoiceNumber: row.invoiceNumber,
    transactionDate: row.transactionDate,
    registrationNumber: row.registrationNumber,
    taxBreakdown: row.taxBreakdown,
    lineItems: row.lineItems,
    templateVariant: row.templateVariant,
  };

  try {
    const pdf = await renderDocumentPdf(data);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document-${row.id.slice(0, 8)}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "[DOCUMENT_ERROR_PDF]";
    return new Response(message, { status: 500 });
  }
}
