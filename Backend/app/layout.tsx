import type { Metadata } from "next";
import "./globals.css";

import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "DAKSH – Delivery Analytics & Knowledge System for Shipment",
  description:
    "DAKSH is an API-first Smart Parcel Tracking & Predictive Delivery Platform built for India Post, enabling proactive logistics, analytics, and MSME integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <main className="min-h-[calc(100vh-64px)] bg-muted/40">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
