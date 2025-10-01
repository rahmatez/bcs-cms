"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { pollFormSchema, type PollFormValues } from "../_schema";
import { deletePollAction, savePollAction } from "../_actions";

interface PollFormProps {
  pollId?: string;
  initialValues?: PollFormValues;
  currentStatus?: string;
}

export function PollForm({ pollId, initialValues, currentStatus }: PollFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues:
      initialValues ?? {
        question: "",
        options: [
          { key: "", label: "" },
          { key: "", label: "" }
        ],
        startsAt: "",
        endsAt: ""
      }
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  const addOption = () => {
    append({ key: "", label: "" });
  };

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await savePollAction({ ...values, pollId });
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menyimpan polling");
        return;
      }
      toast.success("Polling tersimpan");
      router.push(`/admin/polls/${result.pollId}`);
      router.refresh();
    });
  });

  const handleDelete = () => {
    if (!pollId) return;
    const confirmDelete = window.confirm("Hapus polling ini?");
    if (!confirmDelete) return;

    startTransition(async () => {
      const result = await deletePollAction(pollId);
      if (!result.ok) {
        toast.error(result.message ?? "Gagal menghapus polling");
        return;
      }
      toast.success("Polling dihapus");
      router.push("/admin/polls");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div>
          <label htmlFor="question" className="text-sm font-medium text-neutral-700">
            Pertanyaan polling
          </label>
          <input
            id="question"
            type="text"
            {...register("question")}
            className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Prediksi skor pertandingan?"
          />
          {errors.question && <p className="mt-1 text-xs text-red-600">{errors.question.message}</p>}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">Opsi polling</p>
            <button
              type="button"
              onClick={addOption}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Tambah opsi
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-neutral-200 p-4 md:grid-cols-[1fr,2fr,auto]">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Key
                  </label>
                  <input
                    type="text"
                    {...register(`options.${index}.key` as const)}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="menang"
                  />
                  {errors.options?.[index]?.key && (
                    <p className="mt-1 text-xs text-red-600">{errors.options[index]?.key?.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Label
                  </label>
                  <input
                    type="text"
                    {...register(`options.${index}.label` as const)}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Menang"
                  />
                  {errors.options?.[index]?.label && (
                    <p className="mt-1 text-xs text-red-600">{errors.options[index]?.label?.message}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (fields.length <= 2) {
                        toast.error("Minimal dua opsi diperlukan");
                        return;
                      }
                      remove(index);
                    }}
                    className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
          {errors.options?.root && typeof errors.options.root.message === "string" && (
            <p className="text-xs text-red-600">{errors.options.root.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startsAt" className="text-sm font-medium text-neutral-700">
              Mulai tampil
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              {...register("startsAt")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="endsAt" className="text-sm font-medium text-neutral-700">
              Selesai
            </label>
            <input
              id="endsAt"
              type="datetime-local"
              {...register("endsAt")}
              className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        {pollId ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
          >
            Hapus polling
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {currentStatus ? (
            <span className="text-xs uppercase tracking-wide text-neutral-500">Status saat ini: {currentStatus}</span>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="button-base min-w-[180px] bg-neutral-900 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : "Simpan polling"}
          </button>
        </div>
      </div>
    </form>
  );
}
