import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from './NotificationContext';
import { trackEvent } from '../components/Analytics';

// Mock trackEvent
vi.mock('../components/Analytics', () => ({
  trackEvent: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component that uses the notifications context
function TestComponent() {
  const { isSubscribed, subscription, subscribe, unsubscribe, updatePreferences } = useNotifications();

  return (
    <div>
      <div data-testid="subscription-status">{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</div>
      {subscription && (
        <div data-testid="email">{subscription.email}</div>
      )}
      <button
        data-testid="subscribe-button"
        onClick={() => subscribe('test@example.com')}
      >
        Subscribe
      </button>
      <button
        data-testid="unsubscribe-button"
        onClick={unsubscribe}
      >
        Unsubscribe
      </button>
      <button
        data-testid="update-button"
        onClick={() => updatePreferences({ dailyDeals: false })}
      >
        Update Preferences
      </button>
    </div>
  );
}

describe('NotificationContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides subscription status and methods', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Initially not subscribed
    expect(screen.getByTestId('subscription-status')).toHaveTextContent('Not Subscribed');
    // UI elements are available
    expect(screen.getByTestId('subscribe-button')).toBeInTheDocument();
    expect(screen.getByTestId('unsubscribe-button')).toBeInTheDocument();
    expect(screen.getByTestId('update-button')).toBeInTheDocument();
  });

  it('allows subscribing to notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Subscribe
    await act(async () => {
      screen.getByTestId('subscribe-button').click();
    });

    // Should now be subscribed
    await waitFor(() => {
      expect(screen.getByTestId('subscription-status')).toHaveTextContent('Subscribed');
      expect(screen.getByTestId('email')).toHaveTextContent('test@example.com');
    });

    // Should track the event
    expect(trackEvent).toHaveBeenCalledWith('Notifications', 'Subscribe');

    // Should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('allows unsubscribing from notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // First subscribe
    await act(async () => {
      screen.getByTestId('subscribe-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('subscription-status')).toHaveTextContent('Subscribed');
    });

    // Then unsubscribe
    await act(async () => {
      screen.getByTestId('unsubscribe-button').click();
    });

    // Should no longer be subscribed
    await waitFor(() => {
      expect(screen.getByTestId('subscription-status')).toHaveTextContent('Not Subscribed');
    });

    // Should track the event
    expect(trackEvent).toHaveBeenCalledWith('Notifications', 'Unsubscribe');

    // Should remove from localStorage
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('notification_subscription');
  });

  it('allows updating preferences', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // First subscribe
    await act(async () => {
      screen.getByTestId('subscribe-button').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('subscription-status')).toHaveTextContent('Subscribed');
    });

    // Reset mocks to check if they're called again
    vi.clearAllMocks();

    // Update preferences
    await act(async () => {
      screen.getByTestId('update-button').click();
    });

    // Should still be subscribed
    expect(screen.getByTestId('subscription-status')).toHaveTextContent('Subscribed');

    // Should track the event
    expect(trackEvent).toHaveBeenCalledWith('Notifications', 'Update Preferences');

    // Should update localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });
});
