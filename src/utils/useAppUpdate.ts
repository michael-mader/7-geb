import { useState, useEffect, useCallback, useRef } from 'react';

export const CURRENT_CLIENT_VERSION = '1.1.0';
export const CURRENT_AVATAR_VERSION = 'v2';

export interface VersionInfo {
  version: string;
  avatarVersion?: string;
  updatedAt?: string;
}

/**
 * Force a hard reload on mobile/desktop by purging caches and appending a cache-busting query parameter.
 */
export async function forceHardReload(): Promise<void> {
  try {
    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
    }
  } catch (err) {
    console.warn('Could not clear CacheStorage:', err);
  }

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch (err) {
    console.warn('Could not unregister service worker:', err);
  }

  // Reload page bypassing cache with timestamp
  const targetUrl = new URL(window.location.href);
  targetUrl.searchParams.set('_update', Date.now().toString());
  window.location.href = targetUrl.toString();
}

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const checkedRef = useRef<boolean>(false);

  const checkForUpdate = useCallback(async (manual: boolean = false) => {
    setIsChecking(true);
    try {
      // Use cache-busting query param & cache: 'no-store' to guarantee fresh response
      const res = await fetch(`./version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (res.ok) {
        const data: VersionInfo = await res.json();
        const storedVersion = localStorage.getItem('schnitzeljagd_app_version');
        const storedAvatarVersion = localStorage.getItem('schnitzeljagd_avatar_version');

        const hasNewVersion =
          (data.version && data.version !== CURRENT_CLIENT_VERSION) ||
          (data.avatarVersion && data.avatarVersion !== CURRENT_AVATAR_VERSION) ||
          (storedVersion && storedVersion !== data.version) ||
          (storedAvatarVersion && storedAvatarVersion !== data.avatarVersion);

        if (hasNewVersion) {
          setUpdateAvailable(true);
        } else if (manual) {
          // If manually checked and up to date, store current versions
          localStorage.setItem('schnitzeljagd_app_version', CURRENT_CLIENT_VERSION);
          localStorage.setItem('schnitzeljagd_avatar_version', CURRENT_AVATAR_VERSION);
        }
      }
    } catch (e) {
      console.warn('Version check skipped/failed:', e);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, []);

  // Initial check & visibilitychange listeners (e.g. smartphone unlocked or browser switched back)
  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      checkForUpdate(false);
    }

    // Check on tab focus or when user returns to phone screen
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate(false);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Periodic check every 45 seconds
    const interval = setInterval(() => {
      checkForUpdate(false);
    }, 45000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkForUpdate]);

  const applyUpdate = useCallback(() => {
    localStorage.setItem('schnitzeljagd_app_version', CURRENT_CLIENT_VERSION);
    localStorage.setItem('schnitzeljagd_avatar_version', CURRENT_AVATAR_VERSION);
    forceHardReload();
  }, []);

  return {
    updateAvailable,
    isChecking,
    lastChecked,
    checkForUpdate,
    applyUpdate,
    forceHardReload,
  };
}
