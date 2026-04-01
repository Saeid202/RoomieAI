/**
 * PWA Storage Manager
 * Handles localStorage operations for PWA installation state tracking
 */

export interface PWAInstallationState {
  state: 'not_installed' | 'installed' | 'running_standalone';
  installedOrigin: string | null;
  installedTimestamp: string | null;
  installAttempts: number;
}

const STORAGE_KEYS = {
  INSTALLATION_STATE: 'pwa_installation_state',
  INSTALLED_ORIGIN: 'pwa_installed_origin',
  INSTALLED_TIMESTAMP: 'pwa_installed_timestamp',
  INSTALL_ATTEMPTS: 'pwa_install_attempts',
};

export const pwaStorageManager = {
  /**
   * Get current installation state from localStorage
   */
  getInstallationState(): PWAInstallationState {
    return {
      state: (localStorage.getItem(STORAGE_KEYS.INSTALLATION_STATE) as any) || 'not_installed',
      installedOrigin: localStorage.getItem(STORAGE_KEYS.INSTALLED_ORIGIN),
      installedTimestamp: localStorage.getItem(STORAGE_KEYS.INSTALLED_TIMESTAMP),
      installAttempts: parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_ATTEMPTS) || '0', 10),
    };
  },

  /**
   * Mark app as installed
   */
  markAsInstalled(): void {
    localStorage.setItem(STORAGE_KEYS.INSTALLATION_STATE, 'installed');
    localStorage.setItem(STORAGE_KEYS.INSTALLED_ORIGIN, window.location.origin);
    localStorage.setItem(STORAGE_KEYS.INSTALLED_TIMESTAMP, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.INSTALL_ATTEMPTS, '0');
  },

  /**
   * Mark app as running in standalone mode
   */
  markAsStandalone(): void {
    localStorage.setItem(STORAGE_KEYS.INSTALLATION_STATE, 'running_standalone');
  },

  /**
   * Clear installation state (when app is uninstalled)
   */
  clearInstallationState(): void {
    localStorage.removeItem(STORAGE_KEYS.INSTALLATION_STATE);
    localStorage.removeItem(STORAGE_KEYS.INSTALLED_ORIGIN);
    localStorage.removeItem(STORAGE_KEYS.INSTALLED_TIMESTAMP);
    localStorage.removeItem(STORAGE_KEYS.INSTALL_ATTEMPTS);
  },

  /**
   * Increment install attempts counter
   */
  incrementInstallAttempts(): void {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.INSTALL_ATTEMPTS) || '0', 10);
    localStorage.setItem(STORAGE_KEYS.INSTALL_ATTEMPTS, String(current + 1));
  },

  /**
   * Check if app was installed from a different origin
   */
  isInstalledFromDifferentOrigin(): boolean {
    const state = this.getInstallationState();
    if (!state.installedOrigin) return false;
    return state.installedOrigin !== window.location.origin;
  },

  /**
   * Get the origin the app was installed from
   */
  getInstalledOrigin(): string | null {
    return localStorage.getItem(STORAGE_KEYS.INSTALLED_ORIGIN);
  },
};
