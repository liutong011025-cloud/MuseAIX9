/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: '**.fal.ai',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'museaiwrite.eduhk.hk',
      },
      {
        protocol: 'https',
        hostname: 'museaiwrite.eduhk.hk',
      },
    ],
  },
}

export default nextConfig
