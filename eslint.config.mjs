import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Regra nova do eslint-config-next 16.4 (React Compiler). Os avisos atuais são o padrão
      // "buscar dados no useEffect e marcar carregando", que funciona; reescrever (ex.: o
      // CreateAppointmentModal) sem teste de interface arrisca regressão. Fica visível como aviso
      // até a migração dos hooks — ver docs/seguranca/auditoria-2026-11-11.md (BUG-11).
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
