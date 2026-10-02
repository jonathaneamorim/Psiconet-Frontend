/** Nome do cookie que armazena o token de acesso (JWT curto) */
export const COOKIE_TOKEN = process.env.COOKIE_TOKEN_NAME || 'psiconet_token';

/** Cookie do refresh token rotativo da sessão do dispositivo (ADR 014 do backend) */
export const COOKIE_REFRESH = 'psiconet_refresh';

/** Cookie com a escolha do banner de cookies (versão da política, categorias, data) */
export const COOKIE_CONSENT = 'psiconet_consent';

/** Prefixo de role que o backend (Spring Security) retorna no JWT */
export const ROLE_PREFIX = process.env.ROLE_PREFIX || 'ROLE_';
