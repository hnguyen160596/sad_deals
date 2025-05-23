"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = [
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Safety Center", href: "/safety" },
      { name: "Community Guidelines", href: "/guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Deals",
    links: [
      { name: "Today's Top Deals", href: "/deals" },
      { name: "Trending Deals", href: "/deals/trending" },
      { name: "Expiring Soon", href: "/deals/expiring" },
      { name: "Free Shipping", href: "/deals/free-shipping" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send this to an API endpoint
    console.log("Subscribing email:", email);
    setSubscribed(true);
  };

  return (
    <footer className="bg-secondary/40 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Newsletter Signup */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              Get the best deals in your inbox
            </h2>
            {subscribed ? (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
                <p className="text-green-800 dark:text-green-300 text-sm">
                  Thanks for subscribing! We've sent a confirmation email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label htmlFor="email-input" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      required
                      placeholder="Your email address"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Subscribe</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Follow us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground/70 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Sales Aholics Deals. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/accessibility"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Accessibility
              </Link>
              <Link
                href="/sitemap"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Sitemap
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-foreground/70 hover:text-foreground"
                asChild
              >
                <Link href="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
