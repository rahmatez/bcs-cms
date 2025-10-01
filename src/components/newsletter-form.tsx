"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
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
      toast.success("🎉 Berhasil! Cek email kamu untuk konfirmasi.");
      setEmail("");
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal mendaftar newsletter");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative flex items-center">
        <Mail className="absolute left-4 h-5 w-5 text-neutral-400" />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Masukkan email kamu"
          className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-12 py-4 text-white placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white/20 focus:outline-none transition-all"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="group flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-4 font-bold text-black transition-all hover:bg-primary-400 hover:shadow-lg hover:gap-4 disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Subscribe Sekarang"}
        <ArrowRight className="h-5 w-5 transition-transform" />
      </button>
    </form>
  );
}
