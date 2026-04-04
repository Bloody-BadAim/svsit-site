import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname ?? process.cwd());

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    qualities: [75, 85, 90],
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
