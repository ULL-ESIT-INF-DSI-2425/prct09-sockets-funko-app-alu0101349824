import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: false,
      include: [
        "src/ejercicio-1/funko.ts",
        "src/ejercicio-1/gestor-funko.ts",
        "src/ejercicio-1/crear-funko.ts",
        "src/ejercicio-1/cliente.ts",
        "src/ejercicio-1/servidor.ts",
      ],
      exclude: [
        "src/**/index.ts",
        "src/**/index.spec.ts",
        "**/node_modules/**",
        "**/dist/**"
      ],
    },
  },
});
