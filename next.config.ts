import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname ?? process.cwd());

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
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
