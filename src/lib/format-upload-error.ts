import { isNextRedirect } from "@/lib/is-next-redirect";

export function formatUploadError(error: unknown): string {
  if (isNextRedirect(error)) {
    return "Session expired. Please log in again.";
  }
  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg.includes("BLOB_READ_WRITE_TOKEN")) {
      return "Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN on Vercel (Storage → Blob).";
    }
    if (msg.includes("Unauthorized") || msg.includes("401")) {
      return "Not authorized. Log out and log in again, then retry.";
    }
    if (msg.includes("Invalid upload path")) {
      return "Upload path rejected by server. Refresh the page and try again.";
    }
    if (msg) return msg;
  }
  return "Upload failed. Check Blob token, file type, and connection, then try again.";
}
