"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState("admin@bcs.test");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false
    });

    if (response?.error) {
      setError("Login gagal. Periksa email dan password.");
      setLoading(false);
      return;
    }

    window.location.href = response?.url ?? callbackUrl;
  };

  return (
    <div>
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Brigata Curva Sud</p>
        <h1 className="mt-4 text-2xl font-semibold">Masuk ke BCS CMS</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Gunakan kredensial resmi untuk mengelola konten dan operasional.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            required
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="button-base w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Lupa password? Hubungi <Link href="mailto:tech@bcs.id">tech@bcs.id</Link>.
      </p>
    </div>
  );
}
