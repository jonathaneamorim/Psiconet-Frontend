import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Origem da API: as fotos de perfil são servidas pelo backend (/public/**) e exibidas em <img>.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").origin;
  } catch {
    return "";
  }
})();

/*
 * Cabeçalhos de segurança (ADR 015 do backend). A Psiconet não carrega nenhum recurso de terceiros
 * (fontes são servidas pelo próprio domínio via next/font), então a CSP só libera a própria origem e
 * a API. 'unsafe-inline' em script-src é exigido pelos scripts inline de hidratação do Next sem
 * nonce; 'unsafe-eval' e ws: só em desenvolvimento (HMR). Qualquer terceiro futuro precisa ser
 * incluído aqui E condicionado ao consentimento (<ConsentGate>).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Só com API em HTTPS: num deploy HTTP (ex.: rede interna) quebraria as fotos servidas pela API.
  ...(!isDev && apiOrigin.startsWith("https://") ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        // temporario
        source: '/pagina-source',
        destination: '/pagina-destino',
        permanent: true, 
      },
    ];
  },
};

export default nextConfig;
