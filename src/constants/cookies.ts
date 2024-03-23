/** Nome do cookie que armazena o JWT */
export const COOKIE_TOKEN = process.env.NEXT_PUBLIC_COOKIE_TOKEN_NAME || 'psiconet_token';

/** Prefixo de role que o backend (Spring Security) retorna no JWT */
export const ROLE_PREFIX = process.env.NEXT_PUBLIC_ROLE_PREFIX || 'ROLE_';