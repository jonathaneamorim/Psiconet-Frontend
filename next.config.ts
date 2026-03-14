import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // temporario
        source: '/pagina-source',
        destination: '/pagina-destino',
        permanent: true, 
      },
    ];
  },
};

export default nextConfig;
