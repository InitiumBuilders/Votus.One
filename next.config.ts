import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      // The oracle answers to every name it is called by.
      // (Casing variants like /Nat-Future-Insight are handled in middleware.ts —
      // redirect sources match case-insensitively, so listing them here loops.)
      { source: "/natfutureinsight", destination: "/nat-future-insight", permanent: true },
      { source: "/nat-future", destination: "/nat-future-insight", permanent: true },
      { source: "/oracle", destination: "/nat-future-insight", permanent: true },
      { source: "/natalie", destination: "/nat-future-insight", permanent: true },
    ];
  },
};

export default nextConfig;
