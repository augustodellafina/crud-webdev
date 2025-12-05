/**
 * Tipos de usuário disponíveis no sistema.
 * 
 * Centralizo aqui pra:
 * - Fácil de adicionar/remover tipos
 * - Garante consistência entre formulário e exibição
 * - Facilita validação (só aceitar tipos desta lista)
 * 
 * value e label separados caso precise de IDs diferentes no futuro.
 * Por enquanto são iguais, mas essa estrutura dá flexibilidade.
 */
export const USER_TYPES = [
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Web Developer', label: 'Web Developer' },
  { value: 'Architect', label: 'Architect' },
  { value: 'UI/UX Designer', label: 'UI/UX Designer' },
  { value: 'QA Engineer', label: 'QA Engineer' }
];