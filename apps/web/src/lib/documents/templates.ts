import type { TaxBreakdownEntry } from "@mirai/db";
import {
  resolveInvoiceNumber,
  resolveIssuerName,
  resolveRegistrationNumber,
  resolveTransactionDate,
  type DocumentRenderData,
  type DocumentTemplateVariant,
  type DocumentType,
} from "./types";

export type DocumentTemplate = {
  variant: DocumentTemplateVariant;
  css: string;
};

const fontFace = `
@font-face {
  font-family: "Noto Sans JP";
  src: url("NotoSansJP-Regular.ttf") format("truetype");
  font-style: normal;
  font-weight: 400;
  font-display: block;
}
`;

const sharedCss = `
${fontFace}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Noto Sans JP", sans-serif;
  font-size: 10pt;
  font-weight: 400;
  line-height: 1.55;
  color: var(--color-fg);
  background: var(--color-bg);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  overflow-wrap: anywhere;
  word-break: break-word;
}
strong, th, h1, h2 { font-weight: 400; }
.sheet {
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
  padding: 16mm;
}
.doc-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}
.eyebrow {
  font-size: 8pt;
  letter-spacing: 0.12em;
  color: var(--color-muted);
  margin-bottom: 4px;
}
h1 { font-size: 22pt; line-height: 1.2; margin: 0; }
h2 {
  font-size: 11pt;
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border);
}
.doc-number { font-size: 9pt; text-align: right; }
.doc-number .value { font-size: 11pt; display: block; }
.meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
  margin-bottom: 22px;
}
.label {
  display: block;
  font-size: 8pt;
  color: var(--color-muted);
  margin-bottom: 2px;
}
.meta .value { font-size: 10pt; }
section { margin-bottom: 20px; }
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
th, td {
  padding: 7px 8px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: top;
  font-size: 9pt;
}
th { color: var(--color-muted); font-size: 8pt; }
.num { text-align: right; white-space: nowrap; }
.totals {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  font-size: 11pt;
}
.footer {
  margin-top: 28px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  font-size: 8pt;
  color: var(--color-muted);
}
.placeholder { color: var(--color-muted); }
.minimal .recipient { font-size: 13pt; margin-bottom: 18px; }
.minimal .body-copy { white-space: pre-wrap; margin: 0; }
@page { size: A4; margin: 0; }
`;

const brandedCss = `
:root {
  --color-bg: oklch(98% 0 0);
  --color-fg: oklch(22% 0 0);
  --color-accent: oklch(45% 0.12 265);
  --color-muted: oklch(52% 0 0);
  --color-border: color-mix(in oklab, var(--color-fg) 18%, var(--color-bg));
}
${sharedCss}
.doc-header { border-bottom: 2px solid var(--color-accent); }
.eyebrow, h1 { color: var(--color-accent); }
h2 { border-bottom-color: var(--color-accent); }
.highlight { color: var(--color-accent); }
`;

const monoCss = `
:root {
  --color-bg: white;
  --color-fg: black;
  --color-accent: black;
  --color-muted: black;
  --color-border: black;
}
${sharedCss}
.doc-header { border-bottom: 1px solid black; }
.eyebrow, h1, h2 { color: black; }
h2 { border-bottom: 1px solid black; }
th, td { border-bottom: 1px solid black; }
`;

