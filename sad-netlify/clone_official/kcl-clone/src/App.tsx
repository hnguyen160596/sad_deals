import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Layout from './components/Layout';
import { I18nProvider } from './components/i18nWrapper';

import HomePage from './pages/HomePage';
import TodaysDealsPage from './pages/TodaysDealsPage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import TipsListPage from './pages/TipsListPage';
import TelegramFeedPage from './pages/TelegramFeedPage';
import LoginPage from './pages/LoginPage';
import AllStoresPage from './pages/AllStoresPage';

function App() {
  return (
    <HelmetProvider>
      <I18nProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/deals/todays-deals" element={<TodaysDealsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tips" element={<TipsListPage />} />
            <Route path="/telegram-feed" element={<TelegramFeedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/stores" element={<AllStoresPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </I18nProvider>
    </HelmetProvider>
  );
}

export default App;
