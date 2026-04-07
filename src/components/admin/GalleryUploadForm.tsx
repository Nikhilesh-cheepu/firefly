"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { addGalleryImageFromUpload } from "@/app/admin/gallery/actions";
import { compressImageToMaxBytes } from "@/lib/compressImageClient";

const MAX_STORED = 5 * 1024 * 1024;

function safeBlobPath(file: File) {
  const base = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 96);
  return `gallery/${Date.now()}-${base || "upload"}`;
}

export function GalleryUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);

  const processFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setProgress(null);

      if (!file.type.startsWith("image/")) {
        setError("Use a photo (JPG, PNG, WebP, GIF, or HEIC where supported).");
        return;
      }

      setBusy(true);
      try {
        let toUpload: File = file;
        if (file.size > MAX_STORED) {
          toUpload = await compressImageToMaxBytes(file, MAX_STORED);
        }
        if (toUpload.size > MAX_STORED) {
          setError(
            "Could not compress this image below 5MB. Try a different resolution or format.",
          );
          return;
        }

        const multipart = toUpload.size > 4 * 1024 * 1024;
        const { url } = await upload(safeBlobPath(toUpload), toUpload, {
          access: "public",
          handleUploadUrl: "/api/admin/blob",
          multipart,
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        });

        const result = await addGalleryImageFromUpload(url, null);
        if (!result.ok) {
          setError(result.error);
          return;
        }

        router.refresh();
        if (inputRef.current) inputRef.current.value = "";
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed. Check Blob token and try again.");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [router],
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    void processFile(e.target.files?.[0]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (busy) return;
    void processFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="mt-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onInputChange}
        disabled={busy}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <p className="mb-3 text-xs leading-relaxed text-ff-mist/70">
        Any file size is accepted. Images larger than 5MB are compressed in the browser before upload so
        they stay under 5MB.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={
          "flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition " +
          (drag
            ? "border-ff-mint/60 bg-ff-mint/5"
            : "border-ff-glow/25 bg-ff-void/40 hover:border-ff-glow/45 hover:bg-ff-void/60") +
          (busy ? " pointer-events-none opacity-60" : "")
        }
      >
        <span className="text-sm font-medium text-white">
          {busy ? "Uploading…" : "Drop an image here or tap to choose"}
        </span>
        <span className="text-xs text-ff-mist/65">JPEG, PNG, WebP, GIF — auto-compressed if over 5MB</span>
      </button>

      {progress != null && (
        <div className="mt-4">
          <div className="h-1 overflow-hidden rounded-full bg-ff-void ring-1 ring-ff-glow/20">
            <div
              className="h-full bg-gradient-to-r from-ff-glow to-ff-mint transition-[width] duration-200"
              style={{ width: `${Math.min(100, Math.round(progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
