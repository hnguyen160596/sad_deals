'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type HeroBannerProps = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
};

export default function HeroBanner({
  title = "Find the Best Deals & Discounts",
  subtitle = "Save big on your favorite products from top retailers with our exclusive deals and coupons.",
  ctaText = "Browse Deals",
  ctaLink = "/deals",
  backgroundImage = "/images/hero-banner.jpg",
}: HeroBannerProps) {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <div
          className="bg-cover bg-center h-full w-full opacity-30"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-primary mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="md:w-2/3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-xl text-gray-100 max-w-3xl">
            {subtitle}
          </p>

          {/* Search box */}
          <div className="mt-10 max-w-md">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-3 border border-transparent rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary focus:border-primary text-gray-900"
                placeholder="Search deals, stores, or products..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Button
                  className="py-2 px-4"
                  type="submit"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <div className="mt-8 flex space-x-4">
            <Button
              size="lg"
              asChild
            >
              <Link href={ctaLink}>
                {ctaText}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 border-white hover:border-gray-100"
              asChild
            >
              <Link href="/stores">
                Browse Stores
              </Link>
            </Button>
          </div>

          {/* Tags */}
          <div className="mt-8">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Electronics
              </span>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Fashion
              </span>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Home & Kitchen
              </span>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Beauty
              </span>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                Baby & Kids
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
