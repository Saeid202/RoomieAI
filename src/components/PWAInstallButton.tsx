import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsInstalled(isStandalone);
      console.log('PWA Installation check - Standalone mode:', isStandalone);
    };

    checkInstallation();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowButton(true);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      console.log('appinstalled event fired');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowButton(false);
    };

    // Listen for when app is uninstalled (beforeinstallprompt fires again)
    const handleDisplayModeChange = () => {
      console.log('display-mode changed');
      checkInstallation();
    };

    // Add listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Log PWA support
    console.log('PWA Support:', {
      serviceWorker: 'serviceWorker' in navigator,
      manifest: document.querySelector('link[rel="manifest"]') !== null,
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        setIsInstalled(true);
      } else {
        console.log('PWA installation dismissed');
      }

      setDeferredPrompt(null);
      setShowButton(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  // Always show button for debugging (remove showButton check)
  if (!deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-700 hover:via-purple-600 hover:to-orange-600 text-white rounded-lg transition-all font-semibold text-sm hover:shadow-lg"
      title="Install HomieAI app on your device for offline access"
    >
      <Download size={18} />
      Install App
    </button>
  );
};
