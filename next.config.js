const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    // Remove if not using Server Components
    serverComponentsExternalPackages: ['mongodb'],
  },
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  
  /**
   * Route Aliases / Redirects
   * 
   * These redirects provide backward-compatible URL aliases.
   * They execute at the edge (before page rendering) for best performance.
   * Works in both development and production.
   * 
   * - /go-live -> /live (alias for Go Live feature)
   * - /chat-with-ais -> /ai (alias for AI chat feature)
   */
  async redirects() {
    return [
      {
        source: '/go-live',
        destination: '/live',
        permanent: true, // 308 redirect - SEO friendly, cached by browsers
      },
      {
        source: '/chat-with-ais',
        destination: '/ai',
        permanent: true,
      },
    ];
  },
  
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
          { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGINS || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
