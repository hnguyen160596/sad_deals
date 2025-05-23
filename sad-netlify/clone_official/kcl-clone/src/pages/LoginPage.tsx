import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useUser } from '../context/UserContext';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loginInProgress, setLoginInProgress] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state or default to profile
  const from = location.state?.from?.pathname || '/profile';

  // If already authenticated, redirect to profile
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoginInProgress(true);

    try {
      await login(email, password);
      // Login successful - the useEffect hook will handle redirect
    } catch (error) {
      setErrorMessage((error as Error).message || 'Login failed. Please try again.');
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Log In | Sales Aholics Deals"
        description="Log in to your account to access your favorites and personalized deals."
      />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-2">
              Log in to access your favorites and personalized deals
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {errorMessage}
            </div>
          )}

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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loginInProgress}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
              >
                {loginInProgress ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Demo login info for testing */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 text-center">
              <p className="font-medium mb-1">Demo Login</p>
              <p>Enter any email and password to test the user account features</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
