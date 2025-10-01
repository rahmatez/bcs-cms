import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-neutral-200">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                <span className="text-2xl font-black text-black">BC</span>
              </div>
              <div>
                <div className="font-display text-2xl font-black uppercase tracking-tight text-white">
                  Brigata Curva Sud
                </div>
                <div className="text-sm font-semibold uppercase tracking-wider text-primary-400">
                  Official Website
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-400 max-w-md mb-6">
              Komunitas supporter yang berdedikasi untuk mendukung tim kebanggaan Yogyakarta. 
              Bersatu dalam semangat, loyalitas, dan kebanggaan.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-200 text-neutral-400 transition-all duration-200 hover:bg-primary-500 hover:text-black hover:scale-110"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-200 text-neutral-400 transition-all duration-200 hover:bg-primary-500 hover:text-black hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-200 text-neutral-400 transition-all duration-200 hover:bg-primary-500 hover:text-black hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-200 text-neutral-400 transition-all duration-200 hover:bg-primary-500 hover:text-black hover:scale-110"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/news" className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                  News & Articles
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                  Match Schedule
                </Link>
              </li>
              <li>
                <Link href="/store" className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                  Official Store
                </Link>
              </li>
              <li>
                <Link href="/pages/about" className="text-sm text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Yogyakarta, Indonesia</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <a href="mailto:halo@bcs.id" className="hover:text-primary-400 transition-colors duration-200">
                  halo@bcs.id
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>+62 XXX XXXX XXXX</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-neutral-400">
              © {currentYear} Brigata Curva Sud. All rights reserved.
            </p>
            <nav className="flex gap-6 text-sm">
              <Link href="/pages/privacy" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/pages/terms" className="text-neutral-400 hover:text-primary-400 transition-colors duration-200">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
