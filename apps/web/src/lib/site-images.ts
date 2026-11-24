import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const SITE_UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "site");
export const MAX_SITE_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const JPEG_SOF = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

export type SiteImageResult =
  | { ok: true; url: string; width: number; height: number }
  | { ok: false; error: string };

function validSize(width: number, height: number): boolean {
  return (
    Number.isInteger(width) &&
    Number.isInteger(height) &&
    width > 0 &&
    height > 0 &&
    width <= 20000 &&
    height <= 20000
  );
}

function pngDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return null;
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  return validSize(width, height) ? { width, height } : null;
}

function jpegDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    let marker = bytes[offset + 1] ?? 0;
    while (marker === 0xff && offset + 2 < bytes.length) {
      offset += 1;
      marker = bytes[offset + 1] ?? 0;
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (offset + 4 >= bytes.length) return null;
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > bytes.length) return null;
    if (JPEG_SOF.has(marker)) {
      const height = bytes.readUInt16BE(offset + 5);
      const width = bytes.readUInt16BE(offset + 7);
      return validSize(width, height) ? { width, height } : null;
    }
    offset += 2 + length;
  }
  return null;
}

function webpDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 30) return null;
  if (bytes.subarray(0, 4).toString("ascii") !== "RIFF") return null;
  if (bytes.subarray(8, 12).toString("ascii") !== "WEBP") return null;
  const format = bytes.subarray(12, 16).toString("ascii");
  let width = 0;
  let height = 0;
  if (format === "VP8X") {
    width = 1 + bytes.readUIntLE(24, 3);
    height = 1 + bytes.readUIntLE(27, 3);
  } else if (format === "VP8 ") {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    width = bytes.readUInt16LE(26) & 0x3fff;
    height = bytes.readUInt16LE(28) & 0x3fff;
  } else if (format === "VP8L") {
    if (bytes[20] !== 0x2f) return null;
    const bits = bytes.readUInt32LE(21);
    width = (bits & 0x3fff) + 1;
    height = ((bits >>> 14) & 0x3fff) + 1;
  } else {
    return null;
  }
  return validSize(width, height) ? { width, height } : null;
}

export function readImageDimensions(
  bytes: Buffer,
  mime: string,
): { width: number; height: number } | null {
  try {
    if (mime === "image/png") return pngDimensions(bytes);
    if (mime === "image/jpeg") return jpegDimensions(bytes);
    if (mime === "image/webp") return webpDimensions(bytes);
  } catch {
    return null;
  }
  return null;
}

export async function saveSiteImage(file: File): Promise<SiteImageResult> {
  if (!file || file.size === 0) return { ok: false, error: "IMAGE_EMPTY" };
  if (file.size > MAX_SITE_IMAGE_BYTES) return { ok: false, error: "IMAGE_TOO_LARGE" };
  const extension = EXTENSIONS[file.type];
  if (!extension) return { ok: false, error: "IMAGE_MIME_NOT_ALLOWED" };

  const bytes = Buffer.from(await file.arrayBuffer());
  const dimensions = readImageDimensions(bytes, file.type);
  if (!dimensions) return { ok: false, error: "IMAGE_UNREADABLE" };

  const filename = `${randomUUID()}.${extension}`;
  await mkdir(SITE_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(SITE_UPLOAD_DIR, filename), bytes);
  return {
    ok: true,
    url: `/uploads/site/${filename}`,
    width: dimensions.width,
    height: dimensions.height,
  };
}
