/**
 * Módulo de gerenciamento do modo de exibição de comandos.
 * Responsável pelo mapeamento bidirecional entre notação de jogos de luta
 * e botões reais do controle SNES, persistência de preferência do usuário
 * e aplicação do modo no DOM.
 */

/** @typedef {'notation' | 'snes'} DisplayMode */

/**
 * Mapa de conversão Notação → SNES.
 * Cada chave é um token de notação de jogos de luta e o valor é o botão
 * correspondente no controle Super Nintendo.
 * @type {Object.<string, string>}
 */
export const NOTATION_TO_SNES = {
  HP: 'Y',
  LP: 'X',
  HK: 'B',
  LK: 'A',
  BL: 'R',
  RUN: 'L',
};

/**
 * Mapa de conversão SNES → Notação (inverso de NOTATION_TO_SNES).
 * Cada chave é um botão do controle SNES e o valor é o token de notação
 * correspondente.
 * @type {Object.<string, string>}
 */
export const SNES_TO_NOTATION = {
  Y: 'HP',
  X: 'LP',
  B: 'HK',
  A: 'LK',
  R: 'BL',
  L: 'RUN',
};

/** Chave usada no localStorage para armazenar a preferência do usuário */
const STORAGE_KEY = 'commandDisplayMode';

/** Conjunto de modos válidos aceitos pelo sistema */
const VALID_MODES = new Set(['notation', 'snes']);

/**
 * Lê o modo de exibição do localStorage.
 * Retorna 'notation' como fallback nos seguintes cenários:
 * - localStorage não disponível
 * - Leitura lança exceção
 * - Valor armazenado não é um modo válido ("notation" ou "snes")
 * - Nenhum valor armazenado (null)
 * @returns {DisplayMode} Modo de exibição ativo
 */
export function getDisplayMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_MODES.has(stored)) {
      return stored;
    }
  } catch {
    // Falha silenciosa — localStorage pode não estar disponível
  }
  return 'notation';
}

/**
 * Persiste o modo de exibição no localStorage.
 * Falha silenciosamente se localStorage não estiver disponível ou se a
 * escrita lançar exceção (ex: quota excedida).
 * @param {DisplayMode} mode - Modo a ser persistido
 */
export function setDisplayMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Falha silenciosa — modo funciona na sessão atual sem persistência
  }
}

/**
 * Traduz um token de botão para o modo de exibição especificado.
 * Tokens direcionais (↑, ↓, ←, →), separadores (, +) e quaisquer tokens
 * não reconhecidos são retornados sem alteração (passthrough).
 * @param {string} token - Token original (ex: "HP", "Y", "↑", "+")
 * @param {DisplayMode} targetMode - Modo alvo da tradução
 * @returns {string} Token traduzido ou original se não for token de botão
 */
export function translateToken(token, targetMode) {
  if (targetMode === 'snes') {
    // Converte de notação para SNES (se o token existir no mapa)
    return NOTATION_TO_SNES[token] || token;
  }

  if (targetMode === 'notation') {
    // Converte de SNES para notação (se o token existir no mapa)
    return SNES_TO_NOTATION[token] || token;
  }

  // Modo desconhecido — retorna token inalterado
  return token;
}

/**
 * Aplica o modo de exibição a todos os elementos com atributo [data-token]
 * dentro do container especificado. Atualiza o textContent de cada elemento
 * usando translateToken com base no valor armazenado em data-token
 * (que sempre contém o token na notação original).
 * @param {DisplayMode} mode - Modo a ser aplicado
 * @param {HTMLElement} container - Container raiz (ex: document.getElementById('app'))
 */
export function applyDisplayMode(mode, container) {
  if (!container) return;

  const elements = container.querySelectorAll('[data-token]');
  elements.forEach((element) => {
    const originalToken = element.dataset.token;
    element.textContent = translateToken(originalToken, mode);
  });
}
