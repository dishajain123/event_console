import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1").replace(/\/$/, "");
    return [{ source: "/api/backend/:path*", destination: `${backend}/:path*` }];
  },
  allowedDevOrigins: ["192.168.1.101"],
};

export default nextConfig;
