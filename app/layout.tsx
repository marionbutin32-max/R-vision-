import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "R-vision – Révision PASS/LAS",
  description: "App de révision médicale avec répétition espacée",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${geist.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-indigo-400 font-bold text-lg tracking-tight">
            R-vision
          </Link>
          <span className="text-gray-600 text-xs">PASS / LAS</span>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
