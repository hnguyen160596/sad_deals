import React, { useState, useEffect } from 'react';
import { useCMS, type StoreItem } from '../context/CMSContext';
import { Dialog } from './ui/Dialog';
import { useToast } from '../context/ToastContext';

// Enhanced store interface with additional properties
interface EnhancedStoreItem extends StoreItem {
  id?: string;
  dealCount?: number;
  clickCount?: number;
  conversionRate?: number;
  categories?: string[];
  featured?: boolean;
  status?: 'active' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  website?: string;
  affiliateProgram?: string;
  commission?: string;
}

const ManageStores: React.FC = () => {
  const { stores, addStore, updateStore, deleteStore } = useCMS();
  const { showToast } = useToast ? useToast() : { showToast: (message: string) => alert(message) };

  // State for enhanced stores
  const [enhancedStores, setEnhancedStores] = useState<EnhancedStoreItem[]>([]);

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<EnhancedStoreItem | null>(null);
  const [formData, setFormData] = useState<EnhancedStoreItem>({
    name: '',
    href: '',
    icon: '',
    description: '',
    categories: [],
    status: 'active',
    featured: false,
    website: '',
    affiliateProgram: '',
    commission: '',
  });

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk actions
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

  // Analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsStore, setAnalyticsStore] = useState<EnhancedStoreItem | null>(null);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('30days');

  // Initialize enhanced stores
  useEffect(() => {
    const enhanced = stores.map((store, index) => {
      // Generate random metadata for demo purposes
      return {
        ...store,
        id: `store-${index + 1}`,
        dealCount: Math.floor(Math.random() * 50) + 1,
        clickCount: Math.floor(Math.random() * 10000) + 100,
        conversionRate: Math.random() * 8 + 1,
        categories: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          ['Electronics', 'Home', 'Fashion', 'Grocery', 'Beauty', 'Kitchen', 'Pets'][Math.floor(Math.random() * 7)]
        ),
        featured: Math.random() > 0.7,
        status: ['active', 'draft', 'archived'][Math.floor(Math.random() * 3)] as 'active' | 'draft' | 'archived',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        description: `${store.name} offers great deals on various products. Shop now to save big!`,
        website: `https://www.${store.name.toLowerCase().replace(/\s+/g, '')}.com`,
        affiliateProgram: ['Amazon Associates', 'ShareASale', 'Commission Junction', 'Rakuten', 'Impact'][Math.floor(Math.random() * 5)],
        commission: `${Math.floor(Math.random() * 15) + 1}%`,
      };
    });

    setEnhancedStores(enhanced);
  }, [stores]);

  // Extract unique categories for filters
  const allCategories = Array.from(new Set(
    enhancedStores.flatMap(store => store.categories || [])
  )).sort();

  // Apply filters and sorting
  const filteredStores = enhancedStores.filter(store => {
    // Apply search filter
    if (searchTerm && !store.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== 'all' && store.status !== statusFilter) {
      return false;
    }

    // Apply category filter
    if (categoryFilter !== 'all' && !(store.categories || []).includes(categoryFilter)) {
      return false;
    }

    // Apply featured filter
    if (featuredFilter === 'featured' && !store.featured) {
      return false;
    } else if (featuredFilter === 'not-featured' && store.featured) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Apply sorting
    const sortKey = sortBy as keyof EnhancedStoreItem;

    // Handle string comparisons
    if (typeof a[sortKey] === 'string' && typeof b[sortKey] === 'string') {
      return sortDirection === 'asc'
        ? (a[sortKey] as string).localeCompare(b[sortKey] as string)
        : (b[sortKey] as string).localeCompare(a[sortKey] as string);
    }

    // Handle numeric comparisons
    if (typeof a[sortKey] === 'number' && typeof b[sortKey] === 'number') {
      return sortDirection === 'asc'
        ? (a[sortKey] as number) - (b[sortKey] as number)
        : (b[sortKey] as number) - (a[sortKey] as number);
    }

    // Handle boolean comparisons
    if (typeof a[sortKey] === 'boolean' && typeof b[sortKey] === 'boolean') {
      return sortDirection === 'asc'
        ? (a[sortKey] === b[sortKey] ? 0 : a[sortKey] ? 1 : -1)
        : (a[sortKey] === b[sortKey] ? 0 : a[sortKey] ? -1 : 1);
    }

    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedStores(filteredStores.map(store => store.id || store.href));
    } else if (selectedStores.length === filteredStores.length) {
      setSelectedStores([]);
    }
  }, [selectAll, filteredStores]);

  // Handle bulk selection
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleSelectStore = (id: string) => {
    if (selectedStores.includes(id)) {
      setSelectedStores(selectedStores.filter(storeId => storeId !== id));
    } else {
      setSelectedStores([...selectedStores, id]);
    }
  };

  // Handle bulk actions
  const performBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedStores.length} stores? This action cannot be undone.`)) {
          selectedStores.forEach(id => {
            const store = enhancedStores.find(s => s.id === id || s.href === id);
            if (store) {
              deleteStore(store.href);
            }
          });
          showToast(`Successfully deleted ${selectedStores.length} stores`);
          setSelectedStores([]);
        }
        break;

      case 'activate':
        setEnhancedStores(prev => prev.map(store =>
          selectedStores.includes(store.id || store.href)
            ? { ...store, status: 'active' }
            : store
        ));
        showToast(`Successfully activated ${selectedStores.length} stores`);
        break;

      case 'archive':
        setEnhancedStores(prev => prev.map(store =>
          selectedStores.includes(store.id || store.href)
            ? { ...store, status: 'archived' }
            : store
        ));
        showToast(`Successfully archived ${selectedStores.length} stores`);
        break;

      case 'feature':
        setEnhancedStores(prev => prev.map(store =>
          selectedStores.includes(store.id || store.href)
            ? { ...store, featured: true }
            : store
        ));
        showToast(`Successfully featured ${selectedStores.length} stores`);
        break;

      case 'unfeature':
        setEnhancedStores(prev => prev.map(store =>
          selectedStores.includes(store.id || store.href)
            ? { ...store, featured: false }
            : store
        ));
        showToast(`Successfully un-featured ${selectedStores.length} stores`);
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

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(',').map(category => category.trim()).filter(Boolean);
    setFormData({ ...formData, categories });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would be generated by the backend
    const now = new Date().toISOString();

    if (currentStore) {
      // Update existing store
      const updatedStore = {
        ...formData,
        updatedAt: now,
      };

      updateStore(currentStore.href, updatedStore);

      // Update in enhanced stores array too
      setEnhancedStores(prev => prev.map(store =>
        store.id === currentStore.id || store.href === currentStore.href
          ? updatedStore
          : store
      ));

      showToast('Store updated successfully');
      setIsEditModalOpen(false);
    } else {
      // Add new store
      const newStore = {
        ...formData,
        id: `store-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        dealCount: 0,
        clickCount: 0,
        conversionRate: 0,
      };

      addStore(newStore);

      // Add to enhanced stores array too
      setEnhancedStores(prev => [...prev, newStore]);

      showToast('Store added successfully');
      setIsAddModalOpen(false);
    }

    // Reset form
    setFormData({
      name: '',
      href: '',
      icon: '',
      description: '',
      categories: [],
      status: 'active',
      featured: false,
      website: '',
      affiliateProgram: '',
      commission: '',
    });
    setCurrentStore(null);
  };

  const handleEdit = (store: EnhancedStoreItem) => {
    setCurrentStore(store);
    setFormData(store);
    setIsEditModalOpen(true);
  };

  const handleDelete = (href: string) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      deleteStore(href);

      // Remove from enhanced stores array too
      setEnhancedStores(prev => prev.filter(store => store.href !== href));

      showToast('Store deleted successfully');
    }
  };

  const handleAddNew = () => {
    setCurrentStore(null);
    setFormData({
      name: '',
      href: '',
      icon: '',
      description: '',
      categories: [],
      status: 'active',
      featured: false,
      website: '',
      affiliateProgram: '',
      commission: '',
    });
    setIsAddModalOpen(true);
  };

  const handleViewAnalytics = (store: EnhancedStoreItem) => {
    setAnalyticsStore(store);
    setShowAnalytics(true);
  };

  // Generate random analytics data for the demo
  const generateAnalyticsData = (days: number) => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().slice(0, 10),
        clicks: Math.floor(Math.random() * 500) + 50,
        conversions: Math.floor(Math.random() * 50) + 5,
        revenue: Math.floor(Math.random() * 1000) + 100,
      };
    });
  };

  // Render store form
  const renderStoreForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Store Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL Path *
          </label>
          <input
            type="text"
            name="href"
            value={formData.href}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="/stores/store-name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Icon URL *
          </label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website URL
          </label>
          <input
            type="text"
            name="website"
            value={formData.website || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="https://www.example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categories (comma separated)
          </label>
          <input
            type="text"
            name="categories"
            value={formData.categories?.join(', ') || ''}
            onChange={handleCategoriesChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="Electronics, Home, Fashion"
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
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Affiliate Program
          </label>
          <input
            type="text"
            name="affiliateProgram"
            value={formData.affiliateProgram || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="Amazon Associates, ShareASale, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Commission Rate
          </label>
          <input
            type="text"
            name="commission"
            value={formData.commission || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
            placeholder="5%, 10%, etc."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white"
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
              Featured Store
            </span>
          </label>
        </div>
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
          {currentStore ? 'Update Store' : 'Add Store'}
        </button>
      </div>
    </form>
  );

  // Render analytics modal
  const renderAnalyticsModal = () => {
    if (!analyticsStore) return null;

    const days = analyticsTimeframe === '7days' ? 7 : analyticsTimeframe === '30days' ? 30 : 90;
    const data = generateAnalyticsData(days);
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
    const totalConversions = data.reduce((sum, item) => sum + item.conversions, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {analyticsStore.name} Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analytics data for the selected timeframe
            </p>
          </div>
          <div>
            <select
              value={analyticsTimeframe}
              onChange={(e) => setAnalyticsTimeframe(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{totalClicks.toLocaleString()}</div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              +{Math.floor(Math.random() * 20) + 1}% from previous period
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Conversions</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{totalConversions.toLocaleString()}</div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              +{Math.floor(Math.random() * 15) + 1}% from previous period
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</div>
            <div className="mt-1 text-xs text-green-600 dark:text-green-400">
              +{Math.floor(Math.random() * 25) + 1}% from previous period
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Daily Performance</h4>
          <div className="h-60 w-full bg-gray-100 dark:bg-gray-700 rounded-md p-4 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              [Chart visualization would appear here in a real implementation]
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.slice(-7).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/70">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white whitespace-nowrap">{item.date}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.clicks}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.conversions}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">${item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowAnalytics(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dark:bg-gray-900 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Stores</h1>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Store
            </button>

            {selectedStores.length > 0 && (
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Bulk Actions ({selectedStores.length})
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
                        onClick={() => performBulkAction('archive')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Archive Selected
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white sm:text-sm"
              />
            </div>
          </div>

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
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
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
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="featuredFilter" className="sr-only">Filter by Featured</label>
            <select
              id="featuredFilter"
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white sm:text-sm"
            >
              <option value="all">All Stores</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
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
                Store
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categories
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Featured
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Performance
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {paginatedStores.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No stores found matching your criteria
                </td>
              </tr>
            ) : (
              paginatedStores.map((store) => (
                <tr key={store.id || store.href} className="hover:bg-gray-50 dark:hover:bg-gray-800/70">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id || store.href)}
                        onChange={() => handleSelectStore(store.id || store.href)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                        {store.icon ? (
                          <img src={store.icon} alt={store.name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{store.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <a href={store.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {store.website ? new URL(store.website).hostname : ''}
                          </a>
                        </div>
                        {store.affiliateProgram && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {store.affiliateProgram}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(store.categories || []).map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {category}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      store.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      store.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {store.status === 'active' ? 'Active' :
                       store.status === 'draft' ? 'Draft' :
                       'Archived'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {store.featured ? (
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
                    <div className="flex flex-col">
                      <div className="flex items-center mb-1">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {store.dealCount} Deals
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {store.clickCount?.toLocaleString()}
                        </span>
                        <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4">
                          <svg className="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {store.conversionRate?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(store)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(store)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                      >
                        Analytics
                      </button>
                      <button
                        onClick={() => handleDelete(store.href)}
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
      {filteredStores.length > 0 && (
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
                <span className="font-medium">{Math.min(page * itemsPerPage, filteredStores.length)}</span> of{' '}
                <span className="font-medium">{filteredStores.length}</span> results
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

      {/* Add Store Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Store"
        size="lg"
      >
        {renderStoreForm()}
      </Dialog>

      {/* Edit Store Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Store"
        size="lg"
      >
        {renderStoreForm()}
      </Dialog>

      {/* Analytics Modal */}
      <Dialog
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        title="Store Analytics"
        size="xl"
      >
        {renderAnalyticsModal()}
      </Dialog>
    </div>
  );
};

export default ManageStores;
