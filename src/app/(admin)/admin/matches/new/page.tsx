import { auth } from "@/lib/auth";
import { MatchForm } from "../_components/match-form";

export default async function AdminMatchCreatePage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MATCH_ADMIN"].includes(role)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Jadwal baru</h1>
        <p className="text-sm text-neutral-500">Masukkan detail pertandingan kandang maupun tandang.</p>
      </div>
      <MatchForm />
    </div>
  );
}
