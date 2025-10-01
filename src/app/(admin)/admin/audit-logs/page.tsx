import Link from "next/link";
import { auth } from "@/lib/auth";
import { listAuditLogs } from "@/server/services/audit";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

interface AuditLogsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (role !== "SUPER_ADMIN") {
    return null;
  }

  const page = Number(typeof searchParams?.page === "string" ? searchParams.page : "1") || 1;
  const pageSize = 20;

  const { items, total } = await listAuditLogs({ page, pageSize });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  type AuditLogItem = typeof items[number];

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Audit log</h1>
        <p className="text-sm text-neutral-500">
          Catatan siapa melakukan apa, kapan, dan terhadap entitas mana.
        </p>
      </section>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[1.5fr,1fr,1fr] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Aksi</span>
          <span>Pelaku</span>
          <span>Waktu</span>
        </div>
        {items.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada aktivitas.</p>}
        {items.map((log: AuditLogItem) => (
          <div key={log.id} className="grid grid-cols-[1.5fr,1fr,1fr] gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
            <div>
              <p className="font-semibold text-neutral-900">{log.action}</p>
              <p className="text-xs text-neutral-500">Target: {log.targetType} • ID {log.targetId}</p>
              {log.metaJson ? (
                <pre className="mt-2 overflow-x-auto rounded bg-neutral-100 px-3 py-2 text-[11px] text-neutral-700">
                  {JSON.stringify(log.metaJson, null, 2)}
                </pre>
              ) : null}
            </div>
            <div className="text-xs text-neutral-500">
              <p className="font-medium text-neutral-900">{log.actor?.name ?? "(Account)"}</p>
              <p>{log.actor?.email ?? "-"}</p>
              <p>{log.actor?.role ?? "-"}</p>
            </div>
            <div className="text-xs text-neutral-500">{formatDate(log.createdAt)}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>
          Halaman {page} dari {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/audit-logs?page=${Math.max(1, page - 1)}`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-60"
            aria-disabled={page === 1}
          >
            Sebelumnya
          </Link>
          <Link
            href={`/admin/audit-logs?page=${Math.min(totalPages, page + 1)}`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-60"
            aria-disabled={page === totalPages}
          >
            Selanjutnya
          </Link>
        </div>
      </div>
    </div>
  );
}
