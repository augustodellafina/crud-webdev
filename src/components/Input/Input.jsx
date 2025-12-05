import React, { forwardRef } from 'react';
import './Input.scss';

/**
 * Componente de input reutilizável com suporte a label, erro, ícones.
 * 
 * forwardRef permite passar ref pro input interno - é necessário pra
 * focar programaticamente, scroll automático pra erros, etc.
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  size = 'medium',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  id,
  className = '',
  ...props
}, ref) => {
  /**
   * Gera ID único se não for passado.
   * 
   * Preciso de ID pra conectar <label> com <input> via htmlFor/id.
   * Math.random().toString(36) gera string aleatória curta.
   * substr(2, 9) remove o "0." do início e pega 9 caracteres.
   */
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    'input',
    `input--${size}`,
    `input--${variant}`,
    error ? 'input--error' : '',
    disabled ? 'input--disabled' : '',
    fullWidth ? 'input--full-width' : '',
    leftIcon ? 'input--has-left-icon' : '',
    rightIcon ? 'input--has-right-icon' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-field">
      {/**
       * Label opcional - só renderiza se a prop label foi passada.
       * htmlFor conecta label com input (clicar no label foca no input).
       */}
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}
          {/* Asterisco vermelho se required - aria-label pra screen readers */}
          {required && <span className="input-field__required" aria-label="obrigatório">*</span>}
        </label>
      )}
      
      <div className="input-field__wrapper">
        {/* Ícone à esquerda - aria-hidden porque é apenas visual */}
        {leftIcon && (
          <div className="input__icon input__icon--left" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        
        {/**
         * Input principal.
         * 
         * aria-invalid informa screen readers se tem erro.
         * aria-required informa se é obrigatório.
         * aria-describedby conecta com mensagem de erro/ajuda abaixo.
         */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required ? 'true' : 'false'}
          aria-describedby={
            error || helperText ? `${inputId}-message` : undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <div className="input__icon input__icon--right" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/**
       * Mensagem de erro ou texto de ajuda.
       * 
       * role="alert" pra erros - anuncia imediatamente pro screen reader.
       * role="status" pra helperText - anuncia mas sem interromper.
       * aria-live="polite" garante que atualizações sejam anunciadas.
       */}
      {(error || helperText) && (
        <div
          id={`${inputId}-message`}
          className={`input-field__message ${
            error ? 'input-field__message--error' : 'input-field__message--helper'
          }`}
          role={error ? 'alert' : 'status'}
          aria-live="polite"
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;