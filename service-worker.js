// Der Service Worker speichert die wichtigsten App-Dateien für die Offline-Nutzung.
const CACHE_NAME = "fitapp-static-v5";
const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Beim Installieren werden alle wichtigen lokalen Dateien vorgeladen.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// Alte Cache-Versionen werden nach einem Update entfernt.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Zuerst wird der Cache geprüft. Fehlende Dateien werden aus dem Netz geladen.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(function (networkResponse) {
          const requestHost = new URL(event.request.url).hostname;
          const isLibraryRequest = requestHost === "unpkg.com";
          const shouldCacheResponse =
            (networkResponse.ok && event.request.url.startsWith(self.location.origin)) ||
            (isLibraryRequest && (networkResponse.ok || networkResponse.type === "opaque"));

          if (shouldCacheResponse) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseCopy);
            });
          }

          return networkResponse;
        })
        .catch(function () {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }

          return Response.error();
        });
    })
  );
});

// Push-Nachrichten enthalten bewusst nur eine Termin-ID und keinen Einnahmenamen.
self.addEventListener("push", function (event) {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (error) {
      payload = {};
    }
  }

  const occurrenceId = typeof payload.occurrenceId === "string"
    ? payload.occurrenceId
    : "";
  const options = {
    body: "Es ist Zeit für deine Einnahme",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: occurrenceId ? `fitapp-intake-${occurrenceId}` : "fitapp-intake-reminder",
    data: {
      occurrenceId: occurrenceId
    }
  };

  // Nicht unterstützte Notification Actions werden vom Browser ignoriert.
  if (self.Notification && "actions" in self.Notification.prototype) {
    options.actions = [
      {
        action: "open-intake",
        title: "OK"
      }
    ];
  }

  event.waitUntil(self.registration.showNotification("FitApp", options));
});

// Eine Benachrichtigung bestätigt niemals automatisch eine tatsächliche Einnahme.
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const occurrenceId = event.notification.data && typeof event.notification.data.occurrenceId === "string"
    ? event.notification.data.occurrenceId
    : "";
  const targetUrl = new URL("./index.html", self.registration.scope);

  if (occurrenceId) {
    targetUrl.searchParams.set("intake", occurrenceId);
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        const client = clientList[0];

        if ("navigate" in client) {
          return client.navigate(targetUrl.href).then(function () {
            return client.focus();
          });
        }

        return client.focus();
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl.href);
      }

      return undefined;
    })
  );
});
