"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    setLoading(true);

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setLoading(false);

    if (response.ok) {
      toast.success("Berhasil berlangganan buletin BCS!");
      setEmail("");
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal mendaftar newsletter");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email kamu"
        className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="button-base bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? "Mengirim..." : "Gabung"}
      </button>
    </form>
  );
}
