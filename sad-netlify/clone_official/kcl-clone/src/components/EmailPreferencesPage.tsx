import type React from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from './Layout';
import SEO from './SEO';
import { useNotifications, type NotificationPreferences } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';

const EmailPreferencesPage: React.FC = () => {
  const { subscription, isSubscribed, updatePreferences, unsubscribe, isLoading } = useNotifications();
  const { isAuthenticated } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    subscription?.preferences || {
      dailyDeals: true,
      favoriteStores: true,
      priceDrops: false,
      comments: false,
      coupons: true,
      weeklyNewsletter: true,
      marketing: false,
    }
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmUnsubscribe, setConfirmUnsubscribe] = useState(false);

  // Redirect if not authenticated or not subscribed
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoading && !isSubscribed) {
    return <Navigate to="/" replace />;
  }

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await updatePreferences(preferences);
      setSuccess(true);
      window.scrollTo(0, 0);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError((error as Error).message || 'Failed to update preferences');
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirmUnsubscribe) {
      setConfirmUnsubscribe(true);
      return;
    }

    try {
      await unsubscribe();
      // Redirect after successful unsubscribe
      window.location.href = '/';
    } catch (error) {
      setError((error as Error).message || 'Failed to unsubscribe');
      setConfirmUnsubscribe(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Email Preferences | Sales Aholics Deals"
        description="Manage your email notification preferences"
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Email Notification Preferences</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
            <p className="font-medium">Your preferences have been updated!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Your Email Address</h2>
            <p className="text-gray-700">{subscription?.email}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold mb-4">Notification Types</h2>
            <p className="text-gray-600 mb-4">Select which emails you'd like to receive:</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="dailyDeals"
                    name="dailyDeals"
                    type="checkbox"
                    checked={preferences.dailyDeals}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="dailyDeals" className="font-medium text-gray-700">Daily Deals Digest</label>
                  <p className="text-gray-500 text-sm">Get our best deals delivered every morning</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="favoriteStores"
                    name="favoriteStores"
                    type="checkbox"
                    checked={preferences.favoriteStores}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="favoriteStores" className="font-medium text-gray-700">Your Favorite Stores</label>
                  <p className="text-gray-500 text-sm">Get alerts when we add new deals from stores you follow</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="priceDrops"
                    name="priceDrops"
                    type="checkbox"
                    checked={preferences.priceDrops}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="priceDrops" className="font-medium text-gray-700">Price Drop Alerts</label>
                  <p className="text-gray-500 text-sm">Be notified when prices drop on items you've viewed</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="comments"
                    name="comments"
                    type="checkbox"
                    checked={preferences.comments}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="comments" className="font-medium text-gray-700">Comment Notifications</label>
                  <p className="text-gray-500 text-sm">Get notified when someone replies to your comments</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="coupons"
                    name="coupons"
                    type="checkbox"
                    checked={preferences.coupons}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="coupons" className="font-medium text-gray-700">Coupon Alerts</label>
                  <p className="text-gray-500 text-sm">Get notified about new coupons and promo codes</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="weeklyNewsletter"
                    name="weeklyNewsletter"
                    type="checkbox"
                    checked={preferences.weeklyNewsletter}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="weeklyNewsletter" className="font-medium text-gray-700">Weekly Newsletter</label>
                  <p className="text-gray-500 text-sm">A weekly roundup of our top deals and savings tips</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketing"
                    name="marketing"
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={handlePreferenceChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="marketing" className="font-medium text-gray-700">Marketing Messages</label>
                  <p className="text-gray-500 text-sm">Occasional offers and promotions from our partners</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={handleUnsubscribe}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                {confirmUnsubscribe ? 'Are you sure? Click again to confirm' : 'Unsubscribe from all emails'}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            We respect your privacy and are committed to protecting your personal information.
            Review our <a href="/krazy-coupon-lady-privacy-policy" className="text-primary hover:underline">Privacy Policy</a> for more details.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default EmailPreferencesPage;
