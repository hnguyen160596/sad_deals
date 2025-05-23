import type React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useUser } from '../context/UserContext';

const SignupPage: React.FC = () => {
  const { signup, isAuthenticated, isLoading } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [signupInProgress, setSignupInProgress] = useState(false);

  const navigate = useNavigate();

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setSignupInProgress(true);

    try {
      await signup(email, password, displayName);
      // Signup successful - the useEffect hook will handle redirect
    } catch (error) {
      setErrorMessage((error as Error).message || 'Signup failed. Please try again.');
    } finally {
      setSignupInProgress(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Sign Up | Sales Aholics Deals"
        description="Create an account to save your favorite deals, get personalized recommendations, and receive deal alerts."
      />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600 mt-2">
              Join to save favorites and get personalized deals
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Your name"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            <div className="text-sm text-gray-600">
              By signing up, you agree to our{' '}
              <Link to="/krazy-coupon-lady-privacy-policy" className="text-primary hover:text-primary/80">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-primary hover:text-primary/80">
                Terms of Service
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={signupInProgress}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                {signupInProgress ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                Log in
              </Link>
            </p>
          </div>

          {/* Demo signup info for testing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 text-center">
              <p className="font-medium mb-1">Demo Registration</p>
              <p>Enter any email and password to test the user account features</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
