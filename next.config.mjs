import { createSecureHeaders } from "next-secure-headers";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "https:"],
              connectSrc: ["'self'"],
              frameAncestors: ["'self'"]
            }
          },
          forceHTTPSRedirect: [true, { maxAge: 63072000, includeSubDomains: true }],
          referrerPolicy: "strict-origin-when-cross-origin",
          xssProtection: "block-rendering"
        })
      }
    ];
  }
};

export default nextConfig;
