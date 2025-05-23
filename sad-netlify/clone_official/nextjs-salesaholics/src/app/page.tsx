import Link from "next/link";
import Image from "next/image";
import { getDeals, getActiveBanners, getStores } from "@/lib/contentful";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Deal Cards Loading Component
function DealsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-background border rounded-lg overflow-hidden">
          <Skeleton className="h-44 w-full" />
          <div className="p-4">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-5 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Top Deals Component
async function TopDeals() {
  // Get deals from CMS with caching handled by the contentful utility
  const deals = await getDeals(6, 0, { isBestSeller: true });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal) => (
        <Link
          href={`/deals/${deal.slug}`}
          key={deal.id}
          className="bg-background border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <div className="relative h-44">
            {deal.image ? (
              <Image
                src={deal.image.url}
                alt={deal.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                placeholder={deal.image.blurDataUrl ? "blur" : "empty"}
                blurDataURL={deal.image.blurDataUrl}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            {deal.isExpiring && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Ending Soon
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">{deal.store}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {deal.discount}% OFF
              </span>
            </div>
            <h3 className="font-semibold mb-2 line-clamp-2">{deal.title}</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lg font-bold text-primary">{deal.currentPrice}</span>
              <span className="text-sm line-through text-muted-foreground">{deal.originalPrice}</span>
            </div>
            <Button className="w-full">See This Deal</Button>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Popular Stores Component
async function PopularStores() {
  // Get stores from CMS with caching handled by the contentful utility
  const stores = await getStores(8);

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {stores.slice(0, 8).map((store) => (
        <Link
          href={`/stores/${store.slug}`}
          key={store.id}
          className="bg-background border rounded-lg p-4 text-center w-36 transition-all duration-200 hover:shadow-md"
        >
          <div className="relative h-16 w-16 mx-auto mb-2">
            {store.logo ? (
              <Image
                src={store.logo.url}
                alt={store.name}
                fill
                sizes="64px"
                className="object-contain"
                placeholder={store.logo.blurDataUrl ? "blur" : "empty"}
                blurDataURL={store.logo.blurDataUrl}
              />
            ) : (
              <Avatar className="h-16 w-16">
                <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <h3 className="text-sm font-medium line-clamp-2">{store.name}</h3>
        </Link>
      ))}
    </div>
  );
}

// Hero Banner Component
async function HeroBanner() {
  // Get active banners from CMS
  const banners = await getActiveBanners('top');
  const banner = banners.length > 0 ? banners[0] : null;

  return (
    <div className="bg-yellow-400 rounded-lg overflow-hidden">
      <div className="relative py-12 px-6 md:py-24 md:px-12">
        {banner?.image && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={banner.image.url}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Discover Amazing Deals & Save Big
          </h1>
          <p className="text-xl md:text-2xl text-slate-800 mb-8">
            Your one-stop destination for the best coupons, deals, and money-saving tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/deals">Today's Deals</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/coupons">Browse Coupons</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Home Page Component with SSR
export default async function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="container px-4">
        <Suspense fallback={<Skeleton className="w-full h-80 rounded-lg" />}>
          <HeroBanner />
        </Suspense>
      </section>

      {/* Popular Stores Section */}
      <section className="container px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Popular Stores</h2>
          <Button variant="outline" asChild>
            <Link href="/stores">View All</Link>
          </Button>
        </div>
        <Suspense fallback={
          <div className="flex flex-wrap gap-4 justify-center">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-36" />
            ))}
          </div>
        }>
          <PopularStores />
        </Suspense>
      </section>

      {/* Top Deals Section */}
      <section className="container px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Today's Top Deals</h2>
          <Button variant="outline" asChild>
            <Link href="/deals">View All Deals</Link>
          </Button>
        </div>
        <Suspense fallback={<DealsLoading />}>
          <TopDeals />
        </Suspense>
      </section>

      {/* Email Sign-up Section */}
      <section className="bg-muted py-12">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Never Miss a Deal</h2>
            <p className="text-muted-foreground mb-6">
              Join over 150,000 savvy shoppers and get the best deals delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
