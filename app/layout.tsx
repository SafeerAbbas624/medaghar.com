import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import Footer from "@/components/Footer";
import DeferredAnalyticsTracker from "@/components/DeferredAnalyticsTracker";
import DeferredCompareBar from "@/components/DeferredCompareBar";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
});

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL("https://medaghar.com"),
  title: {
    default: "Free Property Listings in Pakistan — Buy, Sell & Rent | MedaGhar",
    template: "%s",
  },
  description: "Find properties for sale and rent in Pakistan. Search houses, flats, plots, and commercial properties in Lahore, Karachi, Islamabad, and more.",
  applicationName: "MedaGhar",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://medaghar.com",
    siteName: "MedaGhar",
    title: "Free Property Listings in Pakistan — Buy, Sell & Rent | MedaGhar",
    description: "Find properties for sale and rent in Pakistan. Search houses, flats, plots, and commercial properties in Lahore, Karachi, Islamabad, and more.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "MedaGhar — Free Property Listings in Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Property Listings in Pakistan — Buy, Sell & Rent | MedaGhar",
    description: "Find properties for sale and rent in Pakistan. Search houses, flats, plots, and commercial properties.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        {ADSENSE_CLIENT && (
          <Script
            id="adsense-loader"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <SessionProvider>
          <DeferredAnalyticsTracker />
          <Navbar />
          {children}
          <DeferredCompareBar />
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}