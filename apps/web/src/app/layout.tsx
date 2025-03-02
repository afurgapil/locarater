import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Locarater - Mekan Değerlendirme Platformu",
  description: "Mekanları keşfet, değerlendir ve paylaş",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
