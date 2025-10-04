import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove experimental.turbo as it's deprecated
  // Use webpack instead of turbopack
  webpack: (config) => {
    return config;
  },
  // Set outputFileTracingRoot to silence the lockfile warning
  outputFileTracingRoot: 'C:\\Users\\JustineDevs\\Downloads\\LazAI\\DataStreamNFT',
};

export default nextConfig;