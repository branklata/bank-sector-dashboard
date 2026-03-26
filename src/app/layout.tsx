import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bank Sector & Market Monitoring Dashboard",
  description: "Real-time monitoring of bank sector indicators, market data, and economic signals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
