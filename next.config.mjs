/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.BUILD_OUTPUT_DIR ? { distDir: process.env.BUILD_OUTPUT_DIR } : {}),
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
