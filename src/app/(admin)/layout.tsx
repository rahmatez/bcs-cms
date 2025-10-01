import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

const ALLOWED_ROLES = [
  Role.SUPER_ADMIN,
  Role.CONTENT_ADMIN,
  Role.MATCH_ADMIN,
  Role.MERCH_ADMIN,
  Role.FINANCE,
  Role.MODERATOR
] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role?: Role | null): role is AllowedRole {
  return !!role && (ALLOWED_ROLES as readonly Role[]).includes(role);
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!hasAccess(session?.user?.role)) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar role={session.user.role} />
      <div className="flex flex-1 flex-col">
        <AdminTopbar userName={session.user.name ?? "Admin"} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
