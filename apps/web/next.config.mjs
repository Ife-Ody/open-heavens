import { withContentlayer } from 'next-contentlayer'
/** @type {import('next').NextConfig} */

const nextConfig = { reactStrictMode: true, swcMinify: true, transpilePackages: ["@repo/ui"], }

export default withContentlayer(nextConfig)
