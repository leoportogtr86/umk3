// Ponto de entrada da aplicação UMK3 Blog
// Inicializa o router, carrega dados e gerencia a lógica de busca

import { initRouter } from './router.js';
import { loadCharacters, loadStory } from './data.js';
import {
  sortCharactersAlphabetically,
  filterCharactersByName,
  findCharacterBySlug,
} from './utils.js';
import {
  renderHomePage,
  renderCharacterPage,
  renderNotFound,
  renderError,
  renderRosterGrid,
  renderEmptyState,
  renderStoryPage,
} from './components.js';
import { getDisplayMode, setDisplayMode, applyDisplayMode } from './displayMode.js';

// Referência ao container principal da aplicação
const app = document.getElementById('app');

// Estado global: personagens ordenados alfabeticamente
let sortedCharacters = [];

// Estado global para dados da história (carregado sob demanda com cache)
let storyData = null;

/**
 * Callback de renderização chamado pelo router a cada mudança de rota.
 * Decide qual página exibir com base na rota atual.
 * @param {{ page: string, params: Object }} route - Rota atual com página e parâmetros
 */
function renderRoute(route) {
  const { page, params } = route;

  if (page === 'home') {
    app.innerHTML = renderHomePage(sortedCharacters);
    attachSearchListener();
  } else if (page === 'character') {
    const character = findCharacterBySlug(sortedCharacters, params.slug);
    if (character) {
      // Obtém o modo de exibição atual (notation ou snes) para renderizar os tokens corretamente
      const mode = getDisplayMode();
      app.innerHTML = renderCharacterPage(character, mode);
      attachToggleListener();
      attachImageErrorHandlers();
    } else {
      app.innerHTML = renderNotFound();
    }
  } else if (page === 'story') {
    renderStoryRoute();
  } else {
    app.innerHTML = renderNotFound();
  }
}

/**
 * Carrega e renderiza a página de história geral do UMK3.
 * Utiliza cache em memória para evitar requisições repetidas.
 * Exibe mensagem de erro se o carregamento falhar.
 */
async function renderStoryRoute() {
  try {
    if (!storyData) {
      storyData = await loadStory();
    }
    app.innerHTML = renderStoryPage(storyData);
  } catch (error) {
    app.innerHTML = renderError('Erro ao carregar a história do jogo. Tente recarregar a página.');
  }
}

/**
 * Anexa o listener de busca ao input da barra de pesquisa.
 * Filtra personagens pelo nome e re-renderiza apenas a grade (não a página inteira).
 */
function attachSearchListener() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value;
    const filtered = filterCharactersByName(sortedCharacters, query);

    // Localiza o container da grade para re-renderizar apenas ela
    const gridContainer = app.querySelector('main');
    if (gridContainer) {
      if (filtered.length === 0 && query.trim().length > 0) {
        gridContainer.innerHTML = renderEmptyState('Nenhum personagem encontrado');
      } else {
        gridContainer.innerHTML = renderRosterGrid(filtered);
      }
    }
  });
}

/**
 * Classes CSS para o botão ativo do toggle.
 */
const TOGGLE_ACTIVE_CLASSES = ['bg-mk-primary', 'text-white', 'font-bold', 'shadow-md'];

/**
 * Classes CSS para o botão inativo do toggle.
 */
const TOGGLE_INACTIVE_CLASSES = ['bg-gray-700', 'text-gray-200', 'hover:bg-gray-600'];

/**
 * Anexa listener ao toggle de modo de exibição via delegação de eventos.
 * Ao clicar em um botão do toggle, persiste a escolha, aplica o novo modo
 * no DOM (sem reload), atualiza aria-pressed e anuncia a mudança para
 * leitores de tela via região aria-live.
 * A posição de rolagem é preservada pois usamos applyDisplayMode (manipulação
 * DOM in-place) em vez de re-renderizar a página inteira.
 */
function attachToggleListener() {
  const toggleGroup = app.querySelector('[role="group"][aria-label="Alternar modo de exibição de comandos"]');
  if (!toggleGroup) return;

  toggleGroup.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;

    const newMode = button.dataset.mode;
    const currentMode = getDisplayMode();
    if (newMode === currentMode) return;

    // Persiste a preferência no localStorage
    setDisplayMode(newMode);

    // Aplica o modo a todos os tokens [data-token] no DOM
    applyDisplayMode(newMode, app);

    // Atualiza aria-pressed nos botões do toggle
    toggleGroup.querySelectorAll('[data-mode]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.mode === newMode ? 'true' : 'false');
    });

    // Atualiza estilos visuais dos botões (ativo/inativo)
    toggleGroup.querySelectorAll('[data-mode]').forEach(btn => {
      if (btn.dataset.mode === newMode) {
        btn.classList.remove(...TOGGLE_INACTIVE_CLASSES);
        btn.classList.add(...TOGGLE_ACTIVE_CLASSES);
      } else {
        btn.classList.remove(...TOGGLE_ACTIVE_CLASSES);
        btn.classList.add(...TOGGLE_INACTIVE_CLASSES);
      }
    });

    // Anuncia mudança para leitores de tela via região aria-live
    const announcement = document.getElementById('mode-announcement');
    if (announcement) {
      announcement.textContent = newMode === 'notation'
        ? 'Modo Notação ativado'
        : 'Modo Botões SNES ativado';
    }
  });
}

/**
 * Anexa handlers de erro para imagens na página de personagem.
 * Substitui imagens que falharam ao carregar por um placeholder com o nome.
 */
function attachImageErrorHandlers() {
  const images = app.querySelectorAll('img');
  images.forEach((img) => {
    img.addEventListener('error', function handleImageError() {
      // Evita loop infinito removendo o handler
      this.removeEventListener('error', handleImageError);
      const altText = this.alt || 'Imagem indisponível';
      const placeholder = document.createElement('div');
      placeholder.className = 'w-48 h-48 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-lg';
      placeholder.textContent = altText;
      this.replaceWith(placeholder);
    });
  });
}

/**
 * Inicializa a aplicação ao carregar o DOM.
 * Carrega os dados dos personagens, ordena e inicializa o router.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Carrega e ordena os personagens
    const characters = await loadCharacters();
    sortedCharacters = sortCharactersAlphabetically(characters);

    // Inicializa o router com o callback de renderização
    initRouter(renderRoute);
  } catch (error) {
    // Exibe mensagem de erro com botão de recarregar em caso de falha no fetch
    app.innerHTML = renderError('Erro ao carregar dados dos personagens. Tente recarregar a página.');
  }
});
