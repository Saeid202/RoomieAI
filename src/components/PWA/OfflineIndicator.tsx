import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    if (!navigator.onLine) {
      setIsOffline(true);
      setWasOffline(true);
    }

    const handleOnline = () => {
      setIsOffline(false);
      // Show "back online" message briefly, then hide
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything when online
  if (!isOffline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-center gap-2
        px-4 py-2 text-sm font-medium
        transition-all duration-300
        ${isOffline
          ? 'bg-amber-500 text-white'
          : 'bg-green-500 text-white'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4" />
      {isOffline ? (
        <span>You're offline. Some features may be limited.</span>
      ) : (
        <span>You're back online!</span>
      )}
    </div>
  );
}