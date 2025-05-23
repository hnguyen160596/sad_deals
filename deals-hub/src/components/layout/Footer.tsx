'use client';

import React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTelegram,
  FaYoutube
} from 'react-icons/fa';

const footerNavigation = {
  deals: [
    { name: 'Today\'s Deals', href: '/deals/todays-deals' },
    { name: 'Featured Deals', href: '/deals/featured' },
    { name: 'Popular Categories', href: '/categories' },
    { name: 'Deal Alerts', href: '/alerts' },
  ],
  stores: [
    { name: 'Popular Stores', href: '/stores/popular' },
    { name: 'Store Directory', href: '/stores' },
    { name: 'Store Coupons', href: '/coupons' },
    { name: 'Exclusive Offers', href: '/exclusive-offers' },
  ],
  resources: [
    { name: 'Savings Tips', href: '/tips' },
    { name: 'Buying Guides', href: '/guides' },
    { name: 'Blog', href: '/blog' },
    { name: 'Telegram Feed', href: '/telegram-feed' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  social: [
    { name: 'Facebook', href: '#', icon: FaFacebook },
    { name: 'Twitter', href: '#', icon: FaTwitter },
    { name: 'Instagram', href: '#', icon: FaInstagram },
    { name: 'Telegram', href: '#', icon: FaTelegram },
    { name: 'YouTube', href: '#', icon: FaYoutube },
  ],
};

export default function Footer() {
  const [email, setEmail] = React.useState('');

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe email:', email);
    // Reset form
    setEmail('');
    // Here you would typically send this to your API
  };

  return (
    <footer className="bg-gray-800 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center">
              <ShoppingBagIcon className="h-10 w-10 text-primary" />
              <span className="ml-3 text-xl font-bold text-white">DealsHub</span>
            </Link>
            <p className="text-gray-300 text-base">
              Your ultimate destination for finding the best deals,
              discounts, and savings from top retailers.
            </p>
            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-semibold text-white">Deals</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.deals.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-base font-semibold text-white">Stores</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.stores.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-semibold text-white">Resources</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.resources.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-base font-semibold text-white">Company</h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 xl:mt-0">
            <h3 className="text-base font-semibold text-white">
              Subscribe to our newsletter
            </h3>
            <p className="mt-4 text-base text-gray-300">
              Get the latest deals and savings tips delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribeSubmit} className="mt-4 sm:flex sm:max-w-md">
              <Input
                type="email"
                name="email"
                id="email-address"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-w-0 px-4 py-2 text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md"
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4"
                >
                  Subscribe
                </Button>
              </div>
            </form>
            <div className="mt-6 flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-10"
                  src="/images/app-store.png"
                  alt="App Store"
                />
              </div>
              <div className="ml-3 flex-shrink-0">
                <img
                  className="h-10"
                  src="/images/google-play.png"
                  alt="Google Play"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} DealsHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
