import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const evidenceDir = path.resolve(
  new URL("../../../state/evidence/stage3/", import.meta.url).pathname,
);
const actionUrl = new URL("../src/app/(app)/documents/new/actions.ts", import.meta.url);

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`[E2E_ERROR_SERVER_UNAVAILABLE] ${baseUrl}`);
}

type CreateDocumentResult = {
  status: "idle" | "success" | "error";
  documentId?: string;
  message?: string;
};

async function createInvoice(options: {
  templateVariant: "branded" | "mono";
  invoiceNumber: string;
  registrationNumber: string | null;
}): Promise<string> {
  const { createDocument } = (await import(actionUrl.href)) as {
    createDocument: (
      prev: { status: "idle" },
      formData: FormData,
    ) => Promise<CreateDocumentResult>;
  };

  const formData = new FormData();
  formData.set("type", "invoice");
  formData.set("templateVariant", options.templateVariant);
  formData.set("partnerName", "日本語テスト株式会社");
  formData.set("issueDate", "2026-11-22");
  formData.set("dueDate", "2026-12-22");
  formData.set("issuerName", "MIRAI Lab [ISSUER_PLACEHOLDER]");
  formData.set("invoiceNumber", options.invoiceNumber);
  formData.set("transactionDate", "2026-11-20");
  if (options.registrationNumber) {
    formData.set("registrationNumber", options.registrationNumber);
  }
  formData.set("item_description[]", "日本語検証 外部チェック");
  formData.set("item_quantity[]", "1");
  formData.set("item_unit_price[]", "29800");
  formData.set("item_tax_rate[]", "10");

  const result = await createDocument({ status: "idle" }, formData);
  assert.equal(result.status, "success", result.message);
  assert.ok(result.documentId, "[E2E_ERROR_MISSING_DOCUMENT_ID]");
  return result.documentId;
}

async function downloadPdf(id: string, outputPath: string): Promise<void> {
  const response = await fetch(`${baseUrl}/api/documents/${id}/pdf`);
  assert.ok(response.ok, `[E2E_ERROR_PDF_HTTP_${response.status}]`);
  assert.match(response.headers.get("content-type") ?? "", /application\/pdf/);
  const pdf = Buffer.from(await response.arrayBuffer());
  assert.equal(pdf.subarray(0, 4).toString("latin1"), "%PDF");
  await writeFile(outputPath, pdf);
}

async function printCommand(label: string, command: string, args: string[]): Promise<string> {
  const { stdout, stderr } = await run(command, args);
  const output = `${stdout}${stderr}`.trimEnd();
  console.log(`\n$ ${command} ${args.join(" ")}`);
  console.log(output);
  return output;
}

async function main(): Promise<void> {
  await waitForServer();
  await mkdir(evidenceDir, { recursive: true });

  const brandedId = await createInvoice({
    templateVariant: "branded",
    invoiceNumber: `INV-BRANDED-${Date.now()}`,
    registrationNumber: "T1234567890123",
  });
  const monoId = await createInvoice({
    templateVariant: "mono",
    invoiceNumber: `INV-MONO-${Date.now()}`,
    registrationNumber: null,
  });

  const brandedPdf = path.join(evidenceDir, "invoice-branded.pdf");
  const monoPdf = path.join(evidenceDir, "invoice-mono.pdf");
  await downloadPdf(brandedId, brandedPdf);
  await downloadPdf(monoId, monoPdf);

  for (const [variant, pdfPath] of [
    ["branded", brandedPdf],
    ["mono", monoPdf],
  ] as const) {
    const fileOutput = await printCommand(`file ${variant}`, "file", [pdfPath]);
    const textOutput = await printCommand(`pdftotext ${variant}`, "pdftotext", [pdfPath, "-"]);
    const fontsOutput = await printCommand(`pdffonts ${variant}`, "pdffonts", [pdfPath]);
    assert.match(fileOutput, /PDF document/);
    assert.match(textOutput, /日本語検証 外部チェック/);
    assert.doesNotMatch(textOutput, /□/);
    assert.match(fontsOutput, /NotoSansJP.*yes/);
  }

  const monoText = (await run("pdftotext", [monoPdf, "-"])).stdout;
  assert.match(monoText, /\[REGISTRATION_NUMBER_PLACEHOLDER\]/);

  await printCommand("phone-width branded", "pdftoppm", [
    "-f", "1", "-l", "1", "-scale-to-x", "375", "-scale-to-y", "-1", "-png", "-singlefile",
    brandedPdf, path.join(evidenceDir, "invoice-branded-375"),
  ]);
  await printCommand("phone-width mono", "pdftoppm", [
    "-f", "1", "-l", "1", "-scale-to-x", "375", "-scale-to-y", "-1", "-png", "-singlefile",
    monoPdf, path.join(evidenceDir, "invoice-mono-375"),
  ]);

  console.log(`\n[E2E_OK] ${brandedId} ${monoId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
