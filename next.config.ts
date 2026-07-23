import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray package-lock.json in a parent dir was making
  // Turbopack infer the wrong root. This project's own directory is the root.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
