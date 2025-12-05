import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './Modal.scss';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  ...props 
}) => {
  const modalRef = useRef(null);
  // Guardo qual elemento tava com foco antes de abrir o modal
  // Pra restaurar o foco quando fechar (melhora acessibilidade)
  const previousActiveElement = useRef(null);

  /**
   * Implementa focus trap e gerenciamento de foco.
   * 
   * Focus trap significa que quando o modal tá aberto, o Tab só navega
   * entre elementos DENTRO do modal. Não deixa o foco escapar pra página.
   * 
   * Isso é crucial pra acessibilidade - usuários de teclado/screen reader
   * não devem conseguir interagir com elementos escondidos atrás do modal.
   */
  useEffect(() => {
    if (isOpen) {
      // Guarda qual elemento tinha foco antes de abrir
      previousActiveElement.current = document.activeElement;
      
      /**
       * Foca no primeiro elemento focusável do modal.
       * 
       * querySelectorAll pega todos os elementos que podem receber foco.
       * Não incluo [tabindex="-1"] porque esses são explicitamente
       * removidos da navegação por teclado.
       */
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      /**
       * Handler que implementa o focus trap propriamente dito.
       * 
       * Quando o usuário aperta Tab:
       * - Se tá no último elemento e aperta Tab: volta pro primeiro
       * - Se tá no primeiro e aperta Shift+Tab: vai pro último
       * 
       * Isso cria um loop de navegação dentro do modal.
       */
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (!focusableElements || focusableElements.length === 0) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      
      // Cleanup quando o modal fecha ou componente desmonta
      return () => {
        document.removeEventListener('keydown', handleTabKey);
        // Restaura foco pro elemento que tinha antes
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Se não tá aberto, não renderiza nada (economiza processamento)
  if (!isOpen) return null;

  // Só fecha se clicar no overlay (fundo escuro), não no conteúdo do modal
  // e.target === e.currentTarget garante que clicou exatamente no overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Permite fechar modal com tecla Escape (padrão de acessibilidade)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Monta classes CSS dinamicamente baseado nas props
  const modalClasses = [
    'modal',
    `modal--${size}`,
    className
  ].filter(Boolean).join(' ');

  /**
   * Usa ReactDOM.createPortal pra renderizar o modal no body.
   * 
   * Isso resolve problemas de z-index e overflow:hidden de elementos pai.
   * O modal sempre aparece "por cima" de tudo, independente de onde
   * o componente Modal foi chamado na árvore de componentes.
   * 
   * Sem portal, se eu usar Modal dentro de um div com overflow:hidden,
   * o modal seria cortado. Com portal, ele sempre renderiza no body.
   */
  return ReactDOM.createPortal(
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div 
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className="modal__header">
          {title && (
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
          )}
          
          {showCloseButton && (
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Fechar modal"
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;