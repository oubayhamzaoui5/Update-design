import type { NextConfig } from "next";

const pbUrl = process.env.NEXT_PUBLIC_PB_URL;
const pbOrigin = (() => {
  if (!pbUrl) return ""
  try { return new URL(pbUrl).origin } catch { return "" }
})()

const csp = [
  "default-src 'self'",
  // Next.js App Router requires 'unsafe-inline' for hydration scripts;
  // 'unsafe-eval' is only needed in development (hot reload).
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // TailwindCSS uses inline styles
  "style-src 'self' 'unsafe-inline'",
  // next/font/google self-hosts fonts — no external font requests in production
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "img-src 'self' data: blob: https://images.unsplash.com https://www.sotuma.tn",
    pbOrigin,
  ].filter(Boolean).join(" "),
  [
    "connect-src 'self' https://api.stripe.com",
    pbOrigin,
  ].filter(Boolean).join(" "),
  // Google Maps embed on the home page
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")
type RemoteImagePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

function buildPattern(url: string): RemoteImagePattern | null {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol === "https:" ? "https" : "http",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: "/api/files/**",
    };
  } catch {
    return null;
  }
}

const remotePatterns: RemoteImagePattern[] = [];
const seen = new Set<string>();

function addPattern(pattern: RemoteImagePattern | null) {
  if (!pattern) return;
  const key = `${pattern.protocol}|${pattern.hostname}|${pattern.port ?? ""}|${pattern.pathname}`;
  if (seen.has(key)) return;
  seen.add(key);
  remotePatterns.push(pattern);
}

addPattern(buildPattern("http://127.0.0.1:8090"));
addPattern(buildPattern("http://localhost:8090"));
addPattern(buildPattern("http://51.68.124.47:8099"));
if (pbUrl) addPattern(buildPattern(pbUrl));
addPattern({ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" });
addPattern({ protocol: "https", hostname: "www.sotuma.tn", pathname: "/web/image/**" });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    remotePatterns,
  },
  async rewrites() {
    return [
      // Legacy French accent variant
      {
        source: '/Nouveaut\u00E9s',
        destination: '/boutique?sort=latest',
      },
    ]
  },
  async redirects() {
    return [
      // Backward-compat: old English URLs -> current French/catalogue routes.
      { source: '/shop/:slug*', destination: '/boutique/:slug*', permanent: true },
      { source: '/product/:slug*', destination: '/produit/:slug*', permanent: true },
      { source: '/checkout/confirmation', destination: '/paiement/confirmation', permanent: true },
      { source: '/checkout', destination: '/paiement', permanent: true },
      { source: '/orders', destination: '/commandes', permanent: true },
      { source: '/login', destination: '/connexion', permanent: true },
      { source: '/register', destination: '/inscription', permanent: true },
      { source: '/about', destination: '/a-propos', permanent: true },
      { source: '/account', destination: '/compte', permanent: true },
      { source: '/reset-password', destination: '/reinitialisation-mot-de-passe', permanent: true },
      { source: '/new-arrivals', destination: '/boutique?sort=latest', permanent: true },
      { source: '/promotions', destination: '/boutique?promotions=1', permanent: true },
      { source: '/wishlist', destination: '/boutique?wishlist=1', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
