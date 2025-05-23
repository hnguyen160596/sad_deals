import React, { createContext, useState, useContext, useEffect } from 'react';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  deferredPrompt: any; // BeforeInstallPromptEvent is not a standard type yet
  showInstallPrompt: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  deferredPrompt: null,
  showInstallPrompt: async () => {}
});

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: !!deferredPrompt,
        isInstalled,
        deferredPrompt,
        showInstallPrompt
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);
