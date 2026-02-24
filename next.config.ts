import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // This path covers the manifest and all common icon formats.
        source: '/:path*(webmanifest|ico|png|svg|xml|json)',
        headers: [
          {
            key: 'Cache-Control',
            // This header tells the browser to always check with the server for a new version.
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
