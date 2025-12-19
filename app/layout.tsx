import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { CommerceNavbar } from "@/components/commerce/CommerceNavbar";

export const metadata: Metadata = {
  title: "Smart Parcel Tracking & Predictive Delivery System – India Post",
  description:
    "Hackathon demo frontend: smart parcel tracking, predictive delays, proactive alerts, AI complaints, and admin analytics (mock data).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <CommerceNavbar />
        <main className="min-h-[calc(100vh-64px)] bg-muted/40">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
