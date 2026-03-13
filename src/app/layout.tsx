import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Asset Intelligence Dashboard",
  description: "High-performance financial dashboard for indices, commodities, and bonds.",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import pkg from "../../package.json";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <TooltipProvider delayDuration={100}>
            {children}
            <div className="fixed bottom-2 right-4 text-[10px] text-muted-foreground/40 font-mono z-50 pointer-events-none select-none">
              v{pkg.version}
            </div>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
