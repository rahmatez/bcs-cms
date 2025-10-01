/* eslint-disable @next/next/no-img-element */
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MediaItem {
  id: string;
  url: string;
  type: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

interface MediaGridProps {
  items: MediaItem[];
}

export function MediaGrid({ items }: MediaGridProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Hapus media ini?");
    if (!confirmed) return;

    startTransition(async () => {
      const response = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error ?? "Gagal menghapus media");
        return;
      }

      toast.success("Media dihapus");
      router.refresh();
    });
  };

  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada media tersimpan.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="relative h-48 w-full bg-neutral-100">
            {item.type === "image" ? (
              <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-600">
                Video
              </div>
            )}
          </div>
          <div className="space-y-2 p-4 text-sm">
            <p className="line-clamp-2 text-neutral-900" title={item.url}>
              {item.url}
            </p>
            {item.alt ? <p className="text-xs text-neutral-500">Alt: {item.alt}</p> : null}
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>
                {item.width ? `${item.width}px` : "-"} × {item.height ? `${item.height}px` : "-"}
              </span>
              <time>{new Date(item.createdAt).toLocaleDateString("id-ID")}</time>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              disabled={pending}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
