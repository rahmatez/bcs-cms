"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { matchFormSchema, type MatchFormValues } from "../_schema";
import { deleteMatchAction, saveMatchAction } from "../_actions";

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Terjadwal" },
  { value: "LIVE", label: "Live" },
  { value: "FINISHED", label: "Selesai" },
  { value: "POSTPONED", label: "Ditunda" }
] as const;

interface MatchFormProps {
  matchId?: string;
  initialValues?: MatchFormValues;
}

export function MatchForm({ matchId, initialValues }: MatchFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues:
      initialValues ?? {
        opponent: "",
        eventDate: new Date().toISOString().slice(0, 16),
        venue: "",
        competition: "",
        status: "SCHEDULED",
        scoreHome: "",
        scoreAway: "",
        highlightText: "",
        highlightUrl: ""
      }
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = form;

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveMatchAction({ ...values, matchId });
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menyimpan jadwal");
        return;
      }

      toast.success("Jadwal tersimpan");
      router.push(`/admin/matches/${result.matchId}`);
      router.refresh();
    });
  });

  const handleDelete = () => {
    if (!matchId) return;
    const confirmed = window.confirm("Hapus pertandingan ini?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteMatchAction(matchId);
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menghapus pertandingan");
        return;
      }

      toast.success("Pertandingan dihapus");
      router.push("/admin/matches");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="opponent" className="text-sm font-medium text-neutral-700">
              Lawan
            </label>
            <input
              id="opponent"
              type="text"
              {...register("opponent")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Contoh: Persija"
            />
            {errors.opponent && <p className="mt-1 text-xs text-red-600">{errors.opponent.message}</p>}
          </div>

          <div>
            <label htmlFor="eventDate" className="text-sm font-medium text-neutral-700">
              Tanggal & waktu
            </label>
            <input
              id="eventDate"
              type="datetime-local"
              {...register("eventDate")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {errors.eventDate && <p className="mt-1 text-xs text-red-600">{errors.eventDate.message}</p>}
          </div>

          <div>
            <label htmlFor="venue" className="text-sm font-medium text-neutral-700">
              Venue
            </label>
            <input
              id="venue"
              type="text"
              {...register("venue")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Stadion Mandala Krida"
            />
            {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue.message}</p>}
          </div>

          <div>
            <label htmlFor="competition" className="text-sm font-medium text-neutral-700">
              Kompetisi
            </label>
            <input
              id="competition"
              type="text"
              {...register("competition")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Liga 1"
            />
            {errors.competition && <p className="mt-1 text-xs text-red-600">{errors.competition.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="status" className="text-sm font-medium text-neutral-700">
              Status
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="scoreHome" className="text-sm font-medium text-neutral-700">
                Skor BCS
              </label>
              <input
                id="scoreHome"
                type="number"
                min={0}
                {...register("scoreHome")}
                className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {errors.scoreHome && <p className="mt-1 text-xs text-red-600">{errors.scoreHome.message}</p>}
            </div>
            <div>
              <label htmlFor="scoreAway" className="text-sm font-medium text-neutral-700">
                Skor lawan
              </label>
              <input
                id="scoreAway"
                type="number"
                min={0}
                {...register("scoreAway")}
                className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {errors.scoreAway && <p className="mt-1 text-xs text-red-600">{errors.scoreAway.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="highlightText" className="text-sm font-medium text-neutral-700">
              Highlight singkat
            </label>
            <textarea
              id="highlightText"
              rows={3}
              {...register("highlightText")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Catat momen penting pertandingan"
            />
            {errors.highlightText && <p className="mt-1 text-xs text-red-600">{errors.highlightText.message}</p>}
          </div>

          <div>
            <label htmlFor="highlightUrl" className="text-sm font-medium text-neutral-700">
              URL video highlight
            </label>
            <input
              id="highlightUrl"
              type="url"
              {...register("highlightUrl")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="https://youtu.be/..."
            />
            {errors.highlightUrl && <p className="mt-1 text-xs text-red-600">{errors.highlightUrl.message}</p>}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        {matchId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Hapus pertandingan
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="button-base min-w-[180px] bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : "Simpan pertandingan"}
        </button>
      </div>
    </form>
  );
}
