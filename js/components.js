// Componentes de renderização do UMK3 Blog
// Funções que recebem dados e retornam strings HTML para injeção no DOM

import { groupFinishersByType, categorizeCombos } from './utils.js';
import { translateToken } from './displayMode.js';

/**
 * Mapeamento de notação para a legenda completa.
 * Cada entrada contém símbolo, significado e botão SNES correspondente.
 */
const NOTATION_LEGEND = [
  { symbol: '↑', meaning: 'Cima', snesButton: 'D-Pad Cima' },
  { symbol: '↓', meaning: 'Baixo', snesButton: 'D-Pad Baixo' },
  { symbol: '←', meaning: 'Esquerda / Trás', snesButton: 'D-Pad Esquerda' },
  { symbol: '→', meaning: 'Direita / Frente', snesButton: 'D-Pad Direita' },
  { symbol: 'HP', meaning: 'High Punch', snesButton: 'Y' },
  { symbol: 'LP', meaning: 'Low Punch', snesButton: 'X' },
  { symbol: 'HK', meaning: 'High Kick', snesButton: 'B' },
  { symbol: 'LK', meaning: 'Low Kick', snesButton: 'A' },
  { symbol: 'BL', meaning: 'Block', snesButton: 'R' },
  { symbol: 'RUN', meaning: 'Run', snesButton: 'L' },
  { symbol: ',', meaning: 'Sequencial', snesButton: '—' },
  { symbol: '+', meaning: 'Simultâneo', snesButton: '—' },
];

/**
 * Labels em pt-BR para os tipos de finalização.
 */
const FINISHER_TYPE_LABELS = {
  fatality: 'Fatality',
  babality: 'Babality',
  friendship: 'Friendship',
  animality: 'Animality',
  stage_fatality: 'Stage Fatality',
  brutality: 'Brutality',
};

/**
 * Tokens que recebem estilização especial (direcionais e botões).
 */
const DIRECTIONAL_TOKENS = new Set(['↑', '↓', '←', '→']);
const BUTTON_TOKENS = new Set(['HP', 'LP', 'HK', 'LK', 'BL', 'RUN']);

/**
 * Renderiza um comando na notação padronizada com formatação visual.
 * Tokens direcionais recebem cor amarela, botões recebem cor verde,
 * separadores recebem cor cinza. Todos em fonte monospace.
 * Tokens de botão incluem atributo data-token com o valor original em notação
 * para permitir atualização DOM-based via applyDisplayMode.
 * @param {string} command - Comando na notação padronizada
 * @param {import('./displayMode.js').DisplayMode} [mode='notation'] - Modo de exibição ativo
 * @returns {string} HTML string com tokens estilizados
 */
export function renderCommandDisplay(command, mode = 'notation') {
  if (!command) return '';

  // Divide o comando em direcionais, botões, separadores e textos livres.
  // Isso mantém comandos com observações como "segure LK por 3s" traduzíveis
  // no modo Botões SNES, sem perder as instruções textuais.
  const parts = command.match(/HP|LP|HK|LK|BL|RUN|[↑↓←→]|[,+]|(?:(?!HP|LP|HK|LK|BL|RUN|[↑↓←→,+]).)+/g) || [];

  const rendered = parts.map(part => {
    const trimmed = part.trim();

    if (trimmed === ',') {
      return `<span class="mx-1" style="color: #ff00ff;">,</span>`;
    }

    if (trimmed === '+') {
      return `<span class="mx-1 font-bold" style="color: #ff00ff;">+</span>`;
    }

    if (DIRECTIONAL_TOKENS.has(trimmed)) {
      return `<span class="command-token inline-block px-2 py-1 font-mono text-sm font-bold" style="background: #2a2a3e; color: #ffff00; border: 1px solid #00ffff; border-radius: 4px;">${trimmed}</span>`;
    }

    if (BUTTON_TOKENS.has(trimmed)) {
      // Armazena token original em notação no data-token; exibe traduzido conforme modo
      const displayToken = translateToken(trimmed, mode);
      return `<span class="command-token inline-block px-2 py-1 font-mono text-sm font-bold" style="background: #2a2a3e; color: #00ff00; border: 1px solid #00ffff; border-radius: 4px;" data-token="${trimmed}">${displayToken}</span>`;
    }

    // Nomes de golpes ou outros tokens
    if (trimmed.length > 0) {
      return `<span class="inline-block bg-gray-600 text-blue-200 px-2 py-1 rounded font-mono text-sm">${trimmed}</span>`;
    }

    return '';
  }).join('');

  return `<div class="flex flex-wrap items-center gap-1 font-mono">${rendered}</div>`;
}

