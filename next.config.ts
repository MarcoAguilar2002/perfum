import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unennbcatzkeamcrqggy.supabase.co', // Your specific Supabase project hostname
        port: '',
        pathname: '/storage/v1/object/public/**', // Matches Supabase public bucket paths (adjust if your bucket is private)
      },
      // Or for all Supabase projects (less specific but broader):
      // {
      //   protocol: 'https',
      //   hostname: '*.supabase.co',
      //   port: '',
      //   pathname: '/storage/v1/object/public/**',
      // },
    ],
  },
};

export default nextConfig;
