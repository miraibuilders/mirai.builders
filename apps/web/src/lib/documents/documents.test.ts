import assert from "node:assert/strict";
import test from "node:test";
import { renderDocumentHtml, renderDocumentPdf } from "./pdf";
import { REGISTRATION_NUMBER_PLACEHOLDER, type DocumentRenderData } from "./types";

function invoiceFixture(templateVariant: "branded" | "mono"): DocumentRenderData {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    type: "invoice",
    leadId: null,
    partnerName: "日本語テスト株式会社",
    issueDate: "2026-11-22",
    dueDate: "2026-12-22",
    issuerName: "[ISSUER_NAME_TEST]",
    invoiceNumber: "INV-TEST-0001",
    transactionDate: "2026-11-20",
    registrationNumber: null,
    taxBreakdown: [{ rate: 10, subtotal: 29800, tax: 2980 }],
    lineItems: [
      { description: "日本語検証 外部チェック", quantity: 1, unitPrice: 29800, taxRate: 10 },
    ],
    templateVariant,
  };
}

for (const variant of ["branded", "mono"] as const) {
  test(`renders a non-empty ${variant} invoice PDF`, async () => {
    const data = invoiceFixture(variant);
    const html = renderDocumentHtml(data);
    assert.match(html, /日本語検証 外部チェック/);
    assert.match(html, new RegExp(REGISTRATION_NUMBER_PLACEHOLDER));

    const pdf = await renderDocumentPdf(data);
    assert.ok(pdf.length > 0, "PDF must be non-empty");
    assert.equal(pdf.subarray(0, 4).toString("latin1"), "%PDF");
  });
}

for (const type of ["quote", "nda", "acceptance"] as const) {
  test(`renders ${type} through the shared pipeline`, async () => {
    const data: DocumentRenderData = {
      ...invoiceFixture("mono"),
      id: `22222222-2222-4222-8222-22222222222${type.length}`,
      type,
      issuerName: null,
      invoiceNumber: null,
      transactionDate: null,
    };
    const pdf = await renderDocumentPdf(data);
    assert.ok(pdf.length > 0);
    assert.equal(pdf.subarray(0, 4).toString("latin1"), "%PDF");
  });
}
