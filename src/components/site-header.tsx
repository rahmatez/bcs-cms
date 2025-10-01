import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/news", label: "News" },
  { href: "/matches", label: "Matches" },
  { href: "/store", label: "Store" },
  { href: "/pages/about", label: "About" }
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "border-b border-neutral-200 bg-white/90 backdrop-blur sticky top-0 z-50",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold uppercase tracking-wide">
          Brigata Curva Sud
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/admin"
          className="button-base bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
