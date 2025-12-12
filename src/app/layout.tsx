import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import "./globals.css";
import BottomNav from "@/components/Layout/BottomNav";
import DesktopHeader from "@/components/Layout/DesktopHeader";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import ToastContainer from "@/components/Toast/ToastContainer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { NotificationProvider } from "@/components/Notifications/NotificationProvider";

// Lazy load FloatingAIChat to reduce initial bundle size
const FloatingAIChat = dynamic(() => import('@/components/AI/FloatingAIChat'), {
  ssr: false,
  loading: () => null
});

export const metadata: Metadata = {
  title: "Jotya | Premium Second-Hand Marketplace in Morocco",
  description: "Buy and sell authenticated luxury fashion in Morocco. AI-verified listings, secure payments, and a trusted community. Shop premium brands at great prices.",
  keywords: ['jotya', 'morocco', 'second-hand', 'marketplace', 'luxury fashion', 'authenticated', 'pre-owned', 'designer brands', 'maroc', 'occasion'],
  authors: [{ name: 'Jotya' }],
  creator: 'Jotya',
  publisher: 'Jotya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jotya.ma'),
  openGraph: {
    title: "Jotya | Buy & Sell Authenticated Fashion",
    description: "The safest way to buy second-hand luxury items in Morocco. AI-verified, secure payments, trusted community.",
    type: "website",
    locale: "en_US",
    siteName: "Jotya",
    images: [
      {
        url: '/images/jotya-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Jotya - Premium Second-Hand Marketplace',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Jotya | Premium Second-Hand Marketplace",
    description: "Buy and sell authenticated luxury fashion in Morocco",
    images: ['/images/jotya-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <DesktopHeader />
              <main>{children}</main>
              <BottomNav />
              <FloatingAIChat />
              <ToastContainer />
            </ErrorBoundary>
          </NotificationProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
