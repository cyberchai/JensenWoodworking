/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Rewrite root to home route handler which serves nordic/index.html
      {
        source: '/',
        destination: '/home',
      },
      // Serve nordic static assets at root paths
      // HTML files are handled by route handlers (app/*.html/route.ts and app/home/route.ts)
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

