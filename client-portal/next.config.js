/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Note: Root rewrite is handled by vercel.json (Next.js App Router rewrites don't work for root -> route handler)
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

