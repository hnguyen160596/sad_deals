import type React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const UnauthorizedPage: React.FC = () => {
  const { currentUser, logout } = useUser();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>

        <p className="text-gray-600 mb-6">
          {currentUser
            ? `Sorry, ${currentUser.displayName}. You don't have permission to access this page.`
            : 'You need to be logged in to access this page.'
          }
        </p>

        <div className="space-y-3">
          {currentUser ? (
            <>
              <Link
                to="/admin"
                className="block w-full bg-[#982a4a] text-white py-2 px-4 rounded-md hover:bg-[#982a4a]/90 transition"
              >
                Go to Dashboard
              </Link>

              <Link
                to="/"
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Go to Home Page
              </Link>

              <button
                onClick={logout}
                className="block w-full border border-gray-300 text-gray-600 py-2 px-4 rounded-md hover:bg-gray-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/admin-login"
                className="block w-full bg-[#982a4a] text-white py-2 px-4 rounded-md hover:bg-[#982a4a]/90 transition"
              >
                Login
              </Link>

              <Link
                to="/"
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Go to Home Page
              </Link>
            </>
          )}
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        If you believe this is an error, please contact your administrator.
      </p>
    </div>
  );
};

export default UnauthorizedPage;
