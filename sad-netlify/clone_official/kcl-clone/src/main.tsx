import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './i18n'; // Import i18n configuration
import { UserProvider } from './context/UserContext';

// Simple mounting with error handling
const root = document.getElementById('root');

if (root) {
  try {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <BrowserRouter>
          <UserProvider>
            <App />
          </UserProvider>
        </BrowserRouter>
      </React.StrictMode>
    );

    // Hide loader once mounted
    setTimeout(() => {
      const loader = document.getElementById('loading-fallback');
      if (loader) loader.style.display = 'none';
    }, 1000);
  } catch (error) {
    console.error('Failed to render application:', error);
  }
} else {
  console.error('Root element not found');
}