/**
 * Renderiza a lista de golpes especiais com nome e comando formatado.
 * @param {import('./data.js').SpecialMove[]} moves - Lista de golpes especiais
 * @param {import('./displayMode.js').DisplayMode} [mode='notation'] - Modo de exibição ativo
 * @returns {string} HTML string da seção de golpes especiais
 */
export function renderSpecialMovesList(moves, mode = 'notation') {
  if (!moves || moves.length === 0) return '';

  const moveItems = moves.map(move => `
    <li class="pixel-border bg-mk-accent p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span class="text-white font-semibold text-lg">${move.name}</span>
        ${renderCommandDisplay(move.command, mode)}
      </div>
    </li>
  `).join('');

  return `
    <section class="mb-8">
      <h2 class="section-header text-2xl font-bold text-yellow-400 mb-4">Golpes Especiais</h2>
      <ul class="space-y-3">
        ${moveItems}
      </ul>
    </section>
  `;
}

/**
 * Renderiza a seção de finalizações agrupadas por tipo.
 * Usa groupFinishersByType para agrupar e exibe apenas tipos que possuem finalizações.
 * @param {import('./data.js').Finisher[]} finishers - Lista de finalizações
 * @param {import('./displayMode.js').DisplayMode} [mode='notation'] - Modo de exibição ativo
 * @returns {string} HTML string da seção de finalizações
 */
export function renderFinisherSection(finishers, mode = 'notation') {
  if (!finishers || finishers.length === 0) return '';

  const grouped = groupFinishersByType(finishers);

  // Ordem de exibição dos tipos
  const typeOrder = ['fatality', 'stage_fatality', 'babality', 'friendship', 'animality', 'brutality'];

  const subsections = typeOrder
    .filter(type => grouped[type] && grouped[type].length > 0)
    .map(type => {
      const label = FINISHER_TYPE_LABELS[type];
      const items = grouped[type].map(finisher => `
        <li class="pixel-border bg-mk-accent p-4">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span class="text-white font-semibold text-lg">${finisher.name}</span>
              <span class="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">${finisher.distance}</span>
            </div>
            ${renderCommandDisplay(finisher.command, mode)}
          </div>
        </li>
      `).join('');

      return `
        <div class="mb-6">
          <h3 class="text-xl font-bold text-mk-magenta mb-3">${label}</h3>
          <ul class="space-y-3">
            ${items}
          </ul>
        </div>
      `;
    }).join('');

  return `
    <section class="mb-8">
      <h2 class="section-header text-2xl font-bold text-yellow-400 mb-4">Finalizações</h2>
      ${subsections}
    </section>
  `;
}

/**
 * Renderiza a seção de combos categorizados (Básico/Avançado).
 * Usa categorizeCombos para separar por categoria.
 * Exibe hits e dano quando disponíveis.
 * @param {import('./data.js').Combo[]} combos - Lista de combos
 * @param {import('./displayMode.js').DisplayMode} [mode='notation'] - Modo de exibição ativo
 * @returns {string} HTML string da seção de combos
 */
