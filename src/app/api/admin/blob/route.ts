import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 120;

const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "application/octet-stream",
] as const;

function isAllowedUploadPath(pathname: string): boolean {
  return (
    pathname.startsWith("hero/") ||
    pathname.startsWith("gallery/") ||
    pathname.startsWith("hero%2F") ||
    pathname.startsWith("gallery%2F")
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized — log in again." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAllowedUploadPath(pathname)) {
          throw new Error(`Invalid upload path: ${pathname.slice(0, 80)}`);
        }
        return {
          allowedContentTypes: [...ALLOWED],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    console.error("[api/admin/blob]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
