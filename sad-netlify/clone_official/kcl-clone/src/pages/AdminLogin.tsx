import type React from 'react';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import TwoFactorVerification from '../components/TwoFactorVerification';

const AdminLogin: React.FC = () => {
  const { login, currentUser, hasPermission } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to admin dashboard
  const from = location.state?.from?.pathname || '/admin';

  // If user is already logged in and has admin access, redirect to admin dashboard
  useEffect(() => {
    if (currentUser && (currentUser.isAdmin || hasPermission('MANAGE_SETTINGS'))) {
      navigate(from, { replace: true });
    }
  }, [currentUser, hasPermission, navigate, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    try {
      const result = login(email, password);

      if (result.success) {
        if (result.requiresTwoFactor && result.userId) {
          // User needs to complete two-factor authentication
          setUserId(result.userId);
          setRequiresTwoFactor(true);
        }
        // If no 2FA required, navigation will happen in the useEffect
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    // This will be called after successful 2FA verification
    // The login state is already updated by the verifyTwoFactorCode function
    // Navigation will happen in the useEffect
  };

  const handleTwoFactorCancel = () => {
    // User canceled 2FA, go back to login form
    setRequiresTwoFactor(false);
    setUserId(null);
  };

  // Show the two-factor verification form if required
  if (requiresTwoFactor && userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <TwoFactorVerification
          userId={userId}
          onSuccess={handleTwoFactorSuccess}
          onCancel={handleTwoFactorCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[#982a4a] hover:text-[#982a4a]/80">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#982a4a] hover:bg-[#982a4a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#982a4a] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Demo login info */}
          <div className="text-sm text-center text-gray-600 mt-4">
            <p>Demo Credentials:</p>
            <p className="text-xs">Admin: admin@salesaholicsdeals.com / admin123</p>
            <p className="text-xs">Editor: editor@example.com / password</p>
            <p className="text-xs">Moderator: moderator@example.com / password</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
