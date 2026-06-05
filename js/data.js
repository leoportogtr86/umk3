// Modelos de dados e funções de carregamento para o UMK3 Blog
// Tipos definidos via JSDoc para documentação e suporte a IDE

/**
 * @typedef {Object} CharacterSummary
 * @property {string} name - Nome do personagem
 * @property {string} slug - Identificador URL-friendly
 * @property {string} imageUrl - Caminho da imagem
 */

/**
 * @typedef {Object} Character
 * @property {string} name - Nome do personagem
 * @property {string} slug - Identificador URL-friendly
 * @property {string} imageUrl - Caminho da imagem
 * @property {SpecialMove[]} specialMoves - Lista de golpes especiais
 * @property {Finisher[]} finishers - Lista de finalizações
 * @property {Combo[]} combos - Lista de combos
 */

/**
 * @typedef {Object} SpecialMove
 * @property {string} name - Nome do golpe
 * @property {string} command - Comando na notação padronizada
 */

/**
 * @typedef {'fatality'|'stage_fatality'|'babality'|'friendship'|'animality'|'brutality'} FinisherType
 */

/**
 * @typedef {'Perto'|'Médio'|'Longe'|'Qualquer Distância'} ExecutionDistance
 */

/**
 * @typedef {Object} Finisher
 * @property {string} name - Nome da finalização
 * @property {FinisherType} type - Tipo da finalização
 * @property {string} command - Comando na notação padronizada
 * @property {ExecutionDistance} distance - Distância de execução
 */

/**
 * @typedef {'Básico'|'Avançado'} ComboCategory
 */

/**
 * @typedef {Object} Combo
 * @property {string} name - Nome do combo
 * @property {string} command - Comando na notação padronizada
 * @property {number} [hits] - Número de hits (1-99)
 * @property {number} [damage] - Percentual de dano (1-100)
 * @property {ComboCategory} category - Categoria do combo
 */

/**
 * @typedef {Object} NotationMapping
 * @property {string} symbol - Símbolo da notação
 * @property {string} description - Descrição do significado
 * @property {string} snesButton - Botão correspondente no SNES
 */

/**
 * Carrega os dados dos personagens a partir do arquivo JSON.
 * @returns {Promise<Character[]>} Array com todos os personagens
 * @throws {Error} Se o fetch falhar ou o JSON for inválido
 */
export async function loadCharacters() {
  const response = await fetch('data/characters.json');

  if (!response.ok) {
    throw new Error(`Erro ao carregar dados dos personagens: ${response.status} ${response.statusText}`);
  }

  const characters = await response.json();
  return characters;
}

/**
 * @typedef {Object} StorySection
 * @property {string} title - Título da seção
 * @property {string} content - Conteúdo textual da seção
 */

/**
 * @typedef {Object} StoryData
 * @property {string} title - Título da página de história
 * @property {string} synopsis - Sinopse geral do enredo
 * @property {StorySection[]} sections - Seções narrativas
 */

/**
 * Carrega os dados da história geral do UMK3.
 * @returns {Promise<StoryData>} Dados da história com título, sinopse e seções
 * @throws {Error} Se o fetch falhar ou o JSON for inválido
 */
export async function loadStory() {
  const response = await fetch('data/story.json');

  if (!response.ok) {
    throw new Error(`Erro ao carregar dados da história: ${response.status} ${response.statusText}`);
  }

  const storyData = await response.json();
  return storyData;
}
