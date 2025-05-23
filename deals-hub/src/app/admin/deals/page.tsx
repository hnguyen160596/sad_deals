'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  EllipsisVerticalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchAllDeals,
  fetchAllStores,
  fetchAllCategories,
  deleteDeal,
  toggleDealFeatured,
  toggleDealStatus,
  bulkDeleteDeals,
  bulkUpdateDeals,
  Deal,
  Store,
  Category,
} from '@/lib/api/supabase';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function AdminDealsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalDeals, setTotalDeals] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);

  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch deals with filters
        const { data: dealsData, count } = await fetchAllDeals({
          status: statusFilter === 'all' ? 'all' : statusFilter,
          featured: featuredFilter,
          store: storeFilter !== 'all' ? storeFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          searchQuery: searchQuery || undefined,
          sortField,
          sortDirection,
        });

        setDeals(dealsData || []);
        setTotalDeals(count || 0);

        // Load stores and categories if not loaded yet
        if (stores.length === 0) {
          const { data: storesData } = await fetchAllStores();
          setStores(storesData || []);
        }

        if (categories.length === 0) {
          const { data: categoriesData } = await fetchAllCategories();
          setCategories(categoriesData || []);
        }
      } catch (error) {
        console.error('Error loading deals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load deals. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, storeFilter, categoryFilter, featuredFilter, sortField, sortDirection]);

  // Generate store options from database
  const storeOptions = [
    { value: 'all', label: 'All Stores' },
    ...stores.map(store => ({ value: store.id, label: store.name })),
  ];

  // Generate category options from database
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(category => ({ value: category.id, label: category.name })),
  ];

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get store name by ID
  const getStoreName = (storeId: string): string => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Calculate discount percentage
  const calculateDiscount = (price: string, originalPrice: string): number => {
    const priceNum = parseFloat(price.replace(/[^0-9.]/g, ''));
    const originalPriceNum = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));

    if (isNaN(priceNum) || isNaN(originalPriceNum) || originalPriceNum === 0) {
      return 0;
    }

    return Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean, expiresAt?: string) => {
    if (!isActive) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Draft</Badge>;
    }

    if (expiresAt) {
      const expDate = new Date(expiresAt);
      const now = new Date();

      if (expDate < now) {
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">Expired</Badge>;
      }

      // Check if it's scheduled for future (scheduled = start date in future, but we don't have start date here)
      // For now, treat all future expires as active
    }

    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>;
  };

  // Toggle sort direction or set new sort field
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle checkbox selection for bulk actions
  const handleSelectDeal = (dealId: string) => {
    setSelectedDeals(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  // Select or deselect all deals
  const handleSelectAll = () => {
    if (selectedDeals.length === deals.length) {
      setSelectedDeals([]);
    } else {
      setSelectedDeals(deals.map(deal => deal.id));
    }
  };

  // Handle bulk actions with Supabase integration
  const handleBulkAction = async (action: string) => {
    if (selectedDeals.length === 0) {
      toast({
        title: 'Error',
        description: 'No deals selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      switch (action) {
        case 'delete':
          await bulkDeleteDeals(selectedDeals);
          toast({
            title: 'Success',
            description: `${selectedDeals.length} deals deleted`,
          });
          // Refresh the deals list
          setDeals(deals.filter(deal => !selectedDeals.includes(deal.id)));
          break;

        case 'feature':
          await bulkUpdateDeals(selectedDeals, { is_featured: true });
          toast({
            title: 'Success',
            description: `${selectedDeals.length} deals marked as featured`,
          });
          setDeals(deals.map(deal =>
            selectedDeals.includes(deal.id)
              ? { ...deal, is_featured: true }
              : deal
          ));
          break;

        case 'unfeature':
          await bulkUpdateDeals(selectedDeals, { is_featured: false });
          toast({
            title: 'Success',
            description: `${selectedDeals.length} deals unmarked as featured`,
          });
          setDeals(deals.map(deal =>
            selectedDeals.includes(deal.id)
              ? { ...deal, is_featured: false }
              : deal
          ));
          break;

        case 'activate':
          await bulkUpdateDeals(selectedDeals, { is_active: true });
          toast({
            title: 'Success',
            description: `${selectedDeals.length} deals activated`,
          });
          setDeals(deals.map(deal =>
            selectedDeals.includes(deal.id)
              ? { ...deal, is_active: true }
              : deal
          ));
          break;

        case 'deactivate':
          await bulkUpdateDeals(selectedDeals, { is_active: false });
          toast({
            title: 'Success',
            description: `${selectedDeals.length} deals deactivated`,
          });
          setDeals(deals.map(deal =>
            selectedDeals.includes(deal.id)
              ? { ...deal, is_active: false }
              : deal
          ));
          break;
      }
    } catch (error) {
      console.error(`Error performing bulk action ${action}:`, error);
      toast({
        title: 'Error',
        description: `Failed to perform action. Please try again.`,
        variant: 'destructive',
      });
    }

    setSelectedDeals([]);
  };

  // Handle single deal actions
  const handleDealAction = async (dealId: string, action: string) => {
    try {
      switch (action) {
        case 'edit':
          router.push(`/admin/deals/edit/${dealId}`);
          break;

        case 'view':
          // Find the deal to get its slug
          {
            const deal = deals.find(d => d.id === dealId);
            if (deal?.slug) {
              router.push(`/deals/${deal.slug}`);
            }
          }
          break;

        case 'duplicate':
          {
            const params = new URLSearchParams({
              duplicate: 'true',
              source: dealId,
            });
            router.push(`/admin/deals/new?${params.toString()}`);
          }
          break;

        case 'feature':
          await toggleDealFeatured(dealId, true);
          toast({
            title: 'Success',
            description: 'Deal marked as featured',
          });
          setDeals(deals.map(deal =>
            deal.id === dealId
              ? { ...deal, is_featured: true }
              : deal
          ));
          break;

        case 'unfeature':
          await toggleDealFeatured(dealId, false);
          toast({
            title: 'Success',
            description: 'Deal unmarked as featured',
          });
          setDeals(deals.map(deal =>
            deal.id === dealId
              ? { ...deal, is_featured: false }
              : deal
          ));
          break;

        case 'delete':
          await deleteDeal(dealId);
          toast({
            title: 'Success',
            description: 'Deal deleted',
          });
          setDeals(deals.filter(deal => deal.id !== dealId));
          break;
      }
    } catch (error) {
      console.error(`Error performing action ${action} on deal ${dealId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Manage Deals</h1>
        <Button asChild>
          <Link href="/admin/deals/new">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Deal
          </Link>
        </Button>
      </div>

      {/* Filters and search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search deals..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featuredFilter === true}
                onCheckedChange={(checked) => {
                  if (checked) setFeaturedFilter(true);
                  else if (featuredFilter === true) setFeaturedFilter(undefined);
                  else setFeaturedFilter(undefined);
                }}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Featured Only
              </label>
            </div>

            {/* Bulk actions */}
            {selectedDeals.length > 0 && (
              <div className="ml-auto flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedDeals.length} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('feature')}>
                      Mark as Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('unfeature')}>
                      Remove Featured
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                      Activate Deals
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                      Deactivate Deals
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleBulkAction('delete')}
                    >
                      Delete Deals
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {(searchQuery || statusFilter !== 'all' || storeFilter !== 'all' || categoryFilter !== 'all' || featuredFilter !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setStoreFilter('all');
                  setCategoryFilter('all');
                  setFeaturedFilter(undefined);
                }}
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deals table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Deals</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${deals.length} deals found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]">
                  <Checkbox
                    checked={selectedDeals.length > 0 && selectedDeals.length === deals.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all deals"
                  />
                </TableHead>
                <TableHead className="max-w-[300px]">
                  <div className="flex items-center">
                    Deal
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Store
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Category
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('discount')}
                  >
                    Discount
                    {sortField === 'discount' && (
                      sortDirection === 'asc' ?
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> :
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('views')}
                  >
                    Views
                    {sortField === 'views' && (
                      sortDirection === 'asc' ?
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> :
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('clicks')}
                  >
                    Clicks
                    {sortField === 'clicks' && (
                      sortDirection === 'asc' ?
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> :
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('expires_at')}
                  >
                    Expires
                    {sortField === 'expires_at' && (
                      sortDirection === 'asc' ?
                        <ArrowUpIcon className="ml-1 h-4 w-4" /> :
                        <ArrowDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10">
                    <div className="flex justify-center">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <div className="mt-2 text-sm text-gray-500">Loading deals...</div>
                  </TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                    No deals found with the current filters
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDeals.includes(deal.id)}
                        onCheckedChange={() => handleSelectDeal(deal.id)}
                        aria-label={`Select deal ${deal.title}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="flex flex-col">
                        <span className="font-medium truncate" title={deal.title}>
                          {deal.title}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-semibold">{deal.price}</span>
                          <span className="mx-1">·</span>
                          <span className="line-through">{deal.original_price}</span>
                          {deal.is_featured && (
                            <Badge
                              className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                              variant="outline"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStoreName(deal.store_id)}</TableCell>
                    <TableCell>{getCategoryName(deal.category_id)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
                        {calculateDiscount(deal.price, deal.original_price || '')}% OFF
                      </Badge>
                    </TableCell>
                    <TableCell>{deal.views?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{deal.clicks?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{formatDate(deal.expires_at || null)}</TableCell>
                    <TableCell>{getStatusBadge(deal.is_active, deal.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDealAction(deal.id, 'edit')}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDealAction(deal.id, 'view')}>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDealAction(deal.id, 'duplicate')}>
                            <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {deal.is_featured ? (
                            <DropdownMenuItem onClick={() => handleDealAction(deal.id, 'unfeature')}>
                              Unmark as Featured
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleDealAction(deal.id, 'feature')}>
                              Mark as Featured
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDealAction(deal.id, 'delete')}
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
