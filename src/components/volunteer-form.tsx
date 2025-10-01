"use client";

import { useState } from "react";
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
      toast.success("Terima kasih! Tim kami akan menghubungi segera.");
      setForm({ name: "", email: "", phone: "", skills: "", notes: "" });
    } else {
      const data = await response.json();
      toast.error(data.error ?? "Gagal mengirim formulir");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vol-name" className="text-sm font-medium text-neutral-100">
            Nama lengkap
          </label>
          <input
            id="vol-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="vol-email" className="text-sm font-medium text-neutral-100">
            Email
          </label>
          <input
            id="vol-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vol-phone" className="text-sm font-medium text-neutral-100">
            Nomor WhatsApp
          </label>
          <input
            id="vol-phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="vol-skills" className="text-sm font-medium text-neutral-100">
            Keahlian/minat
          </label>
          <input
            id="vol-skills"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="vol-notes" className="text-sm font-medium text-neutral-100">
          Ceritakan singkat motivasi kamu
        </label>
        <textarea
          id="vol-notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="button-base w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? "Mengirim..." : "Gabung sebagai volunteer"}
      </button>
    </form>
  );
}
