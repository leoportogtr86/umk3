// Router baseado em hash para navegação SPA do UMK3 Blog
// Escuta o evento 'hashchange' e delega a renderização via callback

/**
 * Obtém a rota atual a partir do hash da URL.
 * Analisa window.location.hash e retorna um objeto com a página e parâmetros extraídos.
 * @returns {{ page: string, params: Object }}
 */
export function getCurrentRoute() {
  const hash = window.location.hash;

  // Sem hash ou hash vazio ou apenas "#/" → página inicial
  if (!hash || hash === '#' || hash === '#/') {
    return { page: 'home', params: {} };
  }

  // Remove o "#" inicial para processar o path
  const path = hash.slice(1);

  // Rota da página de história: /story
  if (path === '/story') {
    return { page: 'story', params: {} };
  }

  // Rota de personagem: /personagem/:slug
  const characterMatch = path.match(/^\/personagem\/([^/]+)$/);
  if (characterMatch) {
    return { page: 'character', params: { slug: characterMatch[1] } };
  }

  // Qualquer outra rota → 404
  return { page: 'notFound', params: {} };
}

/**
 * Navega para uma rota alterando o hash da URL.
 * @param {string} path - Caminho da rota, ex: '/personagem/scorpion' ou '/'
 */
export function navigateTo(path) {
  window.location.hash = '#' + path;
}

/**
 * Inicializa o router baseado em hash.
 * Chama o callback imediatamente com a rota atual e escuta mudanças de hash.
 * @param {function} renderCallback - Função chamada com a rota atual ({ page, params })
 * @returns {function} Função de cleanup para remover o listener do hashchange
 */
export function initRouter(renderCallback) {
  // Renderiza a rota atual na inicialização
  renderCallback(getCurrentRoute());

  // Handler para mudanças de hash
  const onHashChange = () => {
    renderCallback(getCurrentRoute());
  };

  // Escuta o evento hashchange
  window.addEventListener('hashchange', onHashChange);

  // Retorna função de cleanup que remove o listener
  return () => {
    window.removeEventListener('hashchange', onHashChange);
  };
}
