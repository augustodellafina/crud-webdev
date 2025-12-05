/**
 * Mensagens de notificação centralizadas.
 * 
 * Manter mensagens aqui ao invés de hardcoded no código facilita:
 * - Mudanças de texto (só atualiza aqui)
 * - Tradução/internacionalização futura
 * - Consistência nas mensagens
 */
export const NOTIFICATION_MESSAGES = {
  USER_CREATED: 'Utilizador criado com sucesso!',
  USER_UPDATED: 'Utilizador atualizado com sucesso!',
  USER_DELETED: 'Utilizador eliminado com sucesso!',
  VALIDATION_ERROR: 'Por favor, corrija os erros no formulário',
  GENERIC_ERROR: 'Ocorreu um erro. Tente novamente.',
  CONFIRM_DELETE: 'Tem a certeza que deseja eliminar este utilizador?'
};

/**
 * Tipos de notificação disponíveis.
 * 
 * Cada tipo tem estilo visual diferente no componente NotificationContainer.
 * Uso constantes ao invés de strings pra evitar typos.
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};