export function renderComboSection(combos, mode = 'notation') {
  if (!combos || combos.length === 0) {
    return `
      <section class="mb-8">
        <h2 class="section-header text-2xl font-bold text-yellow-400 mb-4">Combos</h2>
        <p class="text-gray-400 italic">Não há combos disponíveis para este personagem</p>
      </section>
    `;
  }

  const { basic, advanced } = categorizeCombos(combos);

  const renderComboList = (comboList) => {
    return comboList.map(combo => {
      const stats = [];
      if (combo.hits != null) stats.push(`${combo.hits} hits`);
      if (combo.damage != null) stats.push(`${combo.damage}% dano`);
      const statsHtml = stats.length > 0
        ? `<span class="text-sm text-cyan-300 bg-gray-700 px-2 py-1 rounded">${stats.join(' · ')}</span>`
        : '';

      return `
        <li class="pixel-border bg-mk-accent p-4">
          <div class="flex flex-col gap-2">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span class="text-white font-semibold text-lg">${combo.name}</span>
              ${statsHtml}
            </div>
            ${renderCommandDisplay(combo.command, mode)}
          </div>
        </li>
      `;
    }).join('');
  };

  let content = '';

  if (basic.length > 0) {
    content += `
      <div class="mb-6">
        <h3 class="text-xl font-bold text-mk-primary mb-3">Básico</h3>
        <ul class="space-y-3">
          ${renderComboList(basic)}
        </ul>
      </div>
    `;
  }

  if (advanced.length > 0) {
    content += `
      <div class="mb-6">
        <h3 class="text-xl font-bold text-mk-yellow mb-3">Avançado</h3>
        <ul class="space-y-3">
          ${renderComboList(advanced)}
        </ul>
      </div>
    `;
  }

  return `
    <section class="mb-8">
      <h2 class="section-header text-2xl font-bold text-yellow-400 mb-4">Combos</h2>
      ${content}
    </section>
  `;
}

/**
 * Renderiza a legenda completa adaptável ao modo de exibição ativo.
 * - Modo Notação: colunas "Símbolo | Significado | Botão SNES"
 * - Modo Botões SNES: colunas "Botão | Significado | Notação"
 * Tokens de botão recebem atributo data-token (sempre com valor em notação)
 * para permitir atualização via DOM. Direcionais e separadores permanecem
 * idênticos em ambos os modos.
 * @param {import('./displayMode.js').DisplayMode} [mode='notation'] - Modo de exibição ativo
 * @returns {string} HTML string da legenda de notação
 */
export function renderNotationLegend(mode = 'notation') {
  // Tokens que são botões de ataque (possuem mapeamento bidirecional)
  const isButtonEntry = (entry) => BUTTON_TOKENS.has(entry.symbol);

  const rows = NOTATION_LEGEND.map(entry => {
    if (isButtonEntry(entry)) {
      // Tokens de botão: adaptam conforme o modo e recebem data-token
      if (mode === 'snes') {
        // Modo Botões SNES: primeira coluna = botão SNES, terceira = notação
        return `
    <tr class="border-b border-gray-700">
      <td class="px-4 py-2 font-mono text-yellow-300 font-bold text-center" data-token="${entry.symbol}">${entry.snesButton}</td>
      <td class="px-4 py-2 text-gray-200">${entry.meaning}</td>
      <td class="px-4 py-2 text-green-300 font-semibold text-center">${entry.symbol}</td>
    </tr>`;
      }
      // Modo Notação (padrão): primeira coluna = notação, terceira = botão SNES
      return `
    <tr class="border-b border-gray-700">
      <td class="px-4 py-2 font-mono text-yellow-300 font-bold text-center" data-token="${entry.symbol}">${entry.symbol}</td>
      <td class="px-4 py-2 text-gray-200">${entry.meaning}</td>
      <td class="px-4 py-2 text-green-300 font-semibold text-center">${entry.snesButton}</td>
    </tr>`;
    }

    // Direcionais e separadores: idênticos em ambos os modos, sem data-token
    return `
    <tr class="border-b border-gray-700">
      <td class="px-4 py-2 font-mono text-yellow-300 font-bold text-center">${entry.symbol}</td>
      <td class="px-4 py-2 text-gray-200">${entry.meaning}</td>
      <td class="px-4 py-2 text-green-300 font-semibold text-center">${entry.snesButton}</td>
    </tr>`;
  }).join('');

  // Cabeçalhos adaptáveis ao modo
  const firstColumnHeader = mode === 'snes' ? 'Botão' : 'Símbolo';
  const thirdColumnHeader = mode === 'snes' ? 'Notação' : 'Botão SNES';

  return `
    <section class="mb-8">
      <h2 class="section-header text-2xl font-bold text-yellow-400 mb-4 pb-2">Legenda de Notação</h2>
      <div class="overflow-x-auto">
        <table class="w-full bg-mk-accent pixel-border font-mono">
          <thead>
            <tr class="bg-gray-900 text-gray-300">
              <th class="px-4 py-3 text-center">${firstColumnHeader}</th>
              <th class="px-4 py-3 text-left">Significado</th>
              <th class="px-4 py-3 text-center">${thirdColumnHeader}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
      <div class="mt-6 flex justify-center">
        <figure class="text-center">
          <img
            src="images/controle-comandos.png"
            alt="Mapeamento dos botões do controle SNES para os comandos do UMK3"
            class="max-w-full sm:max-w-md rounded-lg border border-gray-700 shadow-lg"
          />
          <figcaption class="mt-2 text-sm text-gray-400">Mapeamento do controle SNES</figcaption>
        </figure>
      </div>
    </section>
  `;
}

