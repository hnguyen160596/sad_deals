import React, { useState, useEffect } from 'react';
import { useDealsCMS, type DealItem } from '../context/DealsCMSContext';
import DealEditor from './DealEditor';
import { Dialog } from './ui/Dialog';
import { useToast } from '../context/ToastContext';

// Expanded deal item interface with more metadata
interface EnhancedDealItem extends DealItem {
  id?: string;
  store?: string;
  category?: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'scheduled' | 'expired' | 'draft';
  featured?: boolean;
  viewCount?: number;
  clickCount?: number;
  tags?: string[];
  pageIds?: string[];
}

const ManageDeals: React.FC = () => {
  const { deals, addDeal, updateDeal, deleteDeal } = useDealsCMS();
  const { showToast } = useToast ? useToast() : { showToast: (message: string) => alert(message) };

  // State for enhanced deals
  const [enhancedDeals, setEnhancedDeals] = useState<EnhancedDealItem[]>([]);

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<EnhancedDealItem | null>(null);
  const [formData, setFormData] = useState<EnhancedDealItem>({
    title: '',
    image: '',
    href: '',
    arrow: '',
    time: '',
    store: '',
    category: '',
    price: '',
    originalPrice: '',
    status: 'active',
    featured: false,
    tags: [],
  });

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk actions
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

  // Editor state
  const [editorContent, setEditorContent] = useState('');

  // Initialize enhanced deals
  useEffect(() => {
    const enhanced = deals.map((deal, index) => {
      const randomStore = ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Costco'][Math.floor(Math.random() * 5)];
      const randomCategory = ['Electronics', 'Home', 'Fashion', 'Kitchen', 'Baby'][Math.floor(Math.random() * 5)];
      const randomStatus = ['active', 'scheduled', 'expired', 'draft'][Math.floor(Math.random() * 4)] as 'active' | 'scheduled' | 'expired' | 'draft';

      return {
        ...deal,
        id: `deal-${index + 1}`,
        store: randomStore,
        category: randomCategory,
        price: `$${Math.floor(Math.random() * 100) + 9.99}`,
        originalPrice: `$${Math.floor(Math.random() * 200) + 29.99}`,
        discount: `${Math.floor(Math.random() * 70) + 10}%`,
        status: randomStatus,
        featured: Math.random() > 0.7,
        viewCount: Math.floor(Math.random() * 5000),
        clickCount: Math.floor(Math.random() * 1000),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          ['sale', 'hot', 'trending', 'clearance', 'limited', 'new'][Math.floor(Math.random() * 6)]
        ),
        pageIds: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          [`page-${Math.floor(Math.random() * 10) + 1}`]
        ).flat(),
      };
    });

    setEnhancedDeals(enhanced);
  }, [deals]);

  // Extract unique values for filters
  const stores = Array.from(new Set(enhancedDeals.map(deal => deal.store).filter(Boolean))) as string[];
  const categories = Array.from(new Set(enhancedDeals.map(deal => deal.category).filter(Boolean))) as string[];

  // Apply filters and sorting
  const filteredDeals = enhancedDeals.filter(deal => {
    // Apply search filter
    if (searchTerm && !deal.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Apply store filter
    if (storeFilter !== 'all' && deal.store !== storeFilter) {
      return false;
    }

    // Apply category filter
    if (categoryFilter !== 'all' && deal.category !== categoryFilter) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== 'all' && deal.status !== statusFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Apply sorting
    const sortKey = sortBy as keyof EnhancedDealItem;

    // Default to string comparison
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }

    // Handle numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }

    // Handle boolean values
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      if (sortDirection === 'asc') {
        return aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        return aValue === bValue ? 0 : aValue ? -1 : 1;
      }
    }

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      if (sortDirection === 'asc') {
        return aValue.getTime() - bValue.getTime();
      } else {
        return bValue.getTime() - aValue.getTime();
      }
    }

    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedDeals(filteredDeals.map(deal => deal.id || deal.href));
    } else if (selectedDeals.length === filteredDeals.length) {
      setSelectedDeals([]);
    }
  }, [selectAll, filteredDeals]);

  // Handle bulk selection
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleSelectDeal = (id: string) => {
    if (selectedDeals.includes(id)) {
      setSelectedDeals(selectedDeals.filter(dealId => dealId !== id));
    } else {
      setSelectedDeals([...selectedDeals, id]);
    }
  };

  // Handle bulk actions
  const performBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedDeals.length} deals? This action cannot be undone.`)) {
          selectedDeals.forEach(id => {
            const deal = enhancedDeals.find(d => d.id === id || d.href === id);
            if (deal) {
              deleteDeal(deal.href);
            }
          });
          showToast(`Successfully deleted ${selectedDeals.length} deals`);
          setSelectedDeals([]);
        }
        break;

      case 'activate':
        // In a real app, you would update the status in your database
        setEnhancedDeals(prev => prev.map(deal =>
          selectedDeals.includes(deal.id || deal.href)
            ? { ...deal, status: 'active' }
            : deal
        ));
        showToast(`Successfully activated ${selectedDeals.length} deals`);
        break;

      case 'deactivate':
        // In a real app, you would update the status in your database
        setEnhancedDeals(prev => prev.map(deal =>
          selectedDeals.includes(deal.id || deal.href)
            ? { ...deal, status: 'draft' }
            : deal
        ));
        showToast(`Successfully deactivated ${selectedDeals.length} deals`);
        break;

      case 'feature':
        // In a real app, you would update the featured flag in your database
        setEnhancedDeals(prev => prev.map(deal =>
          selectedDeals.includes(deal.id || deal.href)
            ? { ...deal, featured: true }
            : deal
        ));
        showToast(`Successfully featured ${selectedDeals.length} deals`);
        break;

      case 'unfeature':
        // In a real app, you would update the featured flag in your database
        setEnhancedDeals(prev => prev.map(deal =>
          selectedDeals.includes(deal.id || deal.href)
            ? { ...deal, featured: false }
            : deal
        ));
        showToast(`Successfully un-featured ${selectedDeals.length} deals`);
        break;

      default:
        break;
    }

    setIsBulkActionsOpen(false);
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would be generated by the backend
    const now = new Date().toISOString();

    if (currentDeal) {
      // Update existing deal
      const updatedDeal = {
        ...formData,
        updatedAt: now,
      };

      updateDeal(currentDeal.href, updatedDeal);

      // Update in enhanced deals array too
      setEnhancedDeals(prev => prev.map(deal =>
        deal.id === currentDeal.id || deal.href === currentDeal.href
          ? updatedDeal
          : deal
      ));

      showToast('Deal updated successfully');
      setIsEditModalOpen(false);
    } else {
      // Add new deal
      const newDeal = {
        ...formData,
        id: `deal-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        clickCount: 0,
      };

      addDeal(newDeal);

      // Add to enhanced deals array too
      setEnhancedDeals(prev => [...prev, newDeal]);

      showToast('Deal added successfully');
      setIsAddModalOpen(false);
    }

    // Reset form
    setFormData({
      title: '',
      image: '',
      href: '',
      arrow: '',
      time: '',
      store: '',
      category: '',
      price: '',
      originalPrice: '',
      status: 'active',
      featured: false,
      tags: [],
    });
    setCurrentDeal(null);
    setEditorContent('');
  };

  const handleEdit = (deal: EnhancedDealItem) => {
    setCurrentDeal(deal);
    setFormData(deal);
    setEditorContent(deal.description || '');
    setIsEditModalOpen(true);
  };

  const handleDelete = (href: string) => {
    if (window.confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      deleteDeal(href);

      // Remove from enhanced deals array too
      setEnhancedDeals(prev => prev.filter(deal => deal.href !== href));

      showToast('Deal deleted successfully');
    }
  };

  const handleAddNew = () => {
    setCurrentDeal(null);
    setFormData({
      title: '',
      image: '',
      href: '',
      arrow: '',
      time: '',
      store: '',
      category: '',
      price: '',
      originalPrice: '',
      status: 'active',
      featured: false,
      tags: [],
    });
    setEditorContent('');
    setIsAddModalOpen(true);
  };

  // Render the deal form
  const renderDealForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL *
          </label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link URL *
          </label>
          <input
            type="text"
            name="href"
            value={formData.href}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Arrow URL
          </label>
          <input
            type="text"
            name="arrow"
            value={formData.arrow || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Store
          </label>
          <select
            name="store"
            value={formData.store || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a store</option>
            {stores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price
          </label>
          <input
            type="text"
            name="price"
            value={formData.price || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="$19.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Original Price
          </label>
          <input
            type="text"
            name="originalPrice"
            value={formData.originalPrice || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="$29.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status || 'active'}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags?.join(', ') || ''}
            onChange={handleTagsChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="sale, trending, hot"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 mt-4">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured || false}
              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Deal
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <DealEditor
          initialContent={editorContent}
          onContentChange={content => setFormData({ ...formData, description: content })}
          placeholder="Enter deal description..."
          minHeight="200px"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {currentDeal ? 'Update Deal' : 'Add Deal'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="dark:bg-gray-900 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Deals</h1>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Deal
            </button>

            {selectedDeals.length > 0 && (
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Bulk Actions ({selectedDeals.length})
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isBulkActionsOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => performBulkAction('delete')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Delete Selected
                      </button>
                      <button
                        onClick={() => performBulkAction('activate')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Activate Selected
                      </button>
                      <button
                        onClick={() => performBulkAction('deactivate')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Deactivate Selected
                      </button>
                      <button
                        onClick={() => performBulkAction('feature')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Feature Selected
                      </button>
                      <button
                        onClick={() => performBulkAction('unfeature')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Unfeature Selected
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="search"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="storeFilter" className="sr-only">Filter by Store</label>
              <select
                id="storeFilter"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
              >
                <option value="all">All Stores</option>
                {stores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="categoryFilter" className="sr-only">Filter by Category</label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="sr-only">Sort By</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="store">Store</option>
                <option value="viewCount">Views</option>
                <option value="clickCount">Clicks</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Deal
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Store / Category
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Featured
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stats
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {paginatedDeals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No deals found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedDeals.map((deal) => (
                <tr key={deal.id || deal.href} className="hover:bg-gray-50 dark:hover:bg-gray-800/70">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDeals.includes(deal.id || deal.href)}
                        onChange={() => handleSelectDeal(deal.id || deal.href)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                        {deal.image ? (
                          <img src={deal.image} alt={deal.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 max-w-xs">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{deal.title}</div>
                        {deal.tags && deal.tags.length > 0 && (
                          <div className="flex flex-wrap mt-1 gap-1">
                            {deal.tags.map((tag, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{deal.store || 'Not specified'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{deal.category || 'Not categorized'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {deal.price && (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{deal.price}</div>
                    )}
                    {deal.originalPrice && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-through">{deal.originalPrice}</div>
                    )}
                    {deal.discount && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                        Save {deal.discount}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deal.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      deal.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                      deal.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {deal.status === 'active' ? 'Active' :
                       deal.status === 'scheduled' ? 'Scheduled' :
                       deal.status === 'expired' ? 'Expired' :
                       'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {deal.featured ? (
                      <span className="p-1 rounded-full bg-yellow-100 dark:bg-yellow-600/30 text-yellow-800 dark:text-yellow-300">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <span className="inline-flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {deal.viewCount}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center">
                        <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {deal.clickCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(deal)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => window.open(deal.href, '_blank')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(deal.href)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredDeals.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                page === 1
                  ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                page === totalPages
                  ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * itemsPerPage, filteredDeals.length)}</span> of{' '}
                <span className="font-medium">{filteredDeals.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium ${
                    page === 1
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="sr-only">First</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium ${
                    page === 1
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Determine which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === pageNum
                          ? 'z-10 bg-primary text-white border-primary'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium ${
                    page === totalPages
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium ${
                    page === totalPages
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="sr-only">Last</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Deal"
        size="lg"
      >
        {renderDealForm()}
      </Dialog>

      {/* Edit Deal Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Deal"
        size="lg"
      >
        {renderDealForm()}
      </Dialog>
    </div>
  );
};

export default ManageDeals;
