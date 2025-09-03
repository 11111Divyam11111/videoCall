import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https', // The protocol for the image URL
        hostname: 'img.clerk.com', // The domain from which you want to load images
        pathname: '/**', // Optional: You can specify a path if needed
      },
    ],
  },
};

export default nextConfig;
