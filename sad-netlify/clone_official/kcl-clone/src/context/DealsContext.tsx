import type React from 'react';
import { createContext, useState, type ReactNode, useContext, useEffect } from 'react'
import aws4 from 'aws4';

export interface DealItem {
  title: string;
  image: string;
  href: string;
  arrow?: string;
  time?: string;
}

const initialDeals: DealItem[] = [
  {
    title: 'Huge Walker Edison Furniture Sale on Walmart.com (Save Up to 60%)',
    image: 'https://ext.same-assets.com/3000230773/3347604496.jpeg',
    href: '/2025/04/25/huge-walker-edison-furniture-sale-on-walmart-com-save-up-to-60',
    arrow: 'https://ext.same-assets.com/3000230773/1443725800.svg',
  },
  {
    title: "Pay Only $4.99 for This Women's Ribbed Tank Top on Amazon",
    image: 'https://ext.same-assets.com/3000230773/3704997900.jpeg',
    href: '/2025/05/07/pay-only-usd4-99-for-this-womens-ribbed-tank-top-on-amazon',
    arrow: 'https://ext.same-assets.com/3000230773/409235749.svg',
  },
  {
    title: "It's Back: $400 Self-Cleaning Litter Box Drops to $164.99 on Amazon",
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/67CZ2HfqFefuuBD002NSDH/be309ca6be7ba5900363161d0668c2e1/ChatGPT_Image_Apr_30__2025__12_57_28_PM.png?w=241&fit=max&auto=format&q=90',
    href: '/2025/05/07/its-back-usd400-self-cleaning-litter-box-drops-to-usd164-99-on-amazon',
    arrow: 'https://ext.same-assets.com/3000230773/3225579771.svg',
  },
];

interface DealsContextType {
  deals: DealItem[];
  addDeal: (deal: DealItem) => void;
  updateDeal: (href: string, deal: DealItem) => void;
  deleteDeal: (href: string) => void;
}

const DealsContext = createContext<DealsContextType>({
  deals: initialDeals,
  addDeal: () => {},
  updateDeal: () => {},
  deleteDeal: () => {},
});

export const DealsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<DealItem[]>(() => {
    const saved = localStorage.getItem('cmsDeals');
    return saved ? JSON.parse(saved) : initialDeals;
  });

  // Fetch Amazon deals on mount and every hour
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const host = 'webservices.amazon.com';
        const path = '/paapi5/searchitems';
        const body = JSON.stringify({
          PartnerTag: import.meta.env.AMAZON_PARTNER_TAG,
          PartnerType: 'Associates',
          Marketplace: 'www.amazon.com',
          Keywords: '',
          Resources: [
            'Images.Primary.Large',
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'DetailPageURL',
          ],
          BrowseNodeId: '15529609011', // Today's Deals node
        });
        const opts = aws4.sign(
          {
            host,
            method: 'POST',
            path,
            service: 'ProductAdvertisingAPI',
            region: import.meta.env.AMAZON_API_REGION,
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              'Accept': 'application/json',
              'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
            },
            body,
          },
          {
            accessKeyId: import.meta.env.AMAZON_API_ACCESS_KEY,
            secretAccessKey: import.meta.env.AMAZON_API_SECRET_KEY,
          }
        );
        const res = await fetch(`https://${host}${path}`, {
          method: opts.method,
          headers: opts.headers as HeadersInit,
          body: opts.body,
        });
        const data = await res.json();
        const items = data.SearchResult?.Items;
        if (!items || !items.length) {
          console.warn('No deals returned, skipping update');
          return;
        }
        const newDeals: DealItem[] = items.map((item: any) => ({
          title: item.ItemInfo.Title.DisplayValue,
          image: item.Images.Primary.Large.URL,
          href: `${item.DetailPageURL}&tag=${import.meta.env.AMAZON_PARTNER_TAG}`,
          arrow: undefined,
          time: '',
        }));
        setDeals(newDeals);
        localStorage.setItem('cmsDeals', JSON.stringify(newDeals));
      } catch (e) {
        console.warn('Skipped fetching Amazon deals:', e);
      }
    };
    fetchDeals();
    const id = setInterval(fetchDeals, 1000 * 60 * 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem('cmsDeals', JSON.stringify(deals));
  }, [deals]);

  const addDeal = (deal: DealItem) => setDeals(prev => [...prev, deal]);
  const updateDeal = (href: string, updated: DealItem) => setDeals(prev => prev.map(d => d.href === href ? updated : d));
  const deleteDeal = (href: string) => setDeals(prev => prev.filter(d => d.href !== href));

  return (
    <DealsContext.Provider value={{ deals, addDeal, updateDeal, deleteDeal }}>
      {children}
    </DealsContext.Provider>
  );
};

export const useDeals = () => useContext(DealsContext);
