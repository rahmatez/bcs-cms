"use client";

import { signOut } from "next-auth/react";

export function AdminTopbar({ userName }: { userName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Brigata Curva Sud</p>
        <h1 className="text-lg font-semibold text-neutral-900">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">{userName}</span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="button-base border border-neutral-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
