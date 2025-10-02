import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 border-t border-neutral-700 text-neutral-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black text-white">BCS</span>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
              Our vision is to provide the best service and share the best experience for many people. 
              Together we support our beloved team with passion and pride.
            </p>
            
            {/* Social Media - Follow Us */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Follow us
            </h3>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 transition-all duration-200 hover:bg-primary hover:text-white hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 transition-all duration-200 hover:bg-primary hover:text-white hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 transition-all duration-200 hover:bg-primary hover:text-white hover:scale-110"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 transition-all duration-200 hover:bg-primary hover:text-white hover:scale-110"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pages/about" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pages/gallery" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                  News & Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pages/faq" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-neutral-400">
              © {currentYear} Brigata Curva Sud. All rights reserved.
            </p>
            <div className="flex gap-2 text-xs text-neutral-500">
              <span>Build with love by</span>
              <a 
                href="https://example.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-white hover:text-neutral-300 transition-colors"
              >
                Your Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
