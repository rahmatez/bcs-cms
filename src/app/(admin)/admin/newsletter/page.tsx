import Link from "next/link";

import { auth } from "@/lib/auth";
import { listNewsletterSubscribers, listVolunteers } from "@/server/services/interaction";
import { updateVolunteerStatusAction } from "./_actions";

const VOLUNTEER_STATUS_OPTIONS = [
  { value: "NEW", label: "Baru" },
  { value: "CONTACTED", label: "Dihubungi" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "ARCHIVED", label: "Arsip" }
];

export default async function AdminNewsletterPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MODERATOR", "CONTENT_ADMIN"].includes(role)) {
    return null;
  }

  const [subscribers, volunteers] = await Promise.all([listNewsletterSubscribers(), listVolunteers()]);

  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">Newsletter & Relawan</h1>
        <p className="text-sm text-neutral-500">
          Kelola daftar email supporter serta progres rekrutmen relawan komunitas.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Subscriber newsletter</h2>
            <p className="text-sm text-neutral-500">Download CSV untuk diimpor ke platform email pilihan.</p>
          </div>
          <Link
            href="/api/admin/newsletter/export"
            className="button-base inline-flex items-center gap-2 border border-neutral-300 bg-white text-sm text-neutral-700 hover:border-neutral-400"
          >
            Export CSV
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="grid grid-cols-[1.5fr,1fr,auto] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <span>Email</span>
            <span>Tanggal daftar</span>
            <span>Status</span>
          </div>
          {subscribers.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada subscriber.</p>}
          {subscribers.map((subscriber) => (
            <div key={subscriber.id} className="grid grid-cols-[1.5fr,1fr,auto] gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
              <span className="font-medium text-neutral-900">{subscriber.email}</span>
              <span className="text-xs text-neutral-500">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(subscriber.createdAt)}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                subscriber.verified ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-neutral-600"
              }`}>
                {subscriber.verified ? "Terverifikasi" : "Belum verifikasi"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Relawan / Kontributor</h2>
          <p className="text-sm text-neutral-500">
            Catat progres follow-up dan catatan penting untuk tiap relawan.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="grid grid-cols-[1.5fr,1fr,1fr,auto] gap-4 border-b border-neutral-200 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <span>Relawan</span>
            <span>Kontak</span>
            <span>Keahlian</span>
            <span>Status</span>
          </div>
          {volunteers.length === 0 && <p className="px-5 py-6 text-sm text-neutral-500">Belum ada relawan.</p>}
          {volunteers.map((volunteer) => (
            <div key={volunteer.id} className="grid grid-cols-[1.5fr,1fr,1fr,auto] gap-4 border-b border-neutral-100 px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{volunteer.name}</p>
                {volunteer.notes ? <p className="mt-1 text-xs text-neutral-500">{volunteer.notes}</p> : null}
              </div>
              <div className="text-xs text-neutral-500">
                <p>{volunteer.email}</p>
                {volunteer.phone ? <p>{volunteer.phone}</p> : null}
              </div>
              <div className="text-xs text-neutral-500">{volunteer.skills ?? "-"}</div>
              <div className="flex items-center gap-2">
                <form action={updateVolunteerStatusAction} className="flex items-center gap-2 text-xs">
                  <input type="hidden" name="volunteerId" value={volunteer.id} />
                  <select
                    name="status"
                    defaultValue={volunteer.status}
                    className="rounded-md border border-neutral-200 px-2 py-1 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {VOLUNTEER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
          ))}
        </div>
      </section>
    </div>
  );
}
