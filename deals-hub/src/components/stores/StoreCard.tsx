'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Tag } from 'lucide-react';

export type StoreProps = {
  id: string;
  name: string;
  description?: string;
  logoUrl: string;
  websiteUrl: string;
  activeDeals?: number;
  slug: string;
  isFeatured?: boolean;
};

export default function StoreCard({
  id,
  name,
  description,
  logoUrl,
  websiteUrl,
  activeDeals = 0,
  slug,
  isFeatured = false,
}: StoreProps) {
  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        isFeatured ? 'border-primary border-2' : ''
      }`}
    >
      <div className="p-4 flex items-center justify-center border-b">
        <div className="relative h-20 w-32">
          <Image
            src={logoUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 128px"
            className="object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/stores/${slug}`} className="hover:underline">
          <h3 className="font-semibold text-base text-center mb-2">{name}</h3>
        </Link>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 h-10 text-center mb-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <Tag className="h-3 w-3 mr-1" />
          <span>{activeDeals} active deals</span>

          {isFeatured && (
            <span className="ml-2 text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              Featured
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-1/2"
          asChild
        >
          <Link href={`/stores/${slug}`}>
            View Coupons
          </Link>
        </Button>

        <Button
          size="sm"
          className="w-1/2"
          asChild
        >
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            Visit Store
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
