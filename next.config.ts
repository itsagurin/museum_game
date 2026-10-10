import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', images: { unoptimized: true }, devIndicators: false, allowedDevOrigins: ['127.0.0.1'] };
export default config;
