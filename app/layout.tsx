import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "RateConvert | High-Performance FX & Nigerian Market Intelligence",
  description:
    "Institutional-grade currency converter with real-time support for Official CBN NFEM rates, commercial bank FX quotes, and remittance provider arbitrage.",
  keywords: [
    "currency converter",
    "CBN NFEM rate",
    "Nigeria FX rate",
    "dollar to naira",
    "naira exchange rate today",
    "Wise vs LemFi vs Bank rates",
    "fintech remittance",
  ],
  authors: [{ name: "RateConvert Architecture Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B1120] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
