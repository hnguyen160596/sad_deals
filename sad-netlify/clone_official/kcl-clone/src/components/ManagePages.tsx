import type React from 'react';
import { useState, useEffect } from 'react';

// Define page type
interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  template: 'standard' | 'landing' | 'blog' | 'product' | 'custom';
  status: 'published' | 'draft' | 'scheduled';
  featured: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
}

// Sample data for pages
const samplePages: Page[] = [
  {
    id: '1',
    title: 'Home Page',
    slug: '/',
    content: '<h1>Welcome to our site</h1><p>This is the home page content.</p>',
    template: 'landing',
    status: 'published',
    featured: true,
    seo: {
      title: 'Sales Aholics Deals - Find the Best Deals',
      description: 'Discover the best coupons, promo codes, and deals on your favorite products.',
      keywords: 'deals, coupons, promo codes, discounts',
      ogImage: 'https://salesaholicsdeals.com/og-image.jpg',
    },
    author: 'Admin User',
    createdAt: '2025-04-15T12:00:00Z',
    updatedAt: '2025-05-15T14:30:00Z',
    publishedAt: '2025-05-15T15:00:00Z',
  },
  {
    id: '2',
    title: 'About Us',
    slug: '/about',
    content: '<h1>About Us</h1><p>Learn more about our company and mission.</p>',
    template: 'standard',
    status: 'published',
    featured: false,
    seo: {
      title: 'About Sales Aholics Deals',
      description: 'Learn about our mission to help you save money on products you love.',
      keywords: 'about us, mission, team, company',
      ogImage: 'https://salesaholicsdeals.com/about-og-image.jpg',
    },
    author: 'Admin User',
    createdAt: '2025-04-16T10:00:00Z',
    updatedAt: '2025-04-16T10:00:00Z',
    publishedAt: '2025-04-16T10:30:00Z',
  },
  {
    id: '3',
    title: 'Summer Sale Guide',
    slug: '/guides/summer-sale',
    content: '<h1>Summer Sale Guide</h1><p>Discover the best deals this summer.</p>',
    template: 'blog',
    status: 'draft',
    featured: true,
    seo: {
      title: 'Summer Sale Guide - Top Deals and Tips',
      description: 'Get ready for the biggest summer sales with our exclusive guide.',
      keywords: 'summer sale, shopping guide, seasonal deals',
      ogImage: 'https://salesaholicsdeals.com/summer-guide-og.jpg',
    },
    author: 'Editor User',
    createdAt: '2025-05-18T09:00:00Z',
    updatedAt: '2025-05-19T11:45:00Z',
  },
  {
    id: '4',
    title: 'Black Friday Preview',
    slug: '/events/black-friday',
    content: '<h1>Black Friday Preview</h1><p>Get ready for the biggest shopping day.</p>',
    template: 'landing',
    status: 'scheduled',
    featured: true,
    seo: {
      title: 'Black Friday Deals Preview - Sales Aholics',
      description: 'Preview the best Black Friday deals before they go live.',
      keywords: 'black friday, sales, deals, shopping event',
      ogImage: 'https://salesaholicsdeals.com/black-friday-og.jpg',
    },
    author: 'Admin User',
    createdAt: '2025-05-17T14:20:00Z',
    updatedAt: '2025-05-19T16:30:00Z',
    scheduledAt: '2025-11-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'Contact Us',
    slug: '/contact',
    content: '<h1>Contact Us</h1><p>Get in touch with our team.</p>',
    template: 'standard',
    status: 'published',
    featured: false,
    seo: {
      title: 'Contact Sales Aholics Deals',
      description: 'Contact our team for support, partnership opportunities, or general inquiries.',
      keywords: 'contact, support, help, inquiries',
      ogImage: 'https://salesaholicsdeals.com/contact-og.jpg',
    },
    author: 'Admin User',
    createdAt: '2025-04-16T11:00:00Z',
    updatedAt: '2025-04-16T11:00:00Z',
    publishedAt: '2025-04-16T11:30:00Z',
  },
];

