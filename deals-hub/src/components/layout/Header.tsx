'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  HeartIcon,
  BellIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const mainNav = [
  { name: 'Home', href: '/' },
  { name: 'Today\'s Deals', href: '/deals/todays-deals' },
  { name: 'Popular Stores', href: '/stores' },
  { name: 'Categories', href: '/categories' },
  { name: 'Saving Tips', href: '/tips' },
];

export default function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isLoading, logout, isAdmin } = useAuth();

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // User dropdown menu
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url || ''} alt={user?.username || 'User'} />
            <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer w-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookmarks" className="cursor-pointer w-full">
            <HeartIcon className="h-4 w-4 mr-2" />
            Saved Deals
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="cursor-pointer w-full">
            <BellIcon className="h-4 w-4 mr-2" />
            Notifications
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer w-full">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Auth buttons for logged out state
  const AuthButtons = () => (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login" className="flex items-center">
          <UserCircleIcon className="h-5 w-5 mr-1" />
          <span>Login</span>
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">DealsHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:ml-6 md:flex md:space-x-6">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                  pathname === item.href
                    ? "border-primary text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search button and auth (desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-0 w-72 flex">
                  <Input
                    type="text"
                    placeholder="Search deals, stores..."
                    className="w-full"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSearch}
                    className="ml-2"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearch}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Authentication UI */}
            {isLoading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            ) : user ? (
              <UserMenu />
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <Link href="/search">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Bars3Icon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="px-4 py-6">
                    <Link href="/" className="flex items-center">
                      <ShoppingBagIcon className="h-8 w-8 text-primary" />
                      <span className="ml-2 text-xl font-bold text-gray-900">DealsHub</span>
                    </Link>
                  </div>
                  <nav className="flex-1 px-4 pb-4 space-y-2">
                    {mainNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "block py-2 px-3 text-base font-medium rounded-md",
                          pathname === item.href
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="px-4 py-6 border-t border-gray-200 space-y-4">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                      </div>
                    ) : user ? (
                      <>
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatar_url || ''} alt={user?.username || 'User'} />
                            <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username || 'User'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link href="/profile" className="flex items-center">
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            <span>My Profile</span>
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link href="/bookmarks" className="flex items-center">
                            <HeartIcon className="h-5 w-5 mr-2" />
                            <span>Saved Deals</span>
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/admin" className="flex items-center">
                              <Cog6ToothIcon className="h-5 w-5 mr-2" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={logout}
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link href="/auth/login" className="flex items-center">
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            <span>Login</span>
                          </Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/auth/signup">Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
