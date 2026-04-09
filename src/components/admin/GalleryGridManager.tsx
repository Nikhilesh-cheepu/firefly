"use client";

import type { GalleryImage } from "@prisma/client";
import { useMemo, useState } from "react";
import { deleteGalleryImage, deleteGalleryImages } from "@/app/admin/gallery/actions";

type Props = {
  images: GalleryImage[];
};

export function GalleryGridManager({ images }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedCount = selected.size;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clear = () => setSelected(new Set());

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-ff-mist/65">{selectedCount} selected</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            disabled={selectedCount === 0}
            className="rounded-lg border border-ff-mint/25 px-3 py-1.5 text-xs text-ff-mist disabled:opacity-40"
          >
            Clear
          </button>
          <form action={deleteGalleryImages}>
            {selectedIds.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <button
              type="submit"
              disabled={selectedCount === 0}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-500/15 disabled:opacity-40"
            >
              Delete selected
            </button>
          </form>
        </div>
      </div>

      <ul className="grid grid-cols-3 gap-2.5">
        {images.map((img) => {
          const checked = selected.has(img.id);
          return (
            <li
              key={img.id}
              className={
                "ff-card rounded-xl border bg-ff-void/50 p-2 transition " +
                (checked
                  ? "border-ff-glow/40 ring-1 ring-ff-glow/25"
                  : "border-ff-glow/12")
              }
            >
              <button
                type="button"
                onClick={() => toggle(img.id)}
                className="relative block w-full overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-24 w-full object-cover" />
                <span
                  className={
                    "absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold " +
                    (checked
                      ? "border-ff-glow/60 bg-ff-glow/30 text-ff-glow"
                      : "border-ff-mist/50 bg-ff-void/65 text-ff-mist")
                  }
                >
                  {checked ? "✓" : ""}
                </span>
              </button>
              <div className="mt-2 flex justify-end">
                <form action={deleteGalleryImage}>
                  <input type="hidden" name="id" value={img.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-500/35 px-2 py-1 text-[11px] text-red-200 transition hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

