import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { media } from "@mirai/db";
import { getDb } from "@/lib/db";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads");
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export type MediaUploadResult =
  | { ok: true; id: string; url: string }
  | { ok: false; error: string };

export async function saveMediaUpload(file: File, uploadedBy: string): Promise<MediaUploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "MEDIA_EMPTY" };
  if (file.size > MAX_MEDIA_BYTES) return { ok: false, error: "MEDIA_TOO_LARGE" };
  if (!ALLOWED_MIMES.has(file.type)) return { ok: false, error: "MEDIA_MIME_NOT_ALLOWED" };

  const original = path.basename(file.name).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120) || "upload.bin";
  const filename = `${randomUUID()}-${original}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));

  const [row] = await getDb()
    .insert(media)
    .values({
      filename,
      mime: file.type,
      size: file.size,
      url: `/uploads/${filename}`,
      uploadedBy,
    })
    .returning({ id: media.id, url: media.url });
  return { ok: true, id: row.id, url: row.url };
}
