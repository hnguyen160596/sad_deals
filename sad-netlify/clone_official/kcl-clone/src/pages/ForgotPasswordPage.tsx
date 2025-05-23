import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useUser } from '../context/UserContext';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useUser();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Reset Password | Sales Aholics Deals"
        description="Reset your password to regain access to your account."
      />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a password reset link
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {errorMessage}
            </div>
          )}

          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              <p className="font-medium">Check your email</p>
              <p className="text-sm mt-1">
                We've sent a password reset link to {email}. The link will expire in 30 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                Back to log in
              </Link>
            </p>
          </div>

          {/* Demo info for testing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 text-center">
              <p className="font-medium mb-1">Demo Reset</p>
              <p>Enter any email to test the password reset flow</p>
              <p className="mt-1">(No actual email will be sent in this demo)</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
