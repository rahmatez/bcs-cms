"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Home, Newspaper, Calendar, ShoppingBag, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "Blog", icon: Newspaper },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/pages/about", label: "About", icon: Info }
];

export function SiteHeader({ className }: { className?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Untuk halaman selain homepage, selalu gunakan background dark
  const hasBackground = !isHomepage || scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        hasBackground 
          ? "bg-neutral-900 shadow-lg" 
          : "bg-transparent",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group"
          >
            <div className={cn(
              "relative h-12 w-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 overflow-hidden",
              hasBackground 
                ? "bg-neutral-800" 
                : "bg-white/10 backdrop-blur-sm border-2 border-white/20"
            )}>
              <Image
                src="/images/logo/emblem w.png"
                alt="BCS Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-lg font-black uppercase tracking-tight text-white transition-colors">
                Brigata Curva Sud
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-lg",
                  pathname === item.href
                    ? hasBackground 
                      ? "bg-primary text-white shadow-lg"
                      : "bg-white/20 backdrop-blur-sm text-white"
                    : hasBackground
                      ? "text-neutral-300 hover:text-white"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                <span className="hidden xl:inline">{item.label}</span>
                <item.icon className="h-5 w-5 xl:hidden" />
              </Link>
            ))}
          </nav>

          {/* Mobile menu button - Bottom fixed on mobile */}
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-lg p-2 transition-colors lg:hidden",
              hasBackground
                ? "text-neutral-300 hover:bg-neutral-800"
                : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <nav className="flex items-center justify-between rounded-2xl bg-neutral-800 px-6 py-4 shadow-2xl border border-neutral-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200",
                  isActive 
                    ? "text-white" 
                    : "text-neutral-400 hover:text-white"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  isActive && "bg-primary text-white shadow-lg"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
