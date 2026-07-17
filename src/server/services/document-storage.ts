import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

const UPLOAD_ROOT = resolve(join(process.cwd(), ".data", "uploads"));

const SAFE_ID_RE = /^[a-zA-Z0-9_-]+$/;

function assertSafeId(id: string, label: string): void {
  if (!id || !SAFE_ID_RE.test(id)) {
    throw new Error(`Invalid ${label}.`);
  }
}

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/csv",
]);

export function validateUploadMime(mimeType: string): boolean {
  return ALLOWED_MIME.has(mimeType.toLowerCase());
}

export function decodeUploadContent(contentBase64: string): Buffer {
  const raw = contentBase64.includes(",") ? contentBase64.split(",").pop()! : contentBase64;
  const buffer = Buffer.from(raw, "base64");
  if (buffer.length > MAX_BYTES) {
    throw new Error("File exceeds the 10MB upload limit.");
  }
  if (buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }
  return buffer;
}

export async function saveFarmerDocumentFile(
  farmerId: string,
  documentId: string,
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  assertSafeId(farmerId, "farmerId");
  assertSafeId(documentId, "documentId");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const dir = resolve(UPLOAD_ROOT, farmerId);
  if (dir !== UPLOAD_ROOT && !dir.startsWith(UPLOAD_ROOT + sep)) {
    throw new Error("Invalid upload path.");
  }
  await mkdir(dir, { recursive: true });
  const storagePath = resolve(dir, `${documentId}-${safeName}`);
  if (!storagePath.startsWith(dir + sep)) {
    throw new Error("Invalid upload path.");
  }
  await writeFile(storagePath, buffer);
  return storagePath;
}

export function extractTextFromBuffer(mimeType: string, buffer: Buffer): string | null {
  const mime = mimeType.toLowerCase();
  if (mime.startsWith("text/") || mime === "application/csv") {
    return buffer.toString("utf8").slice(0, 12000);
  }
  return null;
}

export function toDataUrl(mimeType: string, buffer: Buffer): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function deleteFarmerDocumentFile(storagePath: string): Promise<void> {
  const resolved = resolve(storagePath);
  if (!resolved.startsWith(UPLOAD_ROOT + sep)) {
    throw new Error("Refusing to delete file outside upload root.");
  }
  try {
    await unlink(resolved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

