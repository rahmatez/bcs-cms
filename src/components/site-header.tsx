"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/news", label: "News" },
  { href: "/matches", label: "Matches" },
  { href: "/store", label: "Store" },
  { href: "/pages/about", label: "About" }
];

export function SiteHeader({ className }: { className?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-lg shadow-sm",
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <span className="text-xl font-black text-black">BC</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-xl font-black uppercase tracking-tight text-dark">
                Brigata Curva Sud
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                Official Website
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors duration-200 hover:text-primary-600 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-primary-500 after:transition-all after:duration-300 hover:after:w-3/4"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-dark px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-dark-200 hover:shadow-lg hover:scale-105"
            >
              Admin Panel
              <ChevronRight className="h-4 w-4" />
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 hover:text-primary-600 md:hidden"
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
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden animate-slide-down">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-semibold text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="block rounded-lg bg-dark px-3 py-2 text-base font-semibold text-white hover:bg-dark-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
