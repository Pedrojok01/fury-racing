/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development" ? false : true,
});

const nextConfig = {
  reactStrictMode: false, // Set to 'false' during Babylon development. Set to 'true' otherwise.
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
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

module.exports = withPWA(nextConfig);
