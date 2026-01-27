/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Serve nordic static assets at root paths
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

