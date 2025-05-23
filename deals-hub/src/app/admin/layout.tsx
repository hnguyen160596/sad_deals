'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChartBarIcon,
  TagIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const sidebarNavigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Deals', href: '/admin/deals', icon: TagIcon },
  { name: 'Stores', href: '/admin/stores', icon: BuildingStorefrontIcon },
  { name: 'Categories', href: '/admin/categories', icon: GlobeAltIcon },
  { name: 'Pages', href: '/admin/pages', icon: DocumentTextIcon },
  { name: 'Media', href: '/admin/media', icon: PhotoIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />

        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-white">
          <div className="h-full flex flex-col flex-grow overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-16 bg-white border-b border-gray-200">
              <Link href="/" className="flex items-center">
                <ShoppingBagIcon className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">DealsHub</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {sidebarNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive
                          ? "text-primary"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-4 flex-shrink-0 h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/" className="flex items-center">
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-500" />
                  Back to Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex items-center h-16 px-4 bg-white border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900">DealsHub</span>
          </Link>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sidebarNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? "text-primary"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link href="/" className="flex items-center">
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-500" />
                Back to Site
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                <span>Admin</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
