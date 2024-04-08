const { withContentlayer } = require('next-contentlayer');
/** @type {import('next').NextConfig} */

const nextConfig = { reactStrictMode: true, swcMinify: true, transpilePackages: ["@repo/ui"], };

module.exports = withContentlayer(nextConfig);
