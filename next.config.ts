import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
