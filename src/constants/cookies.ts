/** Nome do cookie que armazena o JWT */
export const COOKIE_TOKEN = process.env.COOKIE_TOKEN_NAME || 'psiconet_token';

/** Prefixo de role que o backend (Spring Security) retorna no JWT */
export const ROLE_PREFIX = process.env.ROLE_PREFIX || 'ROLE_';