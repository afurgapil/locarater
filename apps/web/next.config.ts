import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cyzbcfsevwcshsrkzrcv.supabase.co",
      "ruktayxteaitzyqadwsg.supabase.co",
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
    ],
  },
};

export default nextConfig;
