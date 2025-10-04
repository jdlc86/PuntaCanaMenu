// Service Worker for Push Notifications
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installing...")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activating...")
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event)

  const data = event.data ? event.data.json() : {}
  const title = data.title || "Sabores Caribeños"
  const options = {
    body: data.body || "Tienes una nueva notificación",
    icon: "/LOGO.png",
    badge: "/LOGO.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event)
  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus()
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    }),
  )
})
