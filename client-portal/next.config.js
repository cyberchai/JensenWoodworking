/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Rewrite root to index route handler
      {
        source: '/',
        destination: '/index',
      },
      // Serve nordic static assets at root paths
      // HTML files are handled by route handlers (app/*.html/route.ts and app/index/route.ts)
      {
        source: '/css/:path*',
        destination: '/nordic/css/:path*',
      },
      {
        source: '/js/:path*',
        destination: '/nordic/js/:path*',
      },
      {
        source: '/images/:path*',
        destination: '/nordic/images/:path*',
      },
      {
        source: '/fonts/:path*',
        destination: '/nordic/fonts/:path*',
      },
    ];
  },
}

module.exports = nextConfig

