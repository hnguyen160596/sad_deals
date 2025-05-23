'use client';

import React from 'react';
import Link from 'next/link';
import DealCard, { DealProps } from './DealCard';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

type FeaturedDealsProps = {
  title?: string;
  subtitle?: string;
  deals: DealProps[];
  viewAllLink?: string;
};

export default function FeaturedDeals({
  title = "Today's Featured Deals",
  subtitle = "Handpicked offers that you don't want to miss",
  deals = [],
  viewAllLink = "/deals/featured",
}: FeaturedDealsProps) {
  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
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
              View All Deals
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              {...deal}
              isFeatured={true}
            />
          ))}
        </div>

        {/* Mobile view all button */}
        <div className="mt-8 text-center lg:hidden">
          <Button asChild>
            <Link href={viewAllLink}>
              View All Featured Deals
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
