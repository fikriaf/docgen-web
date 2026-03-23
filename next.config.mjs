import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default withSentryConfig(nextConfig, {
  org: "your-org-name",
  project: "docgen-web",
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableServerWebpackPlugin: !!process.env.SENTRY_DISABLE_SERVER_WEBPACK_PLUGIN,
  webpack: (config, options) => {
    config.optimization.minimize = true;
    return config;
  },
});
