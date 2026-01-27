/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Serve nordic static files at root paths
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
      {
        source: '/about.html',
        destination: '/nordic/about.html',
      },
      {
        source: '/contact.html',
        destination: '/nordic/contact.html',
      },
      {
        source: '/gallery.html',
        destination: '/nordic/gallery.html',
      },
      {
        source: '/services.html',
        destination: '/nordic/services.html',
      },
      {
        source: '/',
        destination: '/nordic/index.html',
      },
    ];
  },
}

module.exports = nextConfig

