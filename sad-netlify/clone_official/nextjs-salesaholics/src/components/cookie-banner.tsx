"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      // Show banner after a slight delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    // In a real app, you would also set cookies or trigger analytics here
  };

  const acceptNecessary = () => {
    localStorage.setItem("cookie-consent", "necessary");
    setIsVisible(false);
    // In a real app, you would set only necessary cookies
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-16 md:pb-0 px-4">
      <div className="max-w-4xl mx-auto bg-background border shadow-lg rounded-lg p-4 md:p-6 md:flex md:items-start md:gap-6 animate-in slide-in-from-bottom-3 duration-300">
        <div className="md:flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Cookie Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            We use cookies to enhance your browsing experience, serve personalized
            ads or content, and analyze our traffic. By clicking "Accept All", you
            consent to our use of cookies.
          </p>
          <div className="flex flex-col xs:flex-row gap-2">
            <Button
              onClick={acceptAll}
              className="flex-1"
            >
              Accept All
            </Button>
            <Button
              variant="outline"
              onClick={acceptNecessary}
              className="flex-1"
            >
              Necessary Only
            </Button>
            <Button
              variant="link"
              asChild
              className="md:hidden"
            >
              <a href="/privacy">Privacy Policy</a>
            </Button>
          </div>
        </div>
        <div className="hidden md:flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="self-end mb-2"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="link"
            asChild
            className="text-sm"
          >
            <a href="/privacy">Privacy Policy</a>
          </Button>
          <Button
            variant="link"
            asChild
            className="text-sm"
          >
            <a href="/cookies">Cookie Policy</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
