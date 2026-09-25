/** @type {import('next').NextConfig} */

const prod = process.env.NODE_ENV === "production";

// `@coinbase/cdp-sdk` (pulled in by the Base Account connector via RainbowKit)
// dynamically imports these optional `@x402/*` packages without declaring them
// as dependencies. Nothing in this dApp reaches that code path, so they are
// aliased to an empty module to keep webpack from failing to resolve them.
const x402Stubs = [
  "@x402/core/client",
  "@x402/evm",
  "@x402/evm/exact/client",
  "@x402/evm/upto/client",
  "@x402/svm/exact/client",
];

const nextConfig = {
  reactStrictMode: prod, // Set to 'false' for Babylon development.
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    for (const id of x402Stubs) config.resolve.alias[id] = false;
    return config;
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.weatherapi.com",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
