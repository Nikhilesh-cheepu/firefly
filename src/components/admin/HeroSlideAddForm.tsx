"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { addHeroSlideFromUpload } from "@/app/admin/hero/actions";

function safeBlobPath(file: File) {
  const base = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 96);
  return `hero/slide/${Date.now()}-${base || "upload"}`;
}

function inferSlideType(file: File): "IMAGE" | "VIDEO" | null {
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type.startsWith("image/")) return "IMAGE";
  return null;
}

export function HeroSlideAddForm() {
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

      const slideType = inferSlideType(file);
      if (!slideType) {
        setError("Use a photo (JPG, PNG, WebP, GIF) or a video (MP4, WebM, MOV).");
        return;
      }

      setBusy(true);
      try {
        const multipart = file.size > 4 * 1024 * 1024 || slideType === "VIDEO";
        const { url } = await upload(safeBlobPath(file), file, {
          access: "public",
          handleUploadUrl: "/api/admin/blob",
          multipart,
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        });

        const result = await addHeroSlideFromUpload(url, slideType);
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
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,image/*,video/*"
        className="sr-only"
        onChange={onInputChange}
        disabled={busy}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

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
          {busy ? "Uploading…" : "Drop a file here or tap to choose"}
        </span>
        <span className="text-xs text-ff-mist/65">Image or video — type is detected automatically</span>
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
