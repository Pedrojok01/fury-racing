/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Set to 'false' during Babylon development. Set to 'true' otherwise.
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

module.exports = nextConfig;
