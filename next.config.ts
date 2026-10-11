import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const localNetworkAddresses = Object.values(networkInterfaces()).flatMap(
  (addresses) => (addresses ?? [])
    .filter((address) => !address.internal && address.family === "IPv4")
    .map((address) => address.address),
);

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", ...localNetworkAddresses],
};

export default nextConfig;
