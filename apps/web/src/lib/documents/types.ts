import type { DocumentLineItem, TaxBreakdownEntry } from "@mirai/db";

export type DocumentType = "invoice" | "quote" | "nda" | "acceptance";
export type DocumentTemplateVariant = "branded" | "mono";

export type DocumentRenderData = {
  id: string;
  type: DocumentType;
  leadId: string | null;
  partnerName: string;
  issueDate: string;
  dueDate: string | null;
  issuerName: string | null;
  invoiceNumber: string | null;
  transactionDate: string | null;
  registrationNumber: string | null;
  taxBreakdown: TaxBreakdownEntry[];
  lineItems: DocumentLineItem[];
  templateVariant: DocumentTemplateVariant;
};

export const REGISTRATION_NUMBER_PLACEHOLDER = "[REGISTRATION_NUMBER_PLACEHOLDER]";
export const ISSUER_NAME_PLACEHOLDER = "[ISSUER_NAME_PLACEHOLDER]";
export const INVOICE_NUMBER_PLACEHOLDER = "[INVOICE_NUMBER_PLACEHOLDER]";

export function resolveRegistrationNumber(value: string | null): string {
  return value?.trim() ? value : REGISTRATION_NUMBER_PLACEHOLDER;
}

export function resolveIssuerName(value: string | null): string {
  return value?.trim() ? value : ISSUER_NAME_PLACEHOLDER;
}

export function resolveInvoiceNumber(value: string | null): string {
  return value?.trim() ? value : INVOICE_NUMBER_PLACEHOLDER;
}

export function resolveTransactionDate(transactionDate: string | null, issueDate: string): string {
  return transactionDate?.trim() ? transactionDate : issueDate;
}
