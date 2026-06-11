import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    qualities: [75, 85, 90],
  },
  experimental: {
    // Barrel-file optimization: tree-shakes icon libraries and motion so only
    // the icons/exports actually used end up in the bundle.
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "@phosphor-icons/react",
      "react-qr-code",
    ],
  },
  turbopack: {
    root: ".",
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "matin-m0",
  project: "svsit-site",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
