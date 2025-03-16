import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Locarater - Mekan Değerlendirme Platformu",
    template: "%s | Locarater",
  },
  description:
    "Mekanları keşfet, değerlendir ve paylaş. Locarater ile en iyi restoranları, kafeleri ve eğlence mekanlarını bulun.",
  keywords: [
    "mekan değerlendirme",
    "restoran",
    "kafe",
    "eğlence",
    "locarater",
    "mekan keşfi",
  ],
  authors: [{ name: "Locarater Team" }],
  creator: "Locarater",
  publisher: "Locarater",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: [{ url: "/apple-icon.png" }],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://locarater.com",
    siteName: "Locarater",
    title: "Locarater - Mekan Değerlendirme Platformu",
    description:
      "Mekanları keşfet, değerlendir ve paylaş. Locarater ile en iyi restoranları, kafeleri ve eğlence mekanlarını bulun.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow bg-gray-50 dark:bg-gray-900">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics
            GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          />
        )}
      </body>
    </html>
  );
}
