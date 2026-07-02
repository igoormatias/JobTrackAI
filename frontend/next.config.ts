import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: evita que o Next.js use a raiz do repo e quebre Tailwind/content paths
  outputFileTracingRoot: frontendRoot,
};

export default nextConfig;
