/**
 * Client-only: compress raster images to at most `maxBytes` (default 5MB).
 * No upload size limit — large files are reduced via canvas encode + optional downscale.
 */

const DEFAULT_MAX = 5 * 1024 * 1024;

function supportsWebp(): boolean {
  if (typeof document === "undefined") return false;
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  return c.toDataURL("image/webp").startsWith("data:image/webp");
}

export async function compressImageToMaxBytes(
  file: File,
  maxBytes: number = DEFAULT_MAX,
): Promise<File> {
  if (file.size <= maxBytes) return file;
  if (!file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  let width = bitmap.width;
  let height = bitmap.height;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  const outType = supportsWebp() ? "image/webp" : "image/jpeg";
  const ext = outType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "") || "gallery";

  let quality = 0.92;
  const maxDim = 4096;

  const tryEncode = async (): Promise<File | null> => {
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(
        (b) => resolve(b),
        outType,
        outType === "image/jpeg" || outType === "image/webp" ? quality : undefined,
      ),
    );

    if (blob && blob.size <= maxBytes) {
      return new File([blob], `${baseName}.${ext}`, { type: outType });
    }
    return null;
  };

  try {
    for (let attempt = 0; attempt < 48; attempt++) {
      if (width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      }
      if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const ok = await tryEncode();
      if (ok) return ok;

      if (quality > 0.45) {
        quality -= 0.04;
        continue;
      }
      width = Math.max(320, Math.floor(width * 0.88));
      height = Math.max(320, Math.floor(height * 0.88));
      quality = 0.88;
    }

    // Last resort: small edge
    width = 800;
    height = Math.max(400, Math.round((800 * bitmap.height) / bitmap.width));
    for (let q = 0.75; q >= 0.35; q -= 0.05) {
      quality = q;
      const ok = await tryEncode();
      if (ok) return ok;
    }
  } finally {
    bitmap.close();
  }

  return file;
}