export const documentTemplates: Record<DocumentTemplateVariant, DocumentTemplate> = {
  branded: { variant: "branded", css: brandedCss },
  mono: { variant: "mono", css: monoCss },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function yen(value: number): string {
  return `￥${Math.round(value).toLocaleString("ja-JP")}`;
}

function assertInvoiceFields(data: DocumentRenderData): void {
  if (!data.issuerName?.trim()) throw new Error("[DOCUMENT_ERROR_ISSUER_REQUIRED]");
  if (!data.invoiceNumber?.trim()) throw new Error("[DOCUMENT_ERROR_INVOICE_NUMBER_REQUIRED]");
  if (!data.lineItems.some((item) => item.description.trim())) {
    throw new Error("[DOCUMENT_ERROR_DESCRIPTION_REQUIRED]");
  }
  if (data.taxBreakdown.length === 0) throw new Error("[DOCUMENT_ERROR_TAX_BREAKDOWN_REQUIRED]");
  for (const entry of data.taxBreakdown) {
    if (!Number.isFinite(entry.rate) || !Number.isFinite(entry.subtotal) || !Number.isFinite(entry.tax)) {
      throw new Error("[DOCUMENT_ERROR_TAX_BREAKDOWN_INVALID]");
    }
  }
}

function taxRows(entries: TaxBreakdownEntry[]): string {
  return entries
    .map(
      (entry) => `
      <tr>
        <td data-label="[LABEL_TAX_RATE]">${escapeHtml(String(entry.rate))}%</td>
        <td class="num" data-label="[LABEL_SUBTOTAL]">${escapeHtml(yen(entry.subtotal))}</td>
        <td class="num" data-label="[LABEL_TAX]">${escapeHtml(yen(entry.tax))}</td>
      </tr>`,
    )
    .join("");
}

function itemRows(data: DocumentRenderData): string {
  return data.lineItems
    .map((item) => {
      const amount = item.quantity * item.unitPrice;
      return `
      <tr>
        <td data-label="[LABEL_DESCRIPTION]">${escapeHtml(item.description)}</td>
        <td class="num" data-label="[LABEL_QUANTITY]">${escapeHtml(String(item.quantity))}</td>
        <td class="num" data-label="[LABEL_UNIT_PRICE]">${escapeHtml(yen(item.unitPrice))}</td>
        <td class="num" data-label="[LABEL_TAX_RATE]">${escapeHtml(String(item.taxRate))}%</td>
        <td class="num" data-label="[LABEL_AMOUNT]">${escapeHtml(yen(amount))}</td>
      </tr>`;
    })
    .join("");
}

function invoiceBody(data: DocumentRenderData): string {
  const subtotal = data.taxBreakdown.reduce((sum, entry) => sum + entry.subtotal, 0);
  const tax = data.taxBreakdown.reduce((sum, entry) => sum + entry.tax, 0);
  return `
    <section>
      <h2>[LABEL_DESCRIPTION]</h2>
      <table>
        <thead><tr>
          <th>[LABEL_DESCRIPTION]</th>
          <th class="num">[LABEL_QUANTITY]</th>
          <th class="num">[LABEL_UNIT_PRICE]</th>
          <th class="num">[LABEL_TAX_RATE]</th>
          <th class="num">[LABEL_AMOUNT]</th>
        </tr></thead>
        <tbody>${itemRows(data)}</tbody>
      </table>
    </section>
    <section>
      <h2>[LABEL_TAX_BREAKDOWN]</h2>
      <table>
        <thead><tr>
          <th>[LABEL_TAX_RATE]</th>
          <th class="num">[LABEL_SUBTOTAL]</th>
          <th class="num">[LABEL_TAX]</th>
        </tr></thead>
        <tbody>${taxRows(data.taxBreakdown)}</tbody>
      </table>
      <div class="totals">
        <div>[LABEL_SUBTOTAL] ${escapeHtml(yen(subtotal))}</div>
        <div class="highlight">[LABEL_TOTAL] ${escapeHtml(yen(subtotal + tax))}</div>
      </div>
    </section>`;
}

function minimalBody(data: DocumentRenderData): string {
  const lines = data.lineItems.map((item) => item.description).filter(Boolean);
  return `
    <section>
      <p class="recipient">${escapeHtml(data.partnerName)}</p>
      <h2>[LABEL_DESCRIPTION]</h2>
      <p class="body-copy">${escapeHtml(lines.join("\n") || "[DOCUMENT_BODY_PLACEHOLDER]")}</p>
    </section>`;
}

const titles: Record<DocumentType, string> = {
  invoice: "[DOC_TITLE_INVOICE]",
  quote: "[DOC_TITLE_QUOTE]",
  nda: "[DOC_TITLE_NDA]",
  acceptance: "[DOC_TITLE_ACCEPTANCE]",
};

export function renderDocumentHtml(data: DocumentRenderData): string {
  if (data.type === "invoice") assertInvoiceFields(data);
  const template = documentTemplates[data.templateVariant];
  const date = resolveTransactionDate(data.transactionDate, data.issueDate);
  const registrationNumber = resolveRegistrationNumber(data.registrationNumber);
  const isInvoice = data.type === "invoice";

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(titles[data.type])}</title>
<style>${template.css}</style>
</head>
<body>
<main class="sheet ${isInvoice ? "invoice" : "minimal"}">
  <header class="doc-header">
    <div>
      <div class="eyebrow">[DOCUMENT]</div>
      <h1>${escapeHtml(titles[data.type])}</h1>
    </div>
    ${
      isInvoice
        ? `<div class="doc-number"><span class="label">[LABEL_INVOICE_NUMBER]</span><span class="value">${escapeHtml(resolveInvoiceNumber(data.invoiceNumber))}</span></div>`
        : ""
    }
  </header>
  <div class="meta">
    <div><span class="label">[LABEL_ISSUER]</span><span class="value">${escapeHtml(resolveIssuerName(data.issuerName))}</span></div>
    <div><span class="label">[LABEL_REGISTRATION_NUMBER]</span><span class="value${data.registrationNumber ? "" : " placeholder"}">${escapeHtml(registrationNumber)}</span></div>
    <div><span class="label">[LABEL_TRANSACTION_DATE]</span><span class="value">${escapeHtml(date)}</span></div>
    <div><span class="label">[LABEL_ISSUE_DATE]</span><span class="value">${escapeHtml(data.issueDate)}</span></div>
    ${
      data.dueDate
        ? `<div><span class="label">[LABEL_DUE_DATE]</span><span class="value">${escapeHtml(data.dueDate)}</span></div>`
        : ""
    }
    <div><span class="label">[LABEL_RECIPIENT]</span><span class="value">${escapeHtml(data.partnerName)}</span></div>
  </div>
  ${isInvoice ? invoiceBody(data) : minimalBody(data)}
  <div class="footer">[DOCUMENT_FOOTER_PLACEHOLDER]</div>
</main>
</body>
</html>`;
}
