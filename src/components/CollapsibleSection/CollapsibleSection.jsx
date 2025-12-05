import { useState, useId } from 'react';
import './CollapsibleSection.scss';

function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  /**
   * useId() é um hook do React 18 que gera IDs únicos automaticamente.
   * 
   * Isso é melhor que gerar IDs manualmente (Math.random, etc) porque:
   * - Garante unicidade mesmo com múltiplos componentes
   * - Funciona com server-side rendering (SSR)
   * - IDs são consistentes entre cliente e servidor
   * 
   * Uso pra conectar o botão com o conteúdo via aria-controls/aria-labelledby.
   */
  const contentId = useId();
  const titleId = useId();

  return (
    <div className="collapsible-section">
      {/**
       * Botão ao invés de div pra acessibilidade.
       * 
       * Botões são focusáveis por teclado e anunciam corretamente
       * pra screen readers que são clicáveis.
       * 
       * aria-expanded informa se tá aberto/fechado (importante pra screen readers)
       * aria-controls conecta o botão com a região que ele controla
       */}
      <button
        type="button"
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        id={titleId}
      >
        <h3>{title}</h3>
        <span className={`icon ${isOpen ? 'open' : ''}`} aria-hidden="true">
          {isOpen ? 'Fechar' : 'Abrir'}
        </span>
      </button>
      {/**
       * Só renderiza conteúdo se isOpen === true.
       * 
       * Poderia usar CSS (display: none), mas renderizar condicionalmente
       * é melhor pra performance - não processa JSX desnecessário.
       * 
       * role="region" + aria-labelledby ajuda screen readers a entenderem
       * que isso é uma área de conteúdo relacionada ao título.
       */}
      {isOpen && (
        <div 
          className="collapsible-content" 
          id={contentId}
          role="region"
          aria-labelledby={titleId}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
export { CollapsibleSection };
