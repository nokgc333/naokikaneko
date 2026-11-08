import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security/security-headers";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
  async headers() {
    return [
      {
        source: "/((?!admin).*)",
        headers: buildSecurityHeaders({
          isDev: process.env.NODE_ENV !== "production",
        }),
      },
    ];
  },
};

export default nextConfig;
