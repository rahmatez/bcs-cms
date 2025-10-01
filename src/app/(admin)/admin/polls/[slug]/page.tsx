import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getPollById } from "@/server/services/interaction";
import { PollForm } from "../_components/poll-form";

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 16);
}

interface AdminPollDetailProps {
  params: { id: string };
}

export default async function AdminPollDetail({ params }: AdminPollDetailProps) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "MODERATOR"].includes(role)) {
    return null;
  }

  const poll = await getPollById(params.id);
  if (!poll) {
    notFound();
  }

  const optionsJson = poll.optionsJson as Record<string, string>;
  const initialValues = {
    question: poll.question,
    options: Object.entries(optionsJson).map(([key, label]) => ({ key, label })),
    startsAt: formatDateInput(poll.startsAt),
    endsAt: formatDateInput(poll.endsAt)
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Edit polling</h1>
        <p className="text-sm text-neutral-500">Perbarui opsi atau jadwal penayangan.</p>
      </div>
      <PollForm pollId={poll.id} initialValues={initialValues} currentStatus={poll.status} />
    </div>
  );
}
