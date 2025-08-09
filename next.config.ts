
/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   allowedDevOrigins: [
  //       "https://*.cloudworkstations.dev",
  //       "https://*.firebase.studio"
  //   ]
  // },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
      domains: [
        'images.unsplash.com',
      ],
  },
};

export default nextConfig;
