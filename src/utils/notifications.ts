
/**
 * Utility to send notifications in a cross-platform way.
 * On mobile/PWA, it uses ServiceWorkerRegistration.showNotification() to avoid the "Illegal constructor" error.
 * On desktop, it falls back to the standard Notification constructor if service worker is not ready.
 */
export const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    try {
        // Try using Service Worker registration first (standard for modern PWAs and required on many mobile browsers)
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.showNotification) {
                await registration.showNotification(title, options);
                return;
            }
        }

        // Fallback to standard constructor (may still fail on some mobile browsers, but we caught it in try/catch)
        new Notification(title, options);
    } catch (error) {
        console.error('Failed to send notification:', error);

        // Final fallback: if showNotification failed or constructor failed, 
        // there's not much else we can do besides log it.
    }
};
