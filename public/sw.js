// Empty service worker to prevent 404 errors
// This file exists to satisfy browser requests for a service worker
// but doesn't actually do anything

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately
  event.waitUntil(self.clients.claim());
});

// No fetch event handler - this service worker doesn't cache anything

