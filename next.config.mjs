/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.BUILD_OUTPUT_DIR || ".next",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
