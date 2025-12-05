import './Checkbox.scss';

import React, { useMemo } from 'react';

export function Checkbox({ label, checked, onChange }) {
  /**
   * Gera ID baseado no label.
   * 
   * useMemo garante que o ID só é recalculado se o label mudar.
   * Sem useMemo, geraria novo ID a cada render (ruim pra performance).
   * 
   * replace(/\s/g, '-') troca espaços por hífens.
   * toLowerCase() deixa tudo minúsculo.
   * Ex: "Web Developer" vira "web-developer"
   */
  const id = useMemo(() => label.replace(/\s/g, '-').toLowerCase(), [label]);
  
  return (
    <div className="checkbox-wrapper">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
        id={id}
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
      />
      <label 
        htmlFor={id} 
        className="checkbox-label"
      >
        {label}
      </label>
    </div>
  );
}
