// Configuração do Playwright para testes E2E do UMK3 Blog
// Usa servidor estático local para servir os arquivos da aplicação

import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Diretório dos testes E2E
  testDir: './tests/e2e',

  // Timeout padrão por teste (30 segundos)
  timeout: 30000,

  // Configuração de retries para estabilidade
  retries: 0,

  // Reporter de saída
  reporter: 'list',

  // Configuração de uso global (base URL do servidor local)
  use: {
    baseURL: 'http://localhost:3000',
    // Captura de screenshots apenas em falhas
    screenshot: 'only-on-failure',
  },

  // Apenas Chromium para velocidade
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],

  // Servidor web local que serve os arquivos estáticos antes dos testes
  webServer: {
    command: 'npx serve . -l 3000 --no-clipboard',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