const ManagePages: React.FC = () => {
  // State for pages with sample data
  const [pages, setPages] = useState<Page[]>(() => {
    const savedPages = localStorage.getItem('cmsPages');
    return savedPages ? JSON.parse(savedPages) : samplePages;
  });

  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    template: '',
    search: '',
    featured: '',
  });

  // Save pages to localStorage when they change
  useEffect(() => {
    localStorage.setItem('cmsPages', JSON.stringify(pages));
  }, [pages]);

  // State for the editing page
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  // State for page modal visibility
  const [showPageModal, setShowPageModal] = useState(false);

  // Apply filters to the pages
  const filteredPages = pages.filter(page => {
    // Filter by status
    if (filters.status && page.status !== filters.status) return false;

    // Filter by template
    if (filters.template && page.template !== filters.template) return false;

    // Filter by featured
    if (filters.featured) {
      if (filters.featured === 'featured' && !page.featured) return false;
      if (filters.featured === 'not-featured' && page.featured) return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        page.title.toLowerCase().includes(searchLower) ||
        page.slug.toLowerCase().includes(searchLower) ||
        page.content.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Handle adding a new page
  const handleAddPage = () => {
    // Create a new blank page
    const newPage: Page = {
      id: `page_${Date.now()}`,
      title: 'New Page',
      slug: `/new-page-${Date.now()}`,
      content: '<p>Enter your content here...</p>',
      template: 'standard',
      status: 'draft',
      featured: false,
      seo: {
        title: '',
        description: '',
        keywords: '',
        ogImage: '',
      },
      author: 'Admin User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingPage(newPage);
    setShowPageModal(true);
  };

  // Handle editing a page
  const handleEditPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setEditingPage({...page});
      setShowPageModal(true);
    }
  };

  // Handle saving a page (new or edited)
  const handleSavePage = () => {
    if (!editingPage) return;

    const now = new Date().toISOString();
    const updatedPage = {
      ...editingPage,
      updatedAt: now,
      // If status is changed to published, set publishedAt if not already set
      publishedAt: editingPage.status === 'published' && !editingPage.publishedAt
        ? now
        : editingPage.publishedAt,
    };

    if (pages.some(p => p.id === updatedPage.id)) {
      // Update existing page
      setPages(pages.map(p => p.id === updatedPage.id ? updatedPage : p));
    } else {
      // Add new page
      setPages([...pages, updatedPage]);
    }

    // Close the modal
    setShowPageModal(false);
    setEditingPage(null);
  };

  // Handle deleting a page
  const handleDeletePage = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      setPages(pages.filter(page => page.id !== pageId));
    }
  };

  // Handle duplicating a page
  const handleDuplicatePage = (pageId: string) => {
    const pageToDuplicate = pages.find(p => p.id === pageId);
    if (!pageToDuplicate) return;

    const now = new Date().toISOString();
    const duplicatedPage: Page = {
      ...pageToDuplicate,
      id: `page_${Date.now()}`,
      title: `${pageToDuplicate.title} (Copy)`,
      slug: `${pageToDuplicate.slug}-copy-${Date.now()}`,
      status: 'draft', // Always set to draft
      createdAt: now,
      updatedAt: now,
      publishedAt: undefined, // Reset published date
    };

    setPages([...pages, duplicatedPage]);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Update the editing page when a field changes
  const updateEditingPage = (field: string, value: any) => {
    if (!editingPage) return;

    if (field.includes('.')) {
      // Handle nested fields like seo.title
      const [parent, child] = field.split('.');
      setEditingPage({
        ...editingPage,
        [parent]: {
          ...editingPage[parent as keyof Page],
          [child]: value
        }
      });
    } else {
      // Handle top-level fields
      setEditingPage({
        ...editingPage,
        [field]: value
      });
    }
  };

  return (
    <div className="page-management">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Page Management</h1>

        <button
          onClick={handleAddPage}
          className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90 transition"
        >
          Add New Page
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-600 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search pages..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Template</label>
            <select
              value={filters.template}
              onChange={(e) => setFilters({...filters, template: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            >
              <option value="">All Templates</option>
              <option value="standard">Standard</option>
              <option value="landing">Landing</option>
              <option value="blog">Blog</option>
              <option value="product">Product</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Featured</label>
            <select
              value={filters.featured}
              onChange={(e) => setFilters({...filters, featured: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
            >
              <option value="">All Pages</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.length > 0 ? (
                filteredPages.map(page => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{page.title}</div>
                      <div className="text-xs text-gray-500">by {page.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="capitalize">{page.template}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                      {page.status === 'scheduled' && page.scheduledAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(page.scheduledAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(page.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={page.featured ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditPage(page.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicatePage(page.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No pages found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Edit Modal */}
      {showPageModal && editingPage && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {pages.some(p => p.id === editingPage.id) ? 'Edit Page' : 'Add New Page'}
                </h3>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left column - Core page details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingPage.title}
                        onChange={(e) => updateEditingPage('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Slug</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-100 text-gray-500 border border-r-0 border-gray-300 rounded-l-md">
                          /
                        </span>
                        <input
                          type="text"
                          value={editingPage.slug.replace(/^\//g, '')}
                          onChange={(e) => updateEditingPage('slug', `/${e.target.value.replace(/^\//g, '')}`)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Content</label>
                      <textarea
                        value={editingPage.content}
                        onChange={(e) => updateEditingPage('content', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        rows={8}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Template</label>
                        <select
                          value={editingPage.template}
                          onChange={(e) => updateEditingPage('template', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        >
                          <option value="standard">Standard</option>
                          <option value="landing">Landing Page</option>
                          <option value="blog">Blog Post</option>
                          <option value="product">Product Page</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Status</label>
                        <select
                          value={editingPage.status}
                          onChange={(e) => updateEditingPage('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>

                    {editingPage.status === 'scheduled' && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Schedule Publication Date</label>
                        <input
                          type="datetime-local"
                          value={editingPage.scheduledAt?.replace('Z', '') || ''}
                          onChange={(e) => updateEditingPage('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={editingPage.featured}
                        onChange={(e) => updateEditingPage('featured', e.target.checked)}
                        className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                        Featured Page
                      </label>
                    </div>
                  </div>

                  {/* Right column - SEO settings */}
                  <div className="flex-1 space-y-4">
                    <h4 className="font-medium text-gray-900">SEO Settings</h4>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={editingPage.seo.title}
                        onChange={(e) => updateEditingPage('seo.title', e.target.value)}
                        placeholder={editingPage.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Meta Description</label>
                      <textarea
                        value={editingPage.seo.description}
                        onChange={(e) => updateEditingPage('seo.description', e.target.value)}
                        placeholder="Enter a description for search engines..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Keywords</label>
                      <input
                        type="text"
                        value={editingPage.seo.keywords}
                        onChange={(e) => updateEditingPage('seo.keywords', e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Social Image URL</label>
                      <input
                        type="text"
                        value={editingPage.seo.ogImage}
                        onChange={(e) => updateEditingPage('seo.ogImage', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#982a4a]/50"
                      />
                    </div>

                    {editingPage.seo.ogImage && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Image Preview</label>
                        <div className="h-32 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                          <img
                            src={editingPage.seo.ogImage}
                            alt="Social preview"
                            className="max-h-32 max-w-full object-contain"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/1200x630/e0e0e0/818181?text=Image+Not+Found'}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSavePage}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#982a4a] text-base font-medium text-white hover:bg-[#982a4a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#982a4a] sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPageModal(false);
                    setEditingPage(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default ManagePages;
