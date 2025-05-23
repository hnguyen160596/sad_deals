import "@/app/globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";

import { ClientBody } from "@/app/ClientBody";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    template: "%s | Sales Aholics Deals",
    default: "Sales Aholics Deals - Find the Best Discounts, Coupons, and Savings",
  },
  description:
    "Your one-stop destination for the best deals, coupons, and money-saving tips. Find exclusive discounts on your favorite products and stores.",
  keywords: ["deals", "coupons", "discounts", "savings", "promo codes", "sales", "vouchers"],
  authors: [{ name: "Sales Aholics Deals" }],
  creator: "Sales Aholics Deals",
  publisher: "Sales Aholics Deals",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://salesaholicsdeals.com",
    siteName: "Sales Aholics Deals",
    title: "Sales Aholics Deals - Find the Best Discounts, Coupons, and Savings",
    description: "Your one-stop destination for the best deals, coupons, and money-saving tips.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sales Aholics Deals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales Aholics Deals - Find the Best Discounts, Coupons, and Savings",
    description: "Your one-stop destination for the best deals, coupons, and money-saving tips.",
    images: ["/images/twitter-image.jpg"],
    creator: "@salesaholics",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ClientBody session={session?.user ? JSON.stringify(session) : null}>
          {children}
        </ClientBody>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
