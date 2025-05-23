import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { CommentProvider } from '../context/CommentContext';
import { NotificationProvider } from '../context/NotificationContext';
import { ABTestProvider } from '../context/ABTestContext';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Mock any other contexts or providers your app uses
const MockProviders = ({ children }: { children: ReactNode }) => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <UserProvider>
          <CommentProvider>
            <NotificationProvider>
              <ABTestProvider>
                <I18nextProvider i18n={i18n}>
                  {children}
                </I18nextProvider>
              </ABTestProvider>
            </NotificationProvider>
          </CommentProvider>
        </UserProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: MockProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
