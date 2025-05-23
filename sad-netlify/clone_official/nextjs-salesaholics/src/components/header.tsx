"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, ShoppingCart, User, Sun, Moon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";

// Navigation items
const navItems = [
  { name: "Daily Deals", href: "/deals" },
  { name: "Coupons", href: "/coupons" },
  { name: "Stores", href: "/stores" },
  { name: "Savings Tips", href: "/tips" },
];

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled
          ? "bg-background/95 backdrop-blur shadow-md"
          : "bg-background"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-yellow-500">SAD DEALS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearchBar(!showSearchBar)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart" aria-label="Shopping cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    aria-label="User menu"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session.user?.name || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">Saved Deals</Link>
                  </DropdownMenuItem>
                  {session.user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="secondary" asChild>
                <Link href="/login">Sign up</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearchBar(!showSearchBar)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Sales Aholics Deals</SheetTitle>
                  <SheetDescription>
                    Find the best deals and coupons
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center py-2 text-base font-medium transition-colors hover:text-foreground/80",
                        pathname === item.href
                          ? "text-foreground font-semibold"
                          : "text-foreground/60"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="w-full justify-start"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="pt-4 border-t">
                    {session ? (
                      <>
                        <div className="flex items-center mb-4">
                          {session.user?.image ? (
                            <div className="relative h-10 w-10 mr-3">
                              <Image
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                          ) : (
                            <User className="h-10 w-10 mr-3 p-2 bg-muted rounded-full" />
                          )}
                          <div>
                            <p className="font-medium">{session.user?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href="/profile">Profile</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            asChild
                          >
                            <Link href="/favorites">Saved Deals</Link>
                          </Button>
                          {session.user?.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              asChild
                            >
                              <Link href="/admin">Admin Panel</Link>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => signOut({ callbackUrl: "/" })}
                          >
                            Sign Out
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Button className="w-full" asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/register">Create Account</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {showSearchBar && (
        <div className="absolute inset-x-0 top-full bg-background border-t shadow-lg animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search for deals, coupons, stores..."
                  className="w-full rounded-md border border-input bg-background pl-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="ml-2">
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSearchBar(false)}
                className="ml-2"
              >
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
