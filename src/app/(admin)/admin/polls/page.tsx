import Link from "next/link";

import { auth } from "@/lib/auth";
import { listPolls } from "@/server/services/interaction";
import { updatePollStatusAction } from "./_actions";

function formatDate(value: Date | null | undefined) {
  if (!value) return "Tidak dijadwalkan";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export default async function AdminPollsPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MODERATOR"].includes(role)) {
    return null;
  }

  const polls = await listPolls();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Polling supporter</h1>
          <p className="text-sm text-neutral-500">Kelola pertanyaan matchday dan lihat hasilnya secara langsung.</p>
        </div>
        <Link
          href="/admin/polls/new"
          className="button-base inline-flex items-center gap-2 bg-primary text-primary-foreground"
        >
          Polling baru
        </Link>
      </section>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-[2fr,1fr,1fr,auto] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>Pertanyaan</span>
          <span>Periode</span>
          <span>Vote</span>
          <span>Status</span>
        </div>
        {polls.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada polling.</p>}
        {polls.map((poll) => {
          const totalVotes = poll.votes.length;
          const uniqueOptions = Object.keys(poll.optionsJson as Record<string, string>).length;
          return (
            <div key={poll.id} className="grid grid-cols-[2fr,1fr,1fr,auto] gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
              <div>
                <Link href={`/admin/polls/${poll.id}`} className="font-medium text-neutral-900 hover:underline">
                  {poll.question}
                </Link>
                <p className="mt-1 text-xs text-neutral-500">{uniqueOptions} opsi</p>
              </div>
              <div className="text-xs text-neutral-500">
                <p>Mulai: {formatDate(poll.startsAt)}</p>
                <p>Selesai: {formatDate(poll.endsAt)}</p>
              </div>
              <div className="text-xs text-neutral-500">
                <p>Total vote: <span className="font-semibold text-neutral-900">{totalVotes}</span></p>
              </div>
              <div className="flex flex-col items-start gap-2 text-xs">
                <span className="rounded-full bg-neutral-200 px-3 py-1 font-medium text-neutral-700">{poll.status}</span>
                <form action={updatePollStatusAction} className="flex items-center gap-2">
                  <input type="hidden" name="pollId" value={poll.id} />
                  <select
                    name="status"
                    defaultValue={poll.status}
                    className="rounded-md border border-neutral-200 px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Nonaktif</option>
                    <option value="ARCHIVED">Arsip</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white transition hover:bg-neutral-800"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
