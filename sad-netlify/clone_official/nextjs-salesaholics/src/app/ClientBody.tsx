"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import CookieBanner from "@/components/cookie-banner";
import LiveChatWidget from "@/components/live-chat-widget";

interface ClientBodyProps {
  children: React.ReactNode;
  session: string | null;
}

export function ClientBody({ children, session }: ClientBodyProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [parsedSession, setParsedSession] = useState<any>(null);

  // Parse session
  useEffect(() => {
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setParsedSession(sessionData);
      } catch (error) {
        console.error("Error parsing session:", error);
      }
    }
  }, [session]);

  // Handle mounted state
  useEffect(() => {
    setIsMounted(true);
    // Remove any extension-added classes during hydration
    document.body.className = "antialiased";
  }, []);

  // Return loading state if not mounted yet
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
              <div className="h-32 bg-gray-300 rounded mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-10"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionProvider session={parsedSession}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <LiveChatWidget />
          <MobileNav />
          <CookieBanner />
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
