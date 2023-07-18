/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ud-media.s3.us-east-2.amazonaws.com',
        port: '',
      },
    ],
  },
}

module.exports = nextConfig