/**
 * Renderiza a página completa do personagem com todas as seções.
 * Inclui navegação de volta, nome, imagem, toggle de modo, golpes especiais, finalizações, combos e legenda.
 * Usa landmarks semânticos (nav, main, header) para acessibilidade.
 * @param {import('./data.js').Character} character - Dados completos do personagem
 * @param {import('./displayMode.js').DisplayMode} [mode='notation'] - Modo de exibição ativo
 * @returns {string} HTML string da página completa do personagem
 */
export function renderCharacterPage(character, mode = 'notation') {
  return `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <nav aria-label="Navegação de retorno">
        <a href="#/" class="inline-flex items-center text-mk-primary hover:text-mk-magenta mb-6 transition-colors min-h-[44px] min-w-[44px]" aria-label="Voltar ao roster de personagens">
          <span aria-hidden="true" class="mr-2">←</span>
          <span>Voltar ao Roster</span>
        </a>
      </nav>

      <main>
        <header class="text-center mb-8">
          <img
            src="${character.imageUrl}"
            alt="Imagem do personagem ${character.name}"
            class="pixel-border w-48 h-48 mx-auto mb-4 object-contain"
            style="box-shadow: 0 0 4px 2px rgba(0,255,255,0.3);"
            onerror="this.onerror=null;this.src='';this.alt='${character.name}';this.classList.add('bg-gray-700','flex','items-center','justify-center');this.insertAdjacentHTML('afterend','<div class=\\'w-48 h-48 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-lg\\'>${character.name}</div>');this.remove();"
          />
          <h1 class="pixel-font text-[2rem] font-bold text-mk-yellow" style="letter-spacing: 0.05em; text-shadow: 0 0 4px #ffff00, 0 0 8px #ffff00;">${character.name}</h1>
        </header>

        ${renderToggle(mode)}
        ${renderSpecialMovesList(character.specialMoves, mode)}
        ${renderFinisherSection(character.finishers, mode)}
        ${renderComboSection(character.combos, mode)}
        ${character.lore ? renderLoreSection(character.lore) : ''}
        ${renderNotationLegend(mode)}
      </main>
    </div>
  `;
}

/**
 * Renderiza a página 404 com mensagem "Personagem não encontrado" e link para a página inicial.
 * Estilizada com tema arcade: pixel-font no título, cores neon, pixel-border no link.
 * @returns {string} HTML string da página 404
 */
