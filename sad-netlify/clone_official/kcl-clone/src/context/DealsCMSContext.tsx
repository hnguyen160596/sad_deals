import type React from 'react';
import { createContext, useState, useEffect, useContext } from 'react';

export interface DealItem {
  title: string;
  image: string;
  href: string;
  arrow?: string;
  time?: string;
}

interface DealsCMSContextType {
  deals: DealItem[];
  addDeal: (deal: DealItem) => void;
  updateDeal: (href: string, updated: DealItem) => void;
  deleteDeal: (href: string) => void;
}

const DealsCMSContext = createContext<DealsCMSContextType>({
  deals: [],
  addDeal: () => {},
  updateDeal: () => {},
  deleteDeal: () => {},
});

export const DealsCMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<DealItem[]>(() => {
    const saved = localStorage.getItem('cmsDeals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cmsDeals', JSON.stringify(deals));
  }, [deals]);

  const addDeal = (deal: DealItem) => setDeals((prev) => [...prev, deal]);
  const updateDeal = (href: string, updated: DealItem) => setDeals((prev) => prev.map((d) => (d.href === href ? updated : d)));
  const deleteDeal = (href: string) => setDeals((prev) => prev.filter((d) => d.href !== href));

  return (
    <DealsCMSContext.Provider value={{ deals, addDeal, updateDeal, deleteDeal }}>
      {children}
    </DealsCMSContext.Provider>
  );
};

export const useDealsCMS = () => useContext(DealsCMSContext);
