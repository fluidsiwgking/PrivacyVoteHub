import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || "";
const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // 在静态导出环境下开启 export
  ...(isStatic ? { output: "export" as const } : {}),
  // GitHub Pages 需要关闭图片优化
  images: { unoptimized: true },
  // 自动支持 basePath 与静态资源前缀
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
      }
    : { trailingSlash: true }),
};

export default nextConfig;