export function renderNotFound() {
  return `
    <div class="flex flex-col items-center justify-center py-16 text-center bg-mk-dark" role="alert" aria-live="polite">
      <svg class="w-20 h-20 text-mk-yellow mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
      <h1 class="pixel-font text-2xl font-bold text-mk-yellow mb-2" style="letter-spacing: 0.05em;">404</h1>
      <p class="text-lg text-gray-200 mb-6">Personagem não encontrado</p>
      <a href="#/"
         class="pixel-border inline-block px-6 py-3 bg-mk-accent text-mk-primary font-semibold hover:text-mk-magenta transition-colors min-w-[44px] min-h-[44px]"
         aria-label="Voltar à página inicial">
        Voltar à página inicial
      </a>
    </div>
  `;
}

/**
 * Renderiza mensagem de erro com botão para recarregar a página.
 * Exibida inline no local onde o conteúdo deveria aparecer.
 * Estilizada com tema arcade: pixel-font implícito via cor neon, pixel-border no botão.
 * @param {string} message - Mensagem de erro a ser exibida
 * @returns {string} HTML string da mensagem de erro
 */
export function renderError(message) {
  return `
    <div class="flex flex-col items-center justify-center py-16 text-center bg-mk-dark" role="alert" aria-live="assertive">
      <svg class="w-16 h-16 text-mk-red mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-lg text-red-400 text-mk-red mb-6">${message}</p>
      <button onclick="window.location.reload()"
              class="pixel-border px-6 py-3 bg-mk-accent text-mk-primary font-semibold hover:text-mk-magenta transition-colors min-w-[44px] min-h-[44px] cursor-pointer"
              aria-label="Recarregar página">
        Recarregar página
      </button>
    </div>
  `;
}


/**
 * Renderiza um card individual de personagem com nome, imagem e link.
 * Cada card é um item de lista acessível com role="listitem".
 * Aplica classes temáticas: pixel-border, card-hover-glow, card-enter.
 * Usa --card-index para animação sequencial de entrada.
 * @param {import('./data.js').CharacterSummary} character - Dados do personagem
 * @param {number} [index=0] - Índice do card na grid para animação sequencial
 * @returns {string} HTML string do card
 */
export function renderCharacterCard(character, index = 0) {
  return `
    <div role="listitem" class="pixel-border card-hover-glow card-enter" style="--card-index: ${index}">
      <a href="#/personagem/${character.slug}"
         class="block bg-mk-accent overflow-hidden min-w-[44px] min-h-[44px] hover:scale-105 hover:border-[#ffff00] focus-within:scale-105 focus-within:border-[#ffff00] transition-transform duration-200"
         aria-label="Ver comandos de ${character.name}">
        <div class="aspect-square overflow-hidden bg-mk-secondary flex items-center justify-center">
          <img src="${character.imageUrl}"
               alt="Imagem do personagem ${character.name}"
               class="w-full h-full object-cover"
               loading="lazy"
               onerror="this.onerror=null;this.src='';this.alt='${character.name}';this.classList.add('bg-mk-secondary','flex','items-center','justify-center')">
        </div>
        <div class="p-3 text-center">
          <h2 class="text-sm sm:text-base font-semibold text-gray-100 truncate">${character.name}</h2>
        </div>
      </a>
    </div>
  `;
}

/**
 * Renderiza a grade responsiva de personagens.
 * Coluna única em mobile (< 640px), 2 colunas em sm, 3 em md, 4 em lg.
 * Cada card recebe --card-index incremental para animação sequencial.
 * @param {import('./data.js').CharacterSummary[]} characters - Lista de personagens
 * @returns {string} HTML string da grade
 */
