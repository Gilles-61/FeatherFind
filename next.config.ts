/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic modules from server-side bundle
    if (isServer) {
      config.externals.push('@opentelemetry/exporter-jaeger', '@genkit-ai/firebase');
    }
    return config;
  },
};

export default nextConfig;
