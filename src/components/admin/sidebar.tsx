"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

const navItems: Array<{
  label: string;
  href: string;
  roles: Role[];
}> = [
  { label: "Dashboard", href: "/admin", roles: [Role.SUPER_ADMIN, Role.CONTENT_ADMIN, Role.MATCH_ADMIN, Role.MERCH_ADMIN, Role.FINANCE, Role.MODERATOR] },
  { label: "Articles", href: "/admin/articles", roles: [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] },
  { label: "Pages", href: "/admin/pages", roles: [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] },
  { label: "Media", href: "/admin/media", roles: [Role.SUPER_ADMIN, Role.CONTENT_ADMIN] },
  { label: "Matches", href: "/admin/matches", roles: [Role.SUPER_ADMIN, Role.MATCH_ADMIN] },
  { label: "Products", href: "/admin/products", roles: [Role.SUPER_ADMIN, Role.MERCH_ADMIN] },
  { label: "Orders", href: "/admin/orders", roles: [Role.SUPER_ADMIN, Role.MERCH_ADMIN, Role.FINANCE] },
  { label: "Coupons", href: "/admin/coupons", roles: [Role.SUPER_ADMIN, Role.MERCH_ADMIN] },
  { label: "Comments", href: "/admin/comments", roles: [Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN] },
  { label: "Polls", href: "/admin/polls", roles: [Role.SUPER_ADMIN, Role.MODERATOR] },
  { label: "Newsletter", href: "/admin/newsletter", roles: [Role.SUPER_ADMIN, Role.MODERATOR, Role.CONTENT_ADMIN] },
  { label: "Audit Logs", href: "/admin/audit-logs", roles: [Role.SUPER_ADMIN] }
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r border-neutral-200 bg-white p-6 lg:flex">
      <div className="font-display text-lg font-semibold uppercase tracking-widest text-neutral-900">
        BCS Admin
      </div>
      <nav className="mt-8 space-y-1 text-sm">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-neutral-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
