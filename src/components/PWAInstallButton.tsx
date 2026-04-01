import { useState, useEffect } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { PWAReinstallModal } from './PWAReinstallModal';
import { pwaStorageManager } from '@/utils/pwaStorageManager';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showReinstallModal, setShowReinstallModal] = useState(false);
  const [installedOrigin, setInstalledOrigin] = useState<string | null>(null);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandaloneMode = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);

      if (standalone) {
        pwaStorageManager.markAsStandalone();
      }
    };

    checkStandaloneMode();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      pwaStorageManager.markAsInstalled();
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleDisplayModeChange = () => {
      checkStandaloneMode();
    };

    // Check if app was previously installed
    const state = pwaStorageManager.getInstallationState();
    if (state.state === 'installed' || state.state === 'running_standalone') {
      setIsInstalled(true);
      setInstalledOrigin(state.installedOrigin);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    // Listen for visibility changes to detect if app was uninstalled while in background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStandaloneMode();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    pwaStorageManager.incrementInstallAttempts();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      pwaStorageManager.markAsInstalled();
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleReinstallClick = () => {
    setShowReinstallModal(true);
  };

  // Case 1: Running as standalone app - hide button
  if (isStandalone) {
    return null;
  }

  // Case 2: Can install (beforeinstallprompt available) - show "Install App"
  if (deferredPrompt) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-700 hover:via-purple-600 hover:to-orange-600 text-white rounded-lg transition-all font-semibold text-sm hover:shadow-lg"
          title="Install HomieAI app on your device for offline access"
        >
          <Download size={18} />
          Install App
        </button>
        <PWAReinstallModal
          isOpen={showReinstallModal}
          onClose={() => setShowReinstallModal(false)}
          installedOrigin={installedOrigin || undefined}
        />
      </>
    );
  }

  // Case 3: Installed but not running as standalone - show "Reinstall App"
  if (isInstalled && !isStandalone) {
    return (
      <>
        <button
          onClick={handleReinstallClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-700 hover:via-purple-600 hover:to-orange-600 text-white rounded-lg transition-all font-semibold text-sm hover:shadow-lg"
          title="Reinstall HomieAI app on your device"
        >
          <RotateCcw size={18} />
          Reinstall App
        </button>
        <PWAReinstallModal
          isOpen={showReinstallModal}
          onClose={() => setShowReinstallModal(false)}
          installedOrigin={installedOrigin || undefined}
        />
      </>
    );
  }

  // Case 4: Not installed and no prompt available - hide button
  return null;
};
