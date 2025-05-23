import type React from 'react';
import { useState, useEffect } from 'react';
import { trackEvent } from './Analytics';
import { useTranslation } from 'react-i18next';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user has already dismissed or installed the app
    const hasPromptBeenShown = localStorage.getItem('pwaPromptDismissed');

    // Define event handlers explicitly so we can remove the same function
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();

      // Stash the event so it can be triggered later
      setDeferredPrompt(e);

      // Show the prompt if it hasn't been dismissed before
      if (!hasPromptBeenShown) {
        setShowPrompt(true);
        trackEvent('PWA', 'Install Prompt Shown');
      }
    };

    const handleAppInstalled = () => {
      // Hide the prompt
      setShowPrompt(false);
      // Log installation to analytics
      trackEvent('PWA', 'Installed');
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Save that the app was installed
      localStorage.setItem('pwaInstalled', 'true');
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if it's been at least 14 days since the user dismissed the prompt
    if (hasPromptBeenShown) {
      const dismissedDate = localStorage.getItem('pwaPromptDismissedDate');
      if (dismissedDate) {
        const dismissedTime = new Date(dismissedDate).getTime();
        const now = new Date().getTime();
        const fourteenDays = 14 * 24 * 60 * 60 * 1000;

        // If it's been more than 14 days, allow showing the prompt again
        if (now - dismissedTime > fourteenDays) {
          localStorage.removeItem('pwaPromptDismissed');
          localStorage.removeItem('pwaPromptDismissedDate');
        }
      }
    }

    return () => {
      // Remove the same event handlers that were added
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    // Hide the prompt
    setShowPrompt(false);

    // Show the install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          trackEvent('PWA', 'Install Accepted');
        } else {
          trackEvent('PWA', 'Install Rejected');
          // Save that the user dismissed the prompt
          localStorage.setItem('pwaPromptDismissed', 'true');
          localStorage.setItem('pwaPromptDismissedDate', new Date().toISOString());
        }
        // Clear the deferredPrompt
        setDeferredPrompt(null);
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    trackEvent('PWA', 'Install Prompt Dismissed');
    // Save that the user dismissed the prompt
    localStorage.setItem('pwaPromptDismissed', 'true');
    localStorage.setItem('pwaPromptDismissedDate', new Date().toISOString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 border-t border-gray-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <img src="/pwa-192x192.png" alt="App Icon" className="w-10 h-10 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">{t('pwa.installTitle', 'Install Our App')}</h3>
            <p className="text-sm text-gray-600">{t('pwa.installDescription', 'Add to your home screen for a better experience')}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            {t('pwa.notNow', 'Not Now')}
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
          >
            {t('pwa.install', 'Install')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;