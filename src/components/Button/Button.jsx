import { forwardRef } from 'react';
import './Button.scss';

/**
 * Componente de botão reutilizável com várias variantes e estados.
 * 
 * Uso forwardRef pra permitir que componentes pais acessem o elemento
 * DOM do botão diretamente (ex: pra focar programaticamente).
 * 
 * Sem forwardRef, ref não funcionaria - React mostraria warning.
 */
const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  width = 'wide', 
  loading = false, 
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  'aria-label': ariaLabel,  // Renomeio a prop pra seguir padrão do HTML
  ...props  // Pega todas as outras props (onClick, etc) e passa pro button
}, ref) => {
  /**
   * Monto classes CSS dinamicamente baseado nas props.
   * 
   * Uso array + filter(Boolean) pra remover valores falsy (false, null, '').
   * Depois join(' ') junta tudo com espaços.
   * 
   * Exemplo: se loading=true, adiciona 'btn--loading' nas classes.
   * Se className='custom', adiciona 'custom' também.
   */
  const buttonClass = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    `${width}`,
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass}
      disabled={disabled || loading}  // Desabilita se disabled OU loading
      aria-label={ariaLabel || (loading ? 'A processar' : undefined)}
      aria-busy={loading}  // Informa screen readers que tá processando
      aria-disabled={disabled || loading}
      {...props}  // Spread das props extras (onClick, onFocus, etc)
    >
      {/* Spinner de loading - só aparece se loading=true */}
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      
      {/* Ícone à esquerda - aria-hidden porque é decorativo */}
      {leftIcon && <span className="btn__icon btn__icon--left" aria-hidden="true">{leftIcon}</span>}
      
      {/* Texto do botão - sempre visível */}
      <span className="btn__text">{children}</span>
      
      {/* Ícone à direita */}
      {rightIcon && <span className="btn__icon btn__icon--right" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
});

// Define nome pra facilitar debug no React DevTools
Button.displayName = 'Button';
export default Button;