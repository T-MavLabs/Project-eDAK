import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Display } from "next/font/google";
// Import UX4G design tokens before globals.css so variables are available
import "../src/styles/design-tokens.css";
import "../src/styles/ux4g-dashboard.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { CommerceNavbar } from "@/components/commerce/CommerceNavbar";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansDisplay = Noto_Sans_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-display",
  display: "swap",
});

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
    <html lang="en" className={`${notoSans.variable} ${notoSansDisplay.variable}`}>
      <body className="min-h-screen antialiased">
        <CommerceNavbar />
        <main className="min-h-[calc(100vh-64px)] bg-muted/40">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
