/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/utils"],
};

module.exports = nextConfig;
