// ============================================
// CRISISNET - SERVICE WORKER
// Offline Support & Push Notifications
// ============================================

const CACHE_NAME = 'crisisnet-v1'
const OFFLINE_URL = '/offline'

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return
  
  // Skip API requests
  if (event.request.url.includes('/api/')) return
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache
        return cachedResponse
      }
      
      // Fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
    })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received')
  
  let data = { title: 'CrisisNet Alert', body: 'New emergency message', icon: '/icons/icon-192x192.png' }
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'crisisnet-notification',
    renotify: true,
    requireInteraction: data.priority === 'critical',
    actions: [
      { action: 'view', title: 'View Message' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: data.url || '/',
      messageId: data.messageId
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event.action)
  
  event.notification.close()
  
  if (event.action === 'dismiss') return
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data: event.notification.data })
          return client.focus()
        }
      }
      // Open new window
      return clients.openWindow(urlToOpen)
    })
  )
})

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag)
  
  if (event.tag === 'send-message') {
    event.waitUntil(sendPendingMessages())
  }
})

// Send pending messages when online
async function sendPendingMessages() {
  try {
    // Get pending messages from IndexedDB
    const db = await openDatabase()
    const messages = await getPendingMessages(db)
    
    for (const message of messages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
        
        if (response.ok) {
          await markMessageSent(db, message.id)
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to send message:', error)
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error)
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CrisisNetDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' })
      }
    }
  })
}

function getPendingMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMessages'], 'readonly')
    const store = transaction.objectStore('pendingMessages')
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function markMessageSent(db, messageId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingMessages'], 'readwrite')
    const store = transaction.objectStore('pendingMessages')
    const request = store.delete(messageId)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

console.log('[ServiceWorker] CrisisNet Service Worker loaded')
