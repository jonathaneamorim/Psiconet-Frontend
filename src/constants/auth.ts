/** Tempo de acesso estendido em dias (quando "Mantenha-me conectado" está ativo) */
export const KEEP_LOGGED_TIME_DAYS = Number(process.env.KEEP_LOGGED_TIME) || 7;

/** Tempo de acesso padrão de usuário em minutos */
export const ACCESS_TIME_MINUTES = Number(process.env.ACCESS_TIME) || 180;
