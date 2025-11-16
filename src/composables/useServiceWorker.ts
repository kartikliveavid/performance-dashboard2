import { ref, onMounted } from 'vue';

export function useServiceWorker() {
  const isSupported = ref(false);
  const isRegistered = ref(false);
  const registration = ref<ServiceWorkerRegistration | null>(null);

  const register = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers are not supported');
      return;
    }

    isSupported.value = true;

    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      registration.value = reg;
      isRegistered.value = true;

      console.log('[Service Worker] Registered:', reg.scope);

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Service Worker] New version available');
              // Could show update notification here
            }
          });
        }
      });
    } catch (error) {
      console.error('[Service Worker] Registration failed:', error);
    }
  };

  const unregister = async () => {
    if (registration.value) {
      const success = await registration.value.unregister();
      if (success) {
        isRegistered.value = false;
        registration.value = null;
        console.log('[Service Worker] Unregistered');
      }
    }
  };

  const clearCache = async () => {
    if (registration.value) {
      // Send message to service worker to clear cache
      if (registration.value.active) {
        registration.value.active.postMessage({ type: 'CLEAR_CACHE' });
      }
    }
  };

  onMounted(() => {
    if ('serviceWorker' in navigator) {
      register();
    }
  });

  return {
    isSupported,
    isRegistered,
    registration,
    register,
    unregister,
    clearCache,
  };
}





