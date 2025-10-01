"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";

interface PollOption {
  key: string;
  label: string;
  votes: number;
}

interface PollWidgetProps {
  pollId: string;
  question: string;
  options: PollOption[];
}

export function PollWidget({ pollId, question, options }: PollWidgetProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [tallies, setTallies] = useState(options);

  const handleVote = () => {
    if (!selected) {
      toast.error("Pilih salah satu opsi terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionKey: selected })
      });

      if (response.ok) {
        toast.success("Terima kasih sudah turut bersuara!");
        setTallies((prev) =>
          prev.map((option) =>
            option.key === selected ? { ...option, votes: option.votes + 1 } : option
          )
        );
      } else {
        const data = await response.json();
        toast.error(data.error ?? "Gagal mengirim vote");
      }
    });
  };

  const totalVotes = tallies.reduce((acc, option) => acc + option.votes, 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-primary">Polling</p>
      <h3 className="mt-3 text-lg font-semibold text-neutral-900">{question}</h3>
      <div className="mt-4 space-y-3">
        {tallies.map((option) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          const isSelected = selected === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelected(option.key)}
              className={`w-full rounded-md border px-4 py-3 text-left text-sm transition ${isSelected ? "border-primary bg-primary/10" : "border-neutral-200 hover:border-primary"}`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="mt-1 block text-xs text-neutral-500">
                {percentage}% ({option.votes} suara)
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleVote}
        disabled={isPending}
        className="button-base mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPending ? "Mengirim..." : "Vote sekarang"}
      </button>
    </div>
  );
}
