// Funções utilitárias puras para o UMK3 Blog
// Responsáveis por filtragem, ordenação, formatação e categorização de dados

/**
 * Ordena personagens alfabeticamente pelo nome.
 * Retorna um novo array sem modificar o original.
 * @param {import('./data.js').CharacterSummary[]} characters
 * @returns {import('./data.js').CharacterSummary[]}
 */
export function sortCharactersAlphabetically(characters) {
  return [...characters].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filtra personagens por nome (case-insensitive).
 * Se a query estiver vazia, retorna todos os personagens.
 * @param {import('./data.js').CharacterSummary[]} characters
 * @param {string} query
 * @returns {import('./data.js').CharacterSummary[]}
 */
export function filterCharactersByName(characters, query) {
  if (!query) {
    return characters;
  }

  const normalizedQuery = query.toLowerCase();
  return characters.filter((character) =>
    character.name.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Tokens válidos da notação padronizada de comandos.
 * Inclui direcionais, botões e ações.
 */
const VALID_TOKENS = new Set([
  '↑', '↓', '←', '→',
  'HP', 'LP', 'HK', 'LK',
  'BL', 'RUN'
]);

/**
 * Verifica se um token individual é válido.
 * Um token é válido se for um dos símbolos da notação padronizada
 * ou um nome de golpe (palavra(s) alfabética(s) com espaços).
 * @param {string} token - Token a ser validado
 * @returns {boolean}
 */
function isValidToken(token) {
  const trimmed = token.trim();
  if (trimmed.length === 0) return false;

  // Verifica se é um token padrão da notação
  if (VALID_TOKENS.has(trimmed)) return true;

  // Verifica se é um nome de golpe (palavras alfabéticas, pode conter espaços)
  return /^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(trimmed);
}

/**
 * Valida se um comando segue a notação padronizada.
 * Um comando válido é composto por tokens válidos separados por " , " (sequencial)
 * ou " + " (simultâneo).
 * @param {string} command - Comando a ser validado
 * @returns {boolean}
 */
export function isValidCommand(command) {
  if (typeof command !== 'string' || command.trim().length === 0) {
    return false;
  }

  // Divide primeiro por separador sequencial " , "
  const sequentialParts = command.split(' , ');

  for (const part of sequentialParts) {
    // Cada parte sequencial pode conter tokens simultâneos separados por " + "
    const simultaneousParts = part.split(' + ');

    for (const token of simultaneousParts) {
      if (!isValidToken(token)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gera slug a partir do nome do personagem.
 * Converte para lowercase, substitui espaços por hífens,
 * remove caracteres especiais (parênteses, etc.).
 * @param {string} name - Nome do personagem
 * @returns {string} Slug URL-friendly
 */
export function generateSlug(name) {
  if (typeof name !== 'string') return '';

  return name
    .toLowerCase()
    .replace(/[()]/g, '')       // Remove parênteses
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais exceto espaços e hífens
    .trim()
    .replace(/\s+/g, '-')       // Substitui espaços por hífens
    .replace(/-+/g, '-')        // Remove hífens duplicados
    .replace(/^-|-$/g, '');     // Remove hífens no início e fim
}

/**
 * Busca personagem por slug nos dados.
 * @param {Character[]} characters - Array de personagens
 * @param {string} slug - Slug do personagem a buscar
 * @returns {Character|undefined} Personagem encontrado ou undefined
 */
export function findCharacterBySlug(characters, slug) {
  if (!Array.isArray(characters) || typeof slug !== 'string') {
    return undefined;
  }

  return characters.find(character => character.slug === slug);
}

/**
 * Categoriza combos por número de hits.
 * Básico: até 3 hits. Avançado: 4 ou mais hits.
 * Combos sem campo hits são tratados como básicos (padrão <= 3).
 * @param {import('./data.js').Combo[]} combos
 * @returns {{ basic: import('./data.js').Combo[], advanced: import('./data.js').Combo[] }}
 */
export function categorizeCombos(combos) {
  const basic = [];
  const advanced = [];

  for (const combo of combos) {
    // Combos sem hits definido são considerados básicos
    const hits = combo.hits ?? 0;
    if (hits >= 4) {
      advanced.push(combo);
    } else {
      basic.push(combo);
    }
  }

  return { basic, advanced };
}

/**
 * Agrupa finalizações por tipo. Omite tipos sem finalizações.
 * Tipos válidos: 'fatality', 'babality', 'friendship', 'animality', 'brutality'.
 * @param {import('./data.js').Finisher[]} finishers
 * @returns {Object.<string, import('./data.js').Finisher[]>}
 */
export function groupFinishersByType(finishers) {
  const grouped = {};

  for (const finisher of finishers) {
    const { type } = finisher;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(finisher);
  }

  return grouped;
}
