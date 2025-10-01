"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function VolunteerForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", skills: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/volunteer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setLoading(false);

    if (response.ok) {
      toast.success("🎉 Terima kasih! Tim kami akan menghubungi segera.");
      setForm({ name: "", email: "", phone: "", skills: "", notes: "" });
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal mengirim formulir");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vol-name" className="text-sm font-semibold text-white">
            Nama Lengkap <span className="text-primary-400">*</span>
          </label>
          <input
            id="vol-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-primary-500 focus:bg-white/20 focus:outline-none transition-all"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="vol-email" className="text-sm font-semibold text-white">
            Email <span className="text-primary-400">*</span>
          </label>
          <input
            id="vol-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-primary-500 focus:bg-white/20 focus:outline-none transition-all"
            required
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vol-phone" className="text-sm font-semibold text-white">
            Nomor WhatsApp
          </label>
          <input
            id="vol-phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="08123456789"
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-primary-500 focus:bg-white/20 focus:outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="vol-skills" className="text-sm font-semibold text-white">
            Keahlian/Minat
          </label>
          <input
            id="vol-skills"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Fotografi, Desain, dll"
            className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-primary-500 focus:bg-white/20 focus:outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="vol-notes" className="text-sm font-semibold text-white">
          Ceritakan Motivasi Kamu
        </label>
        <textarea
          id="vol-notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Kenapa kamu ingin bergabung sebagai volunteer..."
          className="w-full rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-neutral-500 focus:border-primary-500 focus:bg-white/20 focus:outline-none transition-all resize-none"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-4 font-bold text-black transition-all hover:bg-primary-400 hover:shadow-lg hover:gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Mengirim..." : "Gabung Sebagai Volunteer"}
        <ArrowRight className="h-5 w-5 transition-transform" />
      </button>
    </form>
  );
}
