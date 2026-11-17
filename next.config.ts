import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "true";
const basePath = pages ? "/midhun-krishnan-3d-portfolio" : "";

const nextConfig: NextConfig = {
  ...(pages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
