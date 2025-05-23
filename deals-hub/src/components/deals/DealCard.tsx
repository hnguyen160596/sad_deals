'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Tag, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type DealProps = {
  id: string;
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  imageUrl: string;
  storeId?: string;
  storeName: string;
  storeLogoUrl?: string;
  dealUrl: string;
  slug: string;
  expiresAt?: string;
  createdAt: string;
  isFeatured?: boolean;
};

export default function DealCard({
  id,
  title,
  description,
  price,
  originalPrice,
  discountPercentage,
  imageUrl,
  storeName,
  storeLogoUrl,
  dealUrl,
  slug,
  expiresAt,
  createdAt,
  isFeatured = false,
}: DealProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const isExpiring = expiresAt && new Date(expiresAt).getTime() - new Date().getTime() < 86400000; // 24 hours

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${isFeatured ? 'border-primary border-2' : ''}`}>
      <div className="relative">
        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-md">
            Featured
          </div>
        )}

        {/* Discount badge */}
        {discountPercentage && discountPercentage > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Deal image */}
        <Link href={`/deals/${slug}`}>
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
      </div>

      <CardContent className="p-4">
        {/* Store info */}
        <div className="flex items-center mb-2">
          {storeLogoUrl ? (
            <div className="h-6 w-6 relative mr-2">
              <Image
                src={storeLogoUrl}
                alt={storeName}
                fill
                sizes="24px"
                className="object-contain rounded-full"
              />
            </div>
          ) : (
            <Tag className="h-4 w-4 mr-2 text-gray-500" />
          )}
          <span className="text-xs text-gray-600">{storeName}</span>
        </div>

        {/* Deal title */}
        <Link href={`/deals/${slug}`} className="hover:underline">
          <h3 className="font-semibold text-base line-clamp-2 h-12 mb-2">{title}</h3>
        </Link>

        {/* Price info */}
        <div className="flex items-baseline mt-2 mb-1">
          <span className="font-bold text-lg">{price}</span>
          {originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">{originalPrice}</span>
          )}
        </div>

        {/* Time info */}
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>{timeAgo}</span>

          {isExpiring && expiresAt && (
            <span className="ml-2 text-red-600 font-medium flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Expires soon
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
          <Link href={`/deals/${slug}`}>
            View Deal
          </Link>
        </Button>

        <Button
          size="sm"
          className="w-1/2"
          asChild
        >
          <a
            href={dealUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            Get Deal
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
