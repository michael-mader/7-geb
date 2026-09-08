import { useState, useEffect, useCallback, useRef } from 'react';

export const CURRENT_CLIENT_VERSION = '1.1.0';
export const CURRENT_AVATAR_VERSION = 'v2';

export interface VersionInfo {
  buildId?: string;
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
  const latestBuildIdRef = useRef<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    // In local development mode, don't trigger the update banner
    if (import.meta.env.DEV) {
      setUpdateAvailable(false);
      return;
    }

    const runningBuildId = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : '';
    if (!runningBuildId || runningBuildId === 'dev') {
      setUpdateAvailable(false);
      return;
    }

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
        latestBuildIdRef.current = data.buildId || null;

        // If the server's buildId is different from the currently running bundle's buildId
        const isDifferentBuild = Boolean(
          data.buildId &&
          data.buildId !== 'dev' &&
          data.buildId !== runningBuildId
        );

        const dismissedBuild = sessionStorage.getItem('schnitzeljagd_dismissed_build');
        if (isDifferentBuild && dismissedBuild !== data.buildId) {
          setUpdateAvailable(true);
        } else {
          setUpdateAvailable(false);
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
      checkForUpdate();
    }

    // Check on tab focus or when user returns to phone screen
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Periodic check every 60 seconds
    const interval = setInterval(() => {
      checkForUpdate();
    }, 60000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [checkForUpdate]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    if (latestBuildIdRef.current) {
      sessionStorage.setItem('schnitzeljagd_dismissed_build', latestBuildIdRef.current);
    }
  }, []);

  const applyUpdate = useCallback(() => {
    setUpdateAvailable(false);
    forceHardReload();
  }, []);

  return {
    updateAvailable,
    isChecking,
    lastChecked,
    checkForUpdate,
    dismissUpdate,
    applyUpdate,
    forceHardReload,
  };
}
