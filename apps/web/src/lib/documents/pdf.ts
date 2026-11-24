import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { renderDocumentHtml } from "./templates";
import type { DocumentRenderData } from "./types";

const FONT_FILENAME = "NotoSansJP-Regular.ttf";
const fontCandidates = [
  path.resolve(process.cwd(), "packages/shared/fonts", FONT_FILENAME),
  path.resolve(process.cwd(), "../../packages/shared/fonts", FONT_FILENAME),
];
const resolvedFontPath = fontCandidates.find((candidate) => existsSync(candidate));
if (!resolvedFontPath) throw new Error("[PDF_ERROR_FONT_NOT_FOUND]");
export const FONT_PATH = resolvedFontPath;

function assertPdf(bytes: Buffer): void {
  if (bytes.length === 0 || bytes.subarray(0, 4).toString("latin1") !== "%PDF") {
    throw new Error("[PDF_ERROR_INVALID_OUTPUT]");
  }
}

async function renderWithGotenberg(html: string): Promise<Buffer> {
  const baseUrl = process.env.GOTENBERG_URL;
  if (!baseUrl) throw new Error("[PDF_ERROR_GOTENBERG_NOT_CONFIGURED]");

  const fontBytes = await readFile(FONT_PATH);
  const form = new FormData();
  form.append("files", new Blob([html], { type: "text/html" }), "index.html");
  form.append("files", new Blob([fontBytes], { type: "font/ttf" }), FONT_FILENAME);

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/forms/chromium/convert/html`, {
    method: "POST",
    body: form,
    headers: { "Gotenberg-Output-Filename": "document" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`[PDF_ERROR_GOTENBERG_${response.status}]`);

  const pdf = Buffer.from(await response.arrayBuffer());
  assertPdf(pdf);
  return pdf;
}

function runLibreOffice(args: string[], fontConfigPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.LIBREOFFICE_PATH ?? "libreoffice", args, {
      stdio: ["ignore", "ignore", "pipe"],
      env: { ...process.env, FONTCONFIG_FILE: fontConfigPath },
    });
    let stderr = "";
    const timeout = setTimeout(() => child.kill("SIGKILL"), 45_000);
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve();
      else reject(new Error(`[PDF_ERROR_LOCAL_RENDERER_${code}] ${stderr.slice(-500)}`));
    });
  });
}

async function renderWithLocalRenderer(html: string): Promise<Buffer> {
  const workDir = await mkdtemp(path.join(tmpdir(), "mirai-pdf-"));
  try {
    const htmlPath = path.join(workDir, "index.html");
    const pdfPath = path.join(workDir, "index.pdf");
    const profileDir = path.join(workDir, "lo-profile");
    const fontConfigPath = path.join(workDir, "fonts.conf");
    await mkdir(profileDir);
    await writeFile(htmlPath, html, "utf8");
    await copyFile(FONT_PATH, path.join(workDir, FONT_FILENAME));
    await writeFile(
      fontConfigPath,
      `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n` +
        `  <dir>/usr/share/fonts</dir>\n  <dir>/usr/local/share/fonts</dir>\n` +
        `  <dir>${path.dirname(FONT_PATH)}</dir>\n` +
        `  <cachedir>${path.join(workDir, "font-cache")}</cachedir>\n</fontconfig>\n`,
      "utf8",
    );

    await runLibreOffice(
      [
        `-env:UserInstallation=file://${profileDir}`,
        "--headless",
        "--norestore",
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        htmlPath,
      ],
      fontConfigPath,
    );

    const pdf = await readFile(pdfPath);
    assertPdf(pdf);
    return pdf;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function renderDocumentPdf(data: DocumentRenderData): Promise<Buffer> {
  const html = renderDocumentHtml(data);

  if (process.env.GOTENBERG_URL) {
    try {
      return await renderWithGotenberg(html);
    } catch (error) {
      if (process.env.PDF_RENDERER === "gotenberg") throw error;
    }
  }

  return renderWithLocalRenderer(html);
}

export { renderDocumentHtml };
