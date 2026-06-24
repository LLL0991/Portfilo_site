import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingExcludes: {
    "/api/stylize": ["./public/**/*"],
    "/api/stylize/download": ["./public/**/*"],
  },
  outputFileTracingIncludes: {
    "/api/stylize": ["./public/images/home/stylize/styles/**/*"],
  },
};

export default withNextIntl(nextConfig);
