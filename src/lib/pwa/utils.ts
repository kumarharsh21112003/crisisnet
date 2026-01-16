// ============================================
// CRISISNET - PWA UTILITIES
// Service Worker Registration & Push Notifications
// ============================================

/**
 * Register service worker for offline support
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    
    console.log('ServiceWorker registered:', registration.scope)
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content available, refresh to update')
          }
        })
      }
    })
    
    return registration
  } catch (error) {
    console.error('ServiceWorker registration failed:', error)
    return null
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return 'denied'
  }
  
  const permission = await Notification.requestPermission()
  console.log('Notification permission:', permission)
  return permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  if (!registration.pushManager) {
    console.log('Push not supported')
    return null
  }
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    })
    
    console.log('Push subscription:', subscription)
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

/**
 * Show local notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('Cannot show notification')
    return
  }
  
  new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    ...options
  })
}

/**
 * Check if app is installed (PWA)
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check display-mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  
  // iOS Safari
  if ((window.navigator as any).standalone === true) {
    return true
  }
  
  return false
}

/**
 * Prompt to install app
 */
let deferredPrompt: any = null

export function setupInstallPrompt(): void {
  if (typeof window === 'undefined') return
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    console.log('Install prompt ready')
  })
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('No install prompt available')
    return false
  }
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  console.log('Install outcome:', outcome)
  deferredPrompt = null
  
  return outcome === 'accepted'
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Add online/offline listeners
 */
export function addConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

/**
 * Store data in IndexedDB
 */
export async function storeOfflineData(
  storeName: string,
  data: any
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CrisisNetDB', 1)
    
    request.onerror = () => reject(request.error)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' })
      }
    }
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      store.put(data)
      
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
  })
}

/**
 * Get offline data from IndexedDB
 */
export async function getOfflineData<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CrisisNetDB', 1)
    
    request.onerror = () => reject(request.error)
    
    request.onsuccess = () => {
      const db = request.result
      
      if (!db.objectStoreNames.contains(storeName)) {
        resolve(null)
        return
      }
      
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const getRequest = store.get(id)
      
      getRequest.onsuccess = () => resolve(getRequest.result || null)
      getRequest.onerror = () => reject(getRequest.error)
    }
  })
}
