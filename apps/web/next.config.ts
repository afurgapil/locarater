import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cyzbcfsevwcshsrkzrcv.supabase.co",
      "ruktayxteaitzyqadwsg.supabase.co",
      "localhost",
      "127.0.0.1",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cyzbcfsevwcshsrkzrcv.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "ruktayxteaitzyqadwsg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
