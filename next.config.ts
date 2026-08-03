import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Google AdSense domains included so ads work once NEXT_PUBLIC_ADSENSE_CLIENT is set
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com",
      "style-src 'self' 'unsafe-inline'",
      // OpenStreetMap tile servers and unpkg/cdnjs serve the Leaflet map tiles
      // and default marker icons — without these the property map renders blank.
      "img-src 'self' data: blob: https://images.unsplash.com https://i.pravatar.cc https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://unpkg.com https://cdnjs.cloudflare.com https://*.basemaps.cartocdn.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com",
      "font-src 'self'",
      "connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google https://csi.gstatic.com",
      "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old dashboard link pointed here before the tools section existed
      { source: '/mortgage-calculator', destination: '/tools/mortgage-calculator', permanent: true },
      { source: '/rental-dashboard', destination: '/post-rent', permanent: false },

      // --- Legacy flat category pages -> the purpose-first tree ------------
      // Exact sources only: config redirects run before routing, so a
      // wildcard here would shadow real routes.
      { source: '/buy', destination: '/residential-for-sale', permanent: true },
      { source: '/rent', destination: '/residential-for-rent', permanent: true },
      { source: '/plots', destination: '/for-sale/plot', permanent: true },
      { source: '/commercial', destination: '/commercial-for-sale', permanent: true },
      { source: '/fsbo', destination: '/owner', permanent: true },
      { source: '/rent-by-owner', destination: '/owner', permanent: true },

      // --- Type-slug aliases ----------------------------------------------
      // The in-route parser also handles these, but catching them here saves
      // a render and keeps the canonical form unambiguous.
      { source: '/for-sale/apartment/:rest*', destination: '/for-sale/flat/:rest*', permanent: true },
      { source: '/for-rent/apartment/:rest*', destination: '/for-rent/flat/:rest*', permanent: true },
      { source: '/for-sale/homes/:rest*', destination: '/for-sale/house/:rest*', permanent: true },
      { source: '/for-rent/homes/:rest*', destination: '/for-rent/house/:rest*', permanent: true },
      { source: '/for-sale/plots/:rest*', destination: '/for-sale/plot/:rest*', permanent: true },
      { source: '/for-sale/residential-plot/:rest*', destination: '/for-sale/plot/:rest*', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;