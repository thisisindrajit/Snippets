/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", port: "", pathname: "**" },
      { protocol: "http", hostname: "**", port: "", pathname: "**" },
    ],
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;
