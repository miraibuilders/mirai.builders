"use server";

import { documents, type DocumentLineItem, type TaxBreakdownEntry } from "@mirai/db";
import { getDb } from "@/lib/db";
import type { DocumentTemplateVariant, DocumentType } from "@/lib/documents/types";

export type DocumentFormState = {
  status: "idle" | "success" | "error";
  documentId?: string;
  message?: string;
};

const documentTypes: DocumentType[] = ["invoice", "quote", "nda", "acceptance"];
const variants: DocumentTemplateVariant[] = ["branded", "mono"];

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: string): number {
  return Number(value);
}

function deriveTaxBreakdown(items: DocumentLineItem[]): TaxBreakdownEntry[] {
  const grouped = new Map<number, { subtotal: number; tax: number }>();
  for (const item of items) {
    const subtotal = item.quantity * item.unitPrice;
    const tax = Math.round((subtotal * item.taxRate) / 100);
    const current = grouped.get(item.taxRate) ?? { subtotal: 0, tax: 0 };
    grouped.set(item.taxRate, { subtotal: current.subtotal + subtotal, tax: current.tax + tax });
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rate, totals]) => ({ rate, ...totals }));
}

export async function createDocument(
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const type = asString(formData.get("type")) as DocumentType;
  const templateVariant = asString(formData.get("templateVariant")) as DocumentTemplateVariant;
  const leadId = asString(formData.get("leadId")) || null;
  const partnerName = asString(formData.get("partnerName"));
  const issueDate = asString(formData.get("issueDate"));
  const dueDate = asString(formData.get("dueDate")) || null;
  const issuerName = asString(formData.get("issuerName")) || null;
  const invoiceNumber = asString(formData.get("invoiceNumber")) || null;
  const transactionDate = asString(formData.get("transactionDate")) || null;
  const registrationNumber = asString(formData.get("registrationNumber")) || null;

  if (!documentTypes.includes(type) || !variants.includes(templateVariant)) {
    return { status: "error", message: "[DOCUMENT_ERROR_INVALID]" };
  }
  if (!partnerName || !issueDate) {
    return { status: "error", message: "[DOCUMENT_ERROR_REQUIRED]" };
  }
  if (type === "invoice" && (!issuerName || !invoiceNumber)) {
    return { status: "error", message: "[DOCUMENT_ERROR_REQUIRED]" };
  }

  const descriptions = formData.getAll("item_description[]").map((value) => asString(value));
  const quantities = formData.getAll("item_quantity[]").map((value) => asString(value));
  const unitPrices = formData.getAll("item_unit_price[]").map((value) => asString(value));
  const taxRates = formData.getAll("item_tax_rate[]").map((value) => asString(value));
  const rowCount = Math.max(descriptions.length, quantities.length, unitPrices.length, taxRates.length);

  const lineItems: DocumentLineItem[] = [];
  for (let index = 0; index < rowCount; index += 1) {
    const description = descriptions[index] ?? "";
    const quantity = asNumber(quantities[index] ?? "");
    const unitPrice = asNumber(unitPrices[index] ?? "");
    const taxRate = asNumber(taxRates[index] ?? "");
    if (!description && !quantities[index] && !unitPrices[index] && !taxRates[index]) continue;
    if (
      !description ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !Number.isInteger(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(taxRate) ||
      taxRate < 0
    ) {
      return { status: "error", message: "[DOCUMENT_ERROR_LINE_ITEM]" };
    }
    lineItems.push({ description, quantity, unitPrice, taxRate });
  }

  if (type === "invoice" && lineItems.length === 0) {
    return { status: "error", message: "[DOCUMENT_ERROR_REQUIRED]" };
  }

  const taxBreakdown = type === "invoice" ? deriveTaxBreakdown(lineItems) : [];

  try {
    const [created] = await getDb()
      .insert(documents)
      .values({
        type,
        leadId,
        partnerName,
        issueDate,
        dueDate,
        issuerName,
        invoiceNumber,
        transactionDate,
        registrationNumber,
        lineItems,
        taxBreakdown,
        templateVariant,
      })
      .returning({ id: documents.id });

    return { status: "success", documentId: created.id };
  } catch {
    return { status: "error", message: "[DOCUMENT_ERROR_GENERIC]" };
  }
}
