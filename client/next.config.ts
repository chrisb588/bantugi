import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xbgmephbgyjtlunnvwlu.supabase.co',
        port: '', 
        pathname: '/storage/v1/object/public/report-images/**', 
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
