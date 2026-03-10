import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // temporario
        source: '/login',
        destination: '/',
        permanent: true, 
      },
    ];
  },
};

export default nextConfig;
