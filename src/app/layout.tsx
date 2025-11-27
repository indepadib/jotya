import type { Metadata } from "next";
// import dynamic from 'next/dynamic';
import "./globals.css";
import BottomNav from "@/components/Layout/BottomNav";
import DesktopHeader from "@/components/Layout/DesktopHeader";

// const FloatingAIChat = dynamic(() => import('@/components/AI/FloatingAIChat'), {
//   ssr: false,
//   loading: () => null
// });

export const metadata: Metadata = {
  title: "Jotya | Premium Second-Hand Marketplace",
  description: "Buy and sell authenticated luxury fashion in Morocco. AI-verified listings, secure payments, and a trusted community.",
  openGraph: {
    title: "Jotya | Buy & Sell Authenticated Fashion",
    description: "The safest way to buy second-hand luxury items in Morocco.",
    type: "website",
    locale: "en_US", // or fr_MA
    siteName: "Jotya",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DesktopHeader />
        <main>{children}</main>
        <BottomNav />
        {/* <FloatingAIChat /> */}
      </body>
    </html>
  );
}
