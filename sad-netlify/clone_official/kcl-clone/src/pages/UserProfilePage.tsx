import type React from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useUser } from '../context/UserContext';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const UserProfilePage = () => {
  const { user, isAuthenticated, favorites, isLoading, updateProfile, removeFavorite, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [activeTab, setActiveTab] = useState<'all' | 'deals' | 'stores' | 'tips'>('all');

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  // Handle form submission for profile update
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ displayName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Filter favorites based on active tab
  const filteredFavorites = favorites.filter(fav => {
    if (activeTab === 'all') return true;
    return fav.type === activeTab;
  });

  // Group favorites by type for the summary
  const favoriteCounts = {
    deals: favorites.filter(fav => fav.type === 'deal').length,
    stores: favorites.filter(fav => fav.type === 'store').length,
    tips: favorites.filter(fav => fav.type === 'tip').length,
    coupon: favorites.filter(fav => fav.type === 'coupon').length,
  };

  return (
    <Layout>
      <SEO
        title="Your Profile | Sales Aholics Deals"
        description="Manage your account and favorites"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <ProfileSection title="Profile">
              <div className="flex flex-col items-center pb-4">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-3">
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-medium">{user?.displayName}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Member since</span>
                  <span>{new Date(user?.createdAt || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total favorites</span>
                  <span>{favorites.length}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <a
                  href="/email-preferences"
                  className="block w-full text-center bg-primary text-white py-2 px-4 rounded transition-colors duration-200 hover:bg-primary/90"
                >
                  Email Preferences
                </a>
                <button
                  onClick={() => logout()}
                  className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </ProfileSection>
          </div>

          {/* Main content */}
          <div className="md:col-span-3 space-y-6">
            <ProfileSection title="Account Settings">
              {isEditing ? (
                <form onSubmit={handleSubmitProfile}>
                  <div className="mb-4">
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user?.displayName || '');
                      }}
                      className="bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Manage your account settings and profile information.
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </ProfileSection>

            <ProfileSection title="Your Favorites">
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm">
                    {favoriteCounts.deals} Deals
                  </div>
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm">
                    {favoriteCounts.stores} Stores
                  </div>
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm">
                    {favoriteCounts.tips} Tips
                  </div>
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm">
                    {favoriteCounts.coupon} Coupons
                  </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`${
                        activeTab === 'all'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab('deals')}
                      className={`${
                        activeTab === 'deals'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                    >
                      Deals
                    </button>
                    <button
                      onClick={() => setActiveTab('stores')}
                      className={`${
                        activeTab === 'stores'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                    >
                      Stores
                    </button>
                    <button
                      onClick={() => setActiveTab('tips')}
                      className={`${
                        activeTab === 'tips'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                    >
                      Tips
                    </button>
                  </nav>
                </div>

                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No favorites found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {activeTab === 'all'
                        ? 'Add items to your favorites while browsing the site'
                        : `Try browsing all favorites or add some ${activeTab}`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFavorites.map((favorite) => (
                      <div key={favorite.id} className="bg-white border border-gray-200 rounded-lg flex overflow-hidden hover:shadow-md transition-shadow duration-200">
                        {favorite.imageUrl && (
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={favorite.imageUrl}
                              alt={favorite.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full capitalize mb-2 inline-block">
                                {favorite.type}
                              </span>
                              <h3 className="font-medium">{favorite.title}</h3>
                            </div>
                            <button
                              onClick={() => removeFavorite(favorite.id)}
                              className="text-gray-400 hover:text-red-500"
                              aria-label="Remove from favorites"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-auto pt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Added {new Date(favorite.addedAt).toLocaleDateString()}
                            </span>
                            <a
                              href={favorite.url}
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              View →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
