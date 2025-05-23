'use client';

import React from 'react';
import Link from 'next/link';
import StoreCard, { StoreProps } from './StoreCard';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

type PopularStoresProps = {
  title?: string;
  subtitle?: string;
  stores: StoreProps[];
  viewAllLink?: string;
};

export default function PopularStores({
  title = "Popular Stores",
  subtitle = "Discover deals from top retailers",
  stores = [],
  viewAllLink = "/stores",
}: PopularStoresProps) {
  if (stores.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 md:mt-0 group"
            asChild
          >
            <Link href={viewAllLink} className="inline-flex items-center">
              View All Stores
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              {...store}
            />
          ))}
        </div>

        {/* Mobile view all button */}
        <div className="mt-8 text-center lg:hidden">
          <Button asChild>
            <Link href={viewAllLink}>
              View All Stores
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
