import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Brigata Curva Sud CMS",
    template: "%s | Brigata Curva Sud CMS"
  },
  description: "Portal resmi Brigata Curva Sud untuk konten, jadwal, toko, dan interaksi supporter."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
