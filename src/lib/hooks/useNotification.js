import { useState, useCallback } from 'react';

/**
 * Hook pra gerenciar notificações toast/snackbar.
 * 
 * Criei isso ao invés de usar biblioteca externa pra ter controle total
 * do comportamento e evitar dependências desnecessárias.
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Adiciona nova notificação.
   * 
   * Gero ID único com timestamp + random pra garantir unicidade.
   * toString(36) converte pra base36 (mais compacto que base10).
   * 
   * Se duration > 0, auto-remove após X milissegundos.
   */
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const notification = {
      id,
      message,
      type,
      createdAt: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    /**
     * Auto-remove após duração.
     * 
     * setTimeout não bloqueia - é assíncrono.
     * Uso dentro de useCallback - preciso ter cuidado com dependências.
     */
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id; // Retorna ID caso precise remover manualmente depois
  }, []);

  // Remove notificação específica por ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Limpa todas as notificações de uma vez
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Métodos de conveniência pra cada tipo de notificação.
   * 
   * Ao invés de fazer addNotification('msg', 'success'),
   * posso fazer showSuccess('msg').
   * 
   * Mais semântico e menos propenso a erro (typo no tipo).
   */
  const showSuccess = useCallback((message, duration) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};