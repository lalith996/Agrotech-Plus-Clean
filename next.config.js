/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'agrotrack-assets.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

const withNextConfig = {
  ...nextConfig,
  serverExternalPackages: ["sharp", "stripe", "@elastic/elasticsearch"],
};

module.exports = withNextConfig;