import type { NextConfig } from "next";

// Allow next/image to load uploads served by your backend.
// Set NEXT_PUBLIC_API_URL in Vercel (e.g. https://api.yourdomain.com) and the
// host is whitelisted automatically — no code change needed when you deploy.
type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const apiPatterns: RemotePattern[] = [];
try {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const u = new URL(process.env.NEXT_PUBLIC_API_URL);
    apiPatterns.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/uploads/**",
    });
  }
} catch {
  /* invalid NEXT_PUBLIC_API_URL — ignore */
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // ── Local development ──────────────────────────────────
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      // ── Production (from NEXT_PUBLIC_API_URL) ──────────────
      ...apiPatterns,
    ],
  },
};

export default nextConfig;
