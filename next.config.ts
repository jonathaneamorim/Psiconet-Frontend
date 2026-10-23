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
 * Videochamada integrada (ADR 016 do backend / ADR 003 do front): origens do provedor de vídeo que o
 * navegador acessa (sinalização wss:// e API https://), separadas por espaço ou vírgula. Ex. LiveKit
 * Cloud: "wss://*.livekit.cloud https://*.livekit.cloud". Vazio ⇒ nenhuma origem extra (sala não conecta).
 * Lida no build/start — mude e reinicie.
 */
const videoOrigins = (process.env.VIDEO_CSP_ORIGINS || "")
  .split(/[\s,]+/)
  .map((origin) => origin.trim())
  .filter((origin) => /^(wss?|https?):\/\/[a-z0-9*.-]+(:\d+)?$/i.test(origin));

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
  `connect-src 'self'${videoOrigins.length ? ` ${videoOrigins.join(" ")}` : ""}${isDev ? " ws: wss:" : ""}`,
  // Vídeo/áudio da chamada chegam como MediaStream (srcObject); blob: cobre os elementos de mídia do SDK.
  "media-src 'self' blob:",
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

// Câmera e microfone liberados SÓ para a própria origem e SÓ na página da chamada (o último cabeçalho
// com a mesma chave prevalece no Next).
const callHeaders = [
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()" },
];

// Só no `next dev`: hosts que podem abrir o servidor de desenvolvimento além de localhost (ex.: celular na
// mesma rede pelo IP do computador). Sem isso o Next 16 recusa os scripts (403) e a página fica sem interação.
// Padrão: redes locais privadas e túneis temporários do cloudflared (teste da videochamada no celular, que
// exige HTTPS); DEV_ALLOWED_ORIGINS (separados por espaço ou vírgula) substitui a lista.
const allowedDevOrigins = (process.env.DEV_ALLOWED_ORIGINS || "192.168.*.* 10.*.*.* *.trycloudflare.com")
  .split(/[\s,]+/)
  .filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/call/:path*", headers: callHeaders },
    ];
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
