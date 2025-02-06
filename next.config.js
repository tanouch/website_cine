/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    reactCompiler: true,
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/website-cine.appspot.com/o/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "**",
      },
    ],
  },
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.leretroprojecteur.com" }],
      destination: "https://leretroprojecteur.com/:path*",
      permanent: true,
    },
    {
      source: "/details/:slug",
      destination: "/film/:slug",
      permanent: true,
    },
  ],
};

module.exports = nextConfig;