export function renderRosterGrid(characters) {
  if (!characters || characters.length === 0) {
    return renderEmptyState('Nenhum personagem encontrado');
  }

  const cards = characters.map((character, index) => renderCharacterCard(character, index)).join('');

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="list" aria-label="Lista de personagens">
      ${cards}
    </div>
  `;
}

/**
 * Renderiza a barra de busca com área de toque mínima de 44x44px em mobile.
 * Estilizada com tema arcade: fundo escuro, borda neon, fonte monospace.
 * @param {string} value - Valor atual do input de busca
 * @returns {string} HTML string da barra de busca
 */
export function renderSearchBar(value) {
  return `
    <div class="mb-6">
      <label for="search-input" class="sr-only">Buscar personagem</label>
      <input
        type="search"
        id="search-input"
        class="search-bar-themed w-full min-w-[44px] min-h-[44px] px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mk-primary focus:border-transparent"
        placeholder="Digite o nome do lutador..."
        value="${value || ''}"
        aria-label="Buscar personagem pelo nome"
      >
    </div>
  `;
}

/**
 * Renderiza mensagem de estado vazio (nenhum resultado encontrado).
 * @param {string} message - Mensagem a ser exibida
 * @returns {string} HTML string do estado vazio
 */
export function renderEmptyState(message) {
  return `
    <div class="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
      <svg class="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <p class="text-gray-400 text-lg">${message}</p>
    </div>
  `;
}

/**
 * Renderiza o componente toggle de modo de exibição de comandos.
 * Exibe dois botões (Notação e Botões SNES) agrupados com role="group",
 * indicando visualmente o modo ativo e comunicando estado via aria-pressed.
 * Inclui região aria-live para anúncios a leitores de tela.
 * @param {import('./displayMode.js').DisplayMode} activeMode - Modo atualmente ativo ('notation' ou 'snes')
 * @returns {string} HTML string do toggle
 */
export function renderToggle(activeMode) {
  const isNotation = activeMode === 'notation';

  // Estilos para botão ativo: cor neon ciano (mk-primary) com texto escuro — contraste ≥ 3:1 vs inativo
  const activeClasses = 'bg-mk-primary text-mk-dark font-bold shadow-md';
  // Estilos para botão inativo: fundo escuro (mk-accent) com texto cinza claro
  const inactiveClasses = 'bg-mk-accent text-gray-300 hover:bg-mk-secondary';

  // Classes base compartilhadas entre os botões — inclui pixel-border para estética temática
  const baseClasses = 'pixel-border min-h-[44px] min-w-[44px] px-4 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-mk-primary focus:ring-offset-2 focus:ring-offset-mk-dark cursor-pointer';

  return `
    <div class="flex items-center gap-2 mb-6" role="group" aria-label="Alternar modo de exibição de comandos">
      <button
        type="button"
        data-mode="notation"
        aria-pressed="${isNotation ? 'true' : 'false'}"
        class="${baseClasses} ${isNotation ? activeClasses : inactiveClasses}"
      >Notação</button>
      <button
        type="button"
        data-mode="snes"
        aria-pressed="${isNotation ? 'false' : 'true'}"
        class="${baseClasses} ${isNotation ? inactiveClasses : activeClasses}"
      >Botões SNES</button>
    </div>
    <div aria-live="polite" class="sr-only" id="mode-announcement"></div>
  `;
}

/**
 * Renderiza a seção completa de lore de um personagem.
 * Exibe apenas subseções que possuem conteúdo.
 * Retorna string vazia se lore for null, undefined, não for objeto,
 * ou se todas as subseções retornarem vazio.
 * @param {Object} lore - Objeto com bio, curiosities e ending
 * @returns {string} HTML string da seção de lore, ou string vazia se sem conteúdo
 */
export function renderLoreSection(lore) {
  // Retorna vazio se lore for inválido ou não for objeto
  if (!lore || typeof lore !== 'object' || Array.isArray(lore)) {
    return '';
  }

  // Renderiza cada subseção condicionalmente
  const bioHtml = renderBio(lore.bio);
  const curiositiesHtml = renderCuriosities(lore.curiosities);
  const endingHtml = renderEnding(lore.ending);

  // Se todas as subseções estiverem vazias, não renderiza a seção
  if (!bioHtml && !curiositiesHtml && !endingHtml) {
    return '';
  }

  return `
    <section aria-labelledby="lore-heading" class="mb-8 overflow-hidden">
      <h2 id="lore-heading" class="section-header text-2xl font-bold text-yellow-400 mb-4">Lore</h2>
      <div class="lore-content max-w-[75ch] text-base leading-relaxed break-words overflow-wrap-anywhere">
        ${bioHtml}
        ${curiositiesHtml}
        ${endingHtml}
      </div>
    </section>
  `;
}

/**
 * Renderiza a subseção de biografia.
 * Preserva quebras de parágrafo do texto original.
 * Retorna string vazia se bio for null, undefined, vazio ou apenas whitespace.
 * @param {string} bio - Texto da biografia
 * @returns {string} HTML string com parágrafos, ou string vazia se sem conteúdo
 */
export function renderBio(bio) {
  // Retorna vazio se bio for inválido ou apenas whitespace
  if (!bio || typeof bio !== 'string' || bio.trim().length === 0) {
    return '';
  }

  // Separa parágrafos por \n\n e filtra vazios/whitespace-only
  const paragraphs = bio.split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Se após filtrar não sobrou nenhum parágrafo válido, retorna vazio
  if (paragraphs.length === 0) {
    return '';
  }

  const paragraphsHtml = paragraphs
    .map(p => `<p class="text-gray-200 leading-relaxed mb-4">${p}</p>`)
    .join('\n      ');

  return `
    <div class="mb-6">
      <h3 class="text-xl font-bold text-mk-primary mb-3">Biografia</h3>
      ${paragraphsHtml}
    </div>
  `;
}

/**
 * Renderiza a subseção de curiosidades como lista não-ordenada.
 * Filtra itens vazios, nulos ou compostos apenas por espaços em branco.
 * Preserva a ordem original dos itens válidos do array.
 * @param {string[]} curiosities - Array de curiosidades
 * @returns {string} HTML string com lista não-ordenada, ou string vazia se sem conteúdo válido
 */
export function renderCuriosities(curiosities) {
  if (!Array.isArray(curiosities) || curiosities.length === 0) return '';

  // Filtra itens inválidos (null, undefined, string vazia ou apenas whitespace)
  const validItems = curiosities.filter(
    item => typeof item === 'string' && item.trim().length > 0
  );

  if (validItems.length === 0) return '';

  const listItems = validItems.map(item => `
        <li class="text-gray-300 leading-relaxed">${item}</li>`).join('');

  return `
      <div class="mb-4">
        <h3 class="text-xl font-bold text-mk-yellow mb-3">Curiosidades</h3>
        <ul class="list-disc list-inside space-y-2 pl-2">${listItems}
        </ul>
      </div>
  `;
}

/**
 * Renderiza a subseção do final do personagem.
 * Preserva quebras de parágrafo do texto original.
 * Retorna string vazia se ending for null, undefined, vazio ou apenas whitespace.
 * @param {string} ending - Texto do final
 * @returns {string} HTML string com parágrafos, ou string vazia se sem conteúdo
 */
export function renderEnding(ending) {
  // Retorna vazio se ending for inválido ou apenas whitespace
  if (!ending || typeof ending !== 'string' || ending.trim().length === 0) {
    return '';
  }

  // Separa parágrafos por \n\n e filtra vazios/whitespace-only
  const paragraphs = ending.split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Se após filtrar não sobrou nenhum parágrafo válido, retorna vazio
  if (paragraphs.length === 0) {
    return '';
  }

  const paragraphsHtml = paragraphs
    .map(p => `<p class="text-gray-200 leading-relaxed mb-4">${p}</p>`)
    .join('\n      ');

  return `
    <div class="mb-6">
      <h3 class="text-xl font-bold text-mk-magenta mb-3">Final</h3>
      ${paragraphsHtml}
    </div>
  `;
}

/**
 * Renderiza a página de história geral do UMK3.
 * Usa estrutura de headings hierárquica (h1 para título, h2 para seções)
 * para acessibilidade e navegação por leitores de tela.
 * Aplica tema narrativo: pixel-font nos títulos, glow neon magenta no h1,
 * corpo em VT323/monospace, conteúdo envolvido em story-container.
 * @param {Object} storyData - Dados da história com title, synopsis e sections
 * @returns {string} HTML string da página completa
 */
export function renderStoryPage(storyData) {
  // Renderiza sinopse como parágrafos separados por \n\n
  let synopsisHtml = '';
  if (storyData.synopsis && typeof storyData.synopsis === 'string' && storyData.synopsis.trim().length > 0) {
    const paragraphs = storyData.synopsis.split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    synopsisHtml = paragraphs
      .map(p => `<p class="text-gray-200 leading-relaxed mb-[1em]">${p}</p>`)
      .join('\n      ');
  }

  // Renderiza seções narrativas com h2 (pixel-font, cor neon) e parágrafos
  let sectionsHtml = '';
  if (Array.isArray(storyData.sections) && storyData.sections.length > 0) {
    sectionsHtml = storyData.sections.map(section => {
      let contentHtml = '';
      if (section.content && typeof section.content === 'string' && section.content.trim().length > 0) {
        const paragraphs = section.content.split('\n\n')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        contentHtml = paragraphs
          .map(p => `<p class="text-gray-200 leading-relaxed mb-[1em]">${p}</p>`)
          .join('\n        ');
      }

      return `
      <section class="mb-8">
        <h2 class="pixel-font text-[1.5rem] font-bold text-mk-primary mb-4 border-b border-gray-700 pb-2" style="letter-spacing: 0.05em;">${section.title}</h2>
        ${contentHtml}
      </section>`;
    }).join('');
  }

  return `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <nav aria-label="Navegação de retorno">
        <a href="#/" class="inline-flex items-center text-mk-primary hover:text-mk-magenta mb-6 transition-colors min-h-[44px] min-w-[44px]" aria-label="Voltar ao roster de personagens">
          <span aria-hidden="true" class="mr-2">←</span>
          <span>Voltar ao Roster</span>
        </a>
      </nav>

      <main>
        <header class="mb-8">
          <h1 class="pixel-font text-[2rem] font-bold text-mk-magenta mb-4" style="letter-spacing: 0.05em; text-shadow: 0 0 4px #ff00ff, 0 0 8px #ff00ff;">${storyData.title}</h1>
        </header>

        <div class="story-container font-mono text-[20px] leading-relaxed">
          ${synopsisHtml}
          ${sectionsHtml}
        </div>
      </main>
    </div>
  `;
}

/**
 * Renderiza a página inicial completa com título, barra de busca, grade de personagens
 * e link para a página de história geral.
 * Usa landmarks semânticos (header, main) e aria-live para atualizações dinâmicas da busca.
 * @param {import('./data.js').CharacterSummary[]} characters - Lista de personagens
 * @returns {string} HTML string da página inicial
 */
export function renderHomePage(characters) {
  return `
    <header class="mb-8 text-center">
      <h1 class="pixel-font title-glow text-[1.5rem] sm:text-[2rem] font-bold text-mk-primary mb-2 tracking-[0.05em]">★ SELECIONE SEU LUTADOR ★</h1>
      <p class="text-mk-primary text-lg font-mono" style="text-shadow: 0 0 4px #00ffff, 0 0 8px #00ffff;">UMK3 Blog</p>
    </header>
    ${renderSearchBar('')}
    <main aria-live="polite" aria-atomic="false">
      ${renderRosterGrid(characters)}
    </main>
    <nav class="mt-8" aria-label="Navegação para conteúdo adicional">
      <a href="#/story"
         class="pixel-border block w-full text-center py-4 px-6 bg-gradient-to-r from-mk-accent to-mk-secondary border-2 border-purple-500 text-mk-magenta font-bold text-lg font-mono hover:text-white hover:border-mk-primary transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
         style="border-color: #ff00ff; box-shadow: 0 0 4px rgba(255, 0, 255, 0.3);"
         aria-label="Conheça a história de Ultimate Mortal Kombat 3">
        📖 Conheça a História de UMK3
      </a>
    </nav>
  `;
}
