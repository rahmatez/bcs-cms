import { auth } from "@/lib/auth";
import { PollForm } from "../_components/poll-form";

export default async function AdminPollCreate() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MODERATOR"].includes(role)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Polling baru</h1>
        <p className="text-sm text-neutral-500">Rancang polling untuk menggali opini supporter.</p>
      </div>
      <PollForm />
    </div>
  );
}
