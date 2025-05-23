import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/sonner";
import ClientBody from './ClientBody';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DealsHub - Find the Best Deals & Discounts',
  description: 'Discover the best deals, coupons, and discounts from your favorite stores. Save money on electronics, fashion, home goods, and more.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HelmetProvider>
          <ClientBody>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <Toaster />
            </div>
          </ClientBody>
        </HelmetProvider>
      </body>
    </html>
  );
}
