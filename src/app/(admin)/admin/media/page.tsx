import { auth } from "@/lib/auth";
import { listMedia } from "@/server/services/media";
import { MediaUploadForm } from "./_components/media-upload-form";
import { MediaGrid } from "./_components/media-grid";

interface AdminMediaPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(role)) {
    return null;
  }

  const page = Number(searchParams?.page ?? "1");
  const query = typeof searchParams?.query === "string" ? searchParams.query : undefined;

  const mediaResult = await listMedia({ page, pageSize: 24, query });
  const plainItems = mediaResult.items.map((item) => ({
    id: item.id,
    url: item.url,
    type: item.type,
    alt: item.alt,
    width: item.width,
    height: item.height,
    createdAt: item.createdAt.toISOString()
  }));

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Media Manager</h1>
        <p className="text-sm text-neutral-500">
          Kelola gambar dan video yang digunakan di artikel dan halaman statis.
        </p>
      </section>

      <section className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-6 lg:grid-cols-[1.2fr,2fr]">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Tambah media</h2>
          <p className="text-xs text-neutral-500">
            Integrasikan dengan storage S3/R2 untuk upload langsung dan cropping. Sementara, tempelkan URL yang sudah
            diunggah secara manual.
          </p>
          <MediaUploadForm />
        </div>
        <div>
          <form className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center">
            <input
              type="search"
              name="query"
              defaultValue={query}
              placeholder="Cari berdasarkan alt text atau URL"
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button type="submit" className="button-base bg-neutral-900 text-white">
              Cari
            </button>
          </form>
          <div className="mt-4">
            <MediaGrid items={plainItems} />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Menampilkan {(mediaResult.page - 1) * mediaResult.pageSize + 1} -
          {Math.min(mediaResult.page * mediaResult.pageSize, mediaResult.total)} dari {mediaResult.total}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={`?page=${Math.max(mediaResult.page - 1, 1)}${query ? `&query=${encodeURIComponent(query)}` : ""}`}
            className={`button-base h-8 px-3 text-xs ${mediaResult.page <= 1 ? "pointer-events-none opacity-40" : "bg-neutral-200"}`}
          >
            Sebelumnya
          </a>
          <a
            href={`?page=${mediaResult.page + 1}${query ? `&query=${encodeURIComponent(query)}` : ""}`}
            className={`button-base h-8 px-3 text-xs ${
              mediaResult.page * mediaResult.pageSize >= mediaResult.total
                ? "pointer-events-none opacity-40"
                : "bg-neutral-200"
            }`}
          >
            Selanjutnya
          </a>
        </div>
      </section>
    </div>
  );
}
