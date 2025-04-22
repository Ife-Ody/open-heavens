/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/utils", "@repo/bible"],
  experimental: {
    reactCompiler: true,
    esmExternals: true,
  },
  async rewrites() {
    return [
      // for posthog proxy
      {
        source: "/_proxy/posthog/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/_proxy/posthog/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/_proxy/posthog/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
      // Redirect hymn URLs to hymns
      {
        source: "/hymn/:id",
        destination: "/hymns/:id",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig