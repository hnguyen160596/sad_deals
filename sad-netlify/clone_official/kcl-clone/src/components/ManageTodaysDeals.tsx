import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiSearch, FiCalendar, FiClock, FiEdit2, FiTrash2, FiCopy, FiEye } from 'react-icons/fi';
import DealEditor from './DealEditor';
import { useCMS } from '../context/CMSContext';

// Types for deals
interface DealItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  originalPrice: string;
  discount: string;
  stores: string[];
  categories: string[];
  url: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
  publishedAt?: string;
  scheduledAt?: string;
}

// New deal template
const newDealTemplate: Omit<DealItem, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  image: '',
  price: '',
  originalPrice: '',
  discount: '',
  stores: [],
  categories: [],
  url: '',
  featured: false,
  active: true
};

const ManageTodaysDeals: React.FC = () => {
  // Get stores from CMS context
  const { stores } = useCMS();

  // Demo deals data
  const [deals, setDeals] = useState<DealItem[]>([
    {
      id: '1',
      title: "Apple AirPods Pro (2nd Generation)",
      description: "<p>Incredible sound quality with active noise cancellation. Limited time offer!</p>",
      image: "https://example.com/airpods.jpg",
      price: "$189.99",
      originalPrice: "$249.99",
      discount: "24%",
      stores: ["Amazon", "Best Buy"],
      categories: ["Electronics", "Audio"],
      url: "https://amazon.com/airpods-pro",
      featured: true,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    },
    {
      id: '2',
      title: "KitchenAid 5.5 Quart Bowl-Lift Stand Mixer",
      description: "<p>Professional series mixer with 11 attachments included.</p><p>Perfect for baking enthusiasts!</p>",
      image: "https://example.com/kitchenaid.jpg",
      price: "$299.99",
      originalPrice: "$449.99",
      discount: "33%",
      stores: ["Best Buy", "Target"],
      categories: ["Kitchen", "Appliances"],
      url: "https://bestbuy.com/kitchenaid-mixer",
      featured: false,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    },
    {
      id: '3',
      title: "Ninja Foodi 10-in-1 Pressure Cooker and Air Fryer",
      description: "<p>The ultimate kitchen gadget that does it all!</p><p>✅ Pressure cooking</p><p>✅ Air frying</p><p>✅ Slow cooking</p>",
      image: "https://example.com/ninja.jpg",
      price: "$149.99",
      originalPrice: "$249.99",
      discount: "40%",
      stores: ["Target", "Walmart"],
      categories: ["Kitchen", "Appliances"],
      url: "https://target.com/ninja-foodi",
      featured: true,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
    },
    {
      id: '4',
      title: "Dyson V11 Cordless Vacuum Cleaner",
      description: "<p>Powerful suction with intelligent sensor technology. Includes multiple attachments.</p>",
      image: "https://example.com/dyson.jpg",
      price: "$499.99",
      originalPrice: "$699.99",
      discount: "29%",
      stores: ["Walmart", "Best Buy"],
      categories: ["Home", "Appliances"],
      url: "https://walmart.com/dyson-v11",
      featured: false,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days from now
    },
    {
      id: '5',
      title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
      description: "<p>Industry-leading noise cancellation with exceptional sound quality.</p><img src=\"https://example.com/headphones-detail.jpg\" alt=\"Headphones detail\" />",
      image: "https://example.com/sony.jpg",
      price: "$328.00",
      originalPrice: "$399.99",
      discount: "18%",
      stores: ["Amazon", "Best Buy"],
      categories: ["Electronics", "Audio"],
      url: "https://amazon.com/sony-headphones",
      featured: false,
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
    },
  ]);

  // States for filtering/sorting
  const [filters, setFilters] = useState({
    search: '',
    store: '',
    category: '',
    status: '',
    featured: ''
  });

  // Deal editor states
  const [showDealModal, setShowDealModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentDeal, setCurrentDeal] = useState<DealItem | null>(null);
  const [editDealForm, setEditDealForm] = useState<Omit<DealItem, 'id' | 'createdAt'>>({...newDealTemplate});

  // Handle opening add deal modal
  const handleAddDeal = () => {
    setModalMode('add');
    setEditDealForm({...newDealTemplate});
    setShowDealModal(true);
  };

  // Handle opening edit deal modal
  const handleEditDeal = (deal: DealItem) => {
    setModalMode('edit');
    setCurrentDeal(deal);

    // Set form with the deal data
    setEditDealForm({
      title: deal.title,
      description: deal.description,
      image: deal.image,
      price: deal.price,
      originalPrice: deal.originalPrice,
      discount: deal.discount,
      stores: [...deal.stores],
      categories: [...deal.categories],
      url: deal.url,
      featured: deal.featured,
      active: deal.active,
      expiresAt: deal.expiresAt,
      publishedAt: deal.publishedAt,
      scheduledAt: deal.scheduledAt
    });

    setShowDealModal(true);
  };

  // Handle form input changes
  const handleFormChange = (field: string, value: any) => {
    setEditDealForm({
      ...editDealForm,
      [field]: value
    });
  };

  // Handle store selection (multiple)
  const handleStoreToggle = (storeName: string) => {
    if (editDealForm.stores.includes(storeName)) {
      // Remove store if already selected
      setEditDealForm({
        ...editDealForm,
        stores: editDealForm.stores.filter(store => store !== storeName)
      });
    } else {
      // Add store if not selected
      setEditDealForm({
        ...editDealForm,
        stores: [...editDealForm.stores, storeName]
      });
    }
  };

  // Handle category selection (multiple)
  const handleCategoryToggle = (category: string) => {
    if (editDealForm.categories.includes(category)) {
      // Remove category if already selected
      setEditDealForm({
        ...editDealForm,
        categories: editDealForm.categories.filter(cat => cat !== category)
      });
    } else {
      // Add category if not selected
      setEditDealForm({
        ...editDealForm,
        categories: [...editDealForm.categories, category]
      });
    }
  };

  // Save deal (add or edit)
  const handleSaveDeal = () => {
    if (modalMode === 'add') {
      // Add new deal
      const newDeal: DealItem = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...editDealForm
      };

      setDeals([newDeal, ...deals]);
    } else if (modalMode === 'edit' && currentDeal) {
      // Update existing deal
      setDeals(deals.map(deal =>
        deal.id === currentDeal.id
          ? { ...deal, ...editDealForm }
          : deal
      ));
    }

    // Close modal
    setShowDealModal(false);
    setCurrentDeal(null);
  };

  // Delete deal
  const handleDeleteDeal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setDeals(deals.filter(deal => deal.id !== id));
    }
  };

  // Duplicate deal
  const handleDuplicateDeal = (deal: DealItem) => {
    const duplicatedDeal: DealItem = {
      ...deal,
      id: Date.now().toString(),
      title: `${deal.title} (Copy)`,
      createdAt: new Date().toISOString(),
      active: true,
    };

    setDeals([duplicatedDeal, ...deals]);
  };

  // Toggle deal featured status
  const toggleFeatured = (id: string) => {
    setDeals(deals.map(deal =>
      deal.id === id ? { ...deal, featured: !deal.featured } : deal
    ));
  };

  // Toggle deal active status
  const toggleActive = (id: string) => {
    setDeals(deals.map(deal =>
      deal.id === id ? { ...deal, active: !deal.active } : deal
    ));
  };

  // Get all unique categories from deals
  const allCategories = Array.from(
    new Set(deals.flatMap(deal => deal.categories))
  );

  // Get all unique stores from deals
  const allStores = Array.from(
    new Set(deals.flatMap(deal => deal.stores))
  );

  // Apply filters to deals
  const filteredDeals = deals.filter(deal => {
    // Search filter
    if (filters.search && !deal.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Store filter
    if (filters.store && !deal.stores.includes(filters.store)) {
      return false;
    }

    // Category filter
    if (filters.category && !deal.categories.includes(filters.category)) {
      return false;
    }

    // Status filter
    if (filters.status === 'active' && !deal.active) return false;
    if (filters.status === 'inactive' && deal.active) return false;

    // Featured filter
    if (filters.featured === 'featured' && !deal.featured) return false;
    if (filters.featured === 'not-featured' && deal.featured) return false;

    return true;
  });

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get URL domain
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (e) {
      return url;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Today's Deals</h1>

      {/* Action Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <button
          onClick={handleAddDeal}
          className="flex items-center gap-2 bg-[#982a4a] text-white px-4 py-2 rounded-lg hover:bg-[#982a4a]/90 transition"
        >
          <FiPlus />
          Add New Deal
        </button>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <FiSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search deals..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="border rounded-lg pl-10 pr-4 py-2 w-full md:w-auto"
            />
          </div>

          <select
            className="border rounded-lg px-4 py-2"
            value={filters.store}
            onChange={(e) => setFilters({...filters, store: e.target.value})}
          >
            <option value="">All Stores</option>
            {allStores.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            {allCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            value={filters.featured}
            onChange={(e) => setFilters({...filters, featured: e.target.value})}
          >
            <option value="">All Deals</option>
            <option value="featured">Featured</option>
            <option value="not-featured">Not Featured</option>
          </select>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stores</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className={!deal.active ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded">
                          {deal.image ? (
                            <img
                              src={deal.image}
                              alt={deal.title}
                              className="h-12 w-12 object-cover rounded"
                              onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image'}
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {deal.url && (
                              <a href={deal.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {getDomain(deal.url)}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deal.price}</div>
                      {deal.originalPrice && (
                        <div className="text-xs">
                          <span className="line-through text-gray-500">{deal.originalPrice}</span>
                          {deal.discount && (
                            <span className="ml-2 text-green-600">-{deal.discount}</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {deal.stores.map((store) => (
                          <span key={store} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {store}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {deal.categories.map((category) => (
                          <span key={category} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-500">
                        {deal.expiresAt ? formatDate(deal.expiresAt) : 'No expiration'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleFeatured(deal.id)}
                        className={`w-6 h-6 rounded-full ${deal.featured ? 'bg-yellow-400' : 'bg-gray-200'} flex items-center justify-center`}
                      >
                        {deal.featured && (
                          <span className="text-yellow-800">★</span>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleActive(deal.id)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 ${deal.active ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform transition ease-in-out duration-200 bg-white rounded-full ${deal.active ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditDeal(deal)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Deal"
                      >
                        <FiEdit2 className="inline" />
                      </button>
                      <button
                        onClick={() => handleDuplicateDeal(deal)}
                        className="text-green-600 hover:text-green-900"
                        title="Duplicate Deal"
                      >
                        <FiCopy className="inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Deal"
                      >
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No deals found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {modalMode === 'add' ? 'Add New Deal' : 'Edit Deal'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDealModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Deal Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editDealForm.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={editDealForm.url}
                        onChange={(e) => handleFormChange('url', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com/deal"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={editDealForm.image}
                        onChange={(e) => handleFormChange('image', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editDealForm.price}
                          onChange={(e) => handleFormChange('price', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="$99.99"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Price
                        </label>
                        <input
                          type="text"
                          value={editDealForm.originalPrice}
                          onChange={(e) => handleFormChange('originalPrice', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="$149.99"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount
                        </label>
                        <input
                          type="text"
                          value={editDealForm.discount}
                          onChange={(e) => handleFormChange('discount', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="30%"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expires At
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={editDealForm.expiresAt ? new Date(editDealForm.expiresAt).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleFormChange('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                            className="w-full border border-gray-300 rounded-md pl-10 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Schedule For
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiClock className="text-gray-400" />
                          </div>
                          <input
                            type="date"
                            value={editDealForm.scheduledAt ? new Date(editDealForm.scheduledAt).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleFormChange('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                            className="w-full border border-gray-300 rounded-md pl-10 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="featured"
                          type="checkbox"
                          checked={editDealForm.featured}
                          onChange={(e) => handleFormChange('featured', e.target.checked)}
                          className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                          Featured Deal
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="active"
                          type="checkbox"
                          checked={editDealForm.active}
                          onChange={(e) => handleFormChange('active', e.target.checked)}
                          className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Rich Description and Categories */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Description
                      </label>
                      <DealEditor
                        initialContent={editDealForm.description}
                        onContentChange={(content) => handleFormChange('description', content)}
                        minHeight="150px"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stores <span className="text-red-500">*</span>
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {stores.map((store) => (
                            <div key={store.name} className="flex items-center">
                              <input
                                id={`store-${store.name}`}
                                type="checkbox"
                                checked={editDealForm.stores.includes(store.name)}
                                onChange={() => handleStoreToggle(store.name)}
                                className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                              />
                              <label htmlFor={`store-${store.name}`} className="ml-2 block text-sm text-gray-900">
                                {store.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Select all stores that apply to this deal
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categories
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {allCategories.map((category) => (
                            <div key={category} className="flex items-center">
                              <input
                                id={`category-${category}`}
                                type="checkbox"
                                checked={editDealForm.categories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                                className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                              />
                              <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-900">
                                {category}
                              </label>
                            </div>
                          ))}

                          {/* New category input */}
                          <div className="w-full mt-2">
                            <div className="flex">
                              <input
                                type="text"
                                placeholder="Add new category..."
                                className="flex-1 border border-gray-300 rounded-l-md px-3 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value) {
                                    e.preventDefault();
                                    const newCategory = e.currentTarget.value.trim();
                                    if (newCategory && !editDealForm.categories.includes(newCategory)) {
                                      handleFormChange('categories', [...editDealForm.categories, newCategory]);
                                    }
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="bg-gray-200 px-3 py-1 rounded-r-md hover:bg-gray-300"
                                onClick={(e) => {
                                  const input = e.currentTarget.previousSibling as HTMLInputElement;
                                  const newCategory = input.value.trim();
                                  if (newCategory && !editDealForm.categories.includes(newCategory)) {
                                    handleFormChange('categories', [...editDealForm.categories, newCategory]);
                                  }
                                  input.value = '';
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSaveDeal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#982a4a] text-base font-medium text-white hover:bg-[#982a4a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#982a4a] sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {modalMode === 'add' ? 'Add Deal' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDealModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTodaysDeals;
