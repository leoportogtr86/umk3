// Configuração do Vitest para o projeto UMK3 Blog
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js', 'tests/**/*.property.test.js'],
  },
});
