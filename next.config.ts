import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
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
