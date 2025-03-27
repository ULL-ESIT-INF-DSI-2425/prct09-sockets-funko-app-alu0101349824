import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: false,
      include: [
        "src/ejercicio-1/Funko.ts",
        "src/ejercicio-1/GestorFunko.ts",
        "src/ejercicio-1/TiposComandos.ts"
      ],
      exclude: [
        "src/**/index.ts",
        "src/**/comandos.ts",
        "src/**/index.spec.ts",
        "src/**/comandos.spec.ts",
        "**/node_modules/**",
        "**/dist/**"
      ],
    },
  },
});
