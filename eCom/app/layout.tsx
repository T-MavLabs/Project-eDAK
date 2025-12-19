import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/Footer";

const notoSans = Noto_Sans({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "VYAPAR – Virtual Yet Accessible Postal Aggregated Retail",
  description:
    "VYAPAR is a lightweight Indian MSME e-commerce demo platform powered by India Post (DAKSH), showcasing how small sellers can integrate predictive postal logistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSans.variable}>
      <body className="min-h-screen antialiased">
        <main className="min-h-[calc(100vh-64px)] bg-muted/40">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
