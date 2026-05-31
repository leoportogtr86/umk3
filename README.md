# UMK3 Blog — Guia de Comandos Ultimate Mortal Kombat 3 SNES

Guia completo de comandos do Ultimate Mortal Kombat 3 para Super Nintendo. Golpes especiais, finalizações, combos e lore de todos os 22 personagens jogáveis.

## Demo

Acesse o site: [UMK3 Blog](https://SEU-USUARIO.github.io/estudos-kiro/)

## Funcionalidades

- Grade de seleção de personagens estilo arcade dos anos 90
- Golpes especiais, finalizações (Fatalities, Babalities, Friendships, Animalities, Brutalities) e combos
- Dois modos de exibição: Notação original e Botões SNES
- Busca por nome de personagem
- Lore e história de cada personagem
- Página com a história geral do UMK3
- Tema visual 2D Game com efeitos retrô (scanlines, glow neon, pixel borders)
- Totalmente responsivo (mobile, tablet, desktop)
- Acessível (ARIA, navegação por teclado, áreas de toque 44x44px, prefers-reduced-motion)

## Tecnologias

- HTML5 semântico
- CSS3 com Tailwind CSS (CDN)
- JavaScript ES Modules (vanilla, sem frameworks)
- Google Fonts (Press Start 2P + VT323)
- SPA com roteamento via hash

## Estrutura do Projeto

```
├── index.html          # Página principal (Tailwind config + estrutura)
├── css/custom.css      # Estilos temáticos (pixel-border, scanlines, glow)
├── js/
│   ├── app.js          # Inicialização e event listeners
│   ├── router.js       # Roteamento SPA via hash
│   ├── components.js   # Componentes de renderização
│   ├── data.js         # Carregamento de dados JSON
│   ├── utils.js        # Funções utilitárias
│   └── displayMode.js  # Toggle notação/botões SNES
├── data/
│   ├── characters.json # Dados dos 22 personagens
│   └── story.json      # História do UMK3
├── images/             # Sprites dos personagens
└── tests/              # Testes unitários, property e e2e
```

## Desenvolvimento Local

Abra o `index.html` diretamente no navegador ou use um servidor local:

```bash
npx serve .
```

## Testes

```bash
# Instalar dependências de desenvolvimento
npm install

# Testes unitários e property-based
npm run test

# Testes e2e (requer Playwright instalado)
npx playwright install
npm run test:e2e
```

## Deploy

O deploy é automático via GitHub Actions. A cada push na branch `main`, o site é publicado no GitHub Pages.

## Licença

Projeto educacional. Ultimate Mortal Kombat 3 é propriedade da Midway Games / NetherRealm Studios / Warner Bros.
