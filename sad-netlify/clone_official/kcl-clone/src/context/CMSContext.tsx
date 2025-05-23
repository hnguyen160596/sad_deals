import type React from 'react';
import { createContext, useState, type ReactNode, useContext, useEffect } from 'react'
import { stores as initialStores } from '../data/stores';

export interface StoreItem {
  name: string;
  href: string;
  icon: string;
}

interface CMSContextType {
  stores: StoreItem[];
  addStore: (item: StoreItem) => void;
  updateStore: (href: string, updated: StoreItem) => void;
  deleteStore: (href: string) => void;
}

const CMSContext = createContext<CMSContextType>({
  stores: [],
  addStore: () => {},
  updateStore: () => {},
  deleteStore: () => {},
});

export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('cmsStores');
    return saved ? JSON.parse(saved) : initialStores;
  });

  useEffect(() => {
    localStorage.setItem('cmsStores', JSON.stringify(stores));
  }, [stores]);

  const addStore = (item: StoreItem) => {
    setStores((prev) => [...prev, item]);
  };

  const updateStore = (href: string, updated: StoreItem) => {
    setStores((prev) => prev.map((s) => (s.href === href ? updated : s)));
  };

  const deleteStore = (href: string) => {
    setStores((prev) => prev.filter((s) => s.href !== href));
  };

  return (
    <CMSContext.Provider value={{ stores, addStore, updateStore, deleteStore }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => useContext(CMSContext);
