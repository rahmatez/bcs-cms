import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Brigata Curva Sud - Official Website",
    template: "%s | Brigata Curva Sud"
  },
  description: "Portal resmi Brigata Curva Sud untuk berita terkini, jadwal pertandingan, dan merchandise resmi. Bersatu dalam semangat, loyalitas, dan kebanggaan.",
  keywords: ["Brigata Curva Sud", "BCS", "Supporter", "Yogyakarta", "Football", "Soccer"],
  authors: [{ name: "Brigata Curva Sud" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://brigatacurvasud.com",
    title: "Brigata Curva Sud - Official Website",
    description: "Portal resmi Brigata Curva Sud untuk berita terkini, jadwal pertandingan, dan merchandise resmi.",
    siteName: "Brigata Curva Sud",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brigata Curva Sud - Official Website",
    description: "Portal resmi Brigata Curva Sud untuk berita terkini, jadwal pertandingan, dan merchandise resmi.",
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
