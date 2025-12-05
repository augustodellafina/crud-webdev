import { useState, useCallback } from 'react';

/**
 * Hook customizado pra gerenciar formulários de forma centralizada.
 * 
 * Criei isso porque tava repetindo muito código de formulário em vários lugares:
 * - Estado pra cada campo (useState)
 * - Handlers de onChange/onBlur
 * - Lógica de validação
 * - Controle de erros
 * 
 * Agora eu só passo valores iniciais e regras de validação, e o hook
 * retorna tudo pronto. Muito mais DRY (Don't Repeat Yourself).
 */
export const useForm = (initialValues = {}, validationRules = {}) => {
  // Estado dos valores do form (ex: { name: 'João', email: 'joao@email.com' })
  const [values, setValues] = useState(initialValues);
  
  // Erros de validação (ex: { email: 'Email inválido' })
  const [errors, setErrors] = useState({});
  
  /**
   * Campos que o usuário já "tocou" (deu focus e blur).
   * 
   * Uso isso pra decidir quando mostrar erro. Não quero mostrar erro
   * em campo que o usuário ainda nem chegou.
   * 
   * Só mostro erro se touched[campo] === true.
   */
  const [touched, setTouched] = useState({});
  
  // Flag pra desabilitar botões durante submit (previne double-submit)
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Atualiza valor de um campo específico.
   * 
   * useCallback serve pra memoizar a função - ela só é recriada se
   * 'errors' mudar. Isso evita re-renders desnecessários em componentes
   * filhos que recebem essa função como prop.
   * 
   * Quando atualiza valor, automaticamente limpa o erro daquele campo
   * (se houver). Melhora UX - assim que o usuário começa a corrigir,
   * o erro some.
   */
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,      // Mantém todos os campos existentes
      [name]: value // Sobrescreve só o campo que mudou
    }));

    // Se tinha erro nesse campo, limpa
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  /**
   * Handler genérico pra eventos onChange de inputs.
   * 
   * Extraio name, value, type e checked do evento.
   * Se for checkbox, uso 'checked'. Se não, uso 'value'.
   * 
   * Isso permite usar o mesmo handler pra qualquer tipo de input.
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValue(name, type === 'checkbox' ? checked : value);
  }, [setValue]);

  /**
   * Quando o usuário sai do campo (blur), marco como "touched"
   * e rodo validação.
   * 
   * Validar no blur ao invés de onChange melhora UX - não fica
   * mostrando erro enquanto o usuário ainda tá digitando.
   * Só valida quando ele termina e vai pro próximo campo.
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Marca campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Se tem regras de validação pra esse campo, valida
    if (validationRules[name]) {
      validateField(name, values[name]);
    }
  }, [values, validationRules]);

  /**
   * Valida um campo específico.
   * 
   * Pego as regras desse campo e executo uma por uma.
   * Se alguma retornar erro, paro e mostro aquele erro.
   * Se todas passarem, limpo qualquer erro existente.
   * 
   * Regras são funções que recebem (value, allValues) e retornam
   * null (sucesso) ou string com mensagem de erro.
   */
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Executa cada regra em ordem
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) {
        // Primeira regra que falhar, seta o erro e para
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
        return error;
      }
    }

    // Se chegou aqui, tudo passou - limpa erro
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
    return null;
  }, [values, validationRules]);

  /**
   * Valida TODOS os campos de uma vez.
   * 
   * Uso isso no submit - preciso garantir que tudo tá válido
   * antes de enviar.
   * 
   * Percorro todos os campos que têm regras, valido cada um,
   * e acumulo os erros num objeto. No final retorno true/false.
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const fieldValue = values[fieldName];
      const rules = validationRules[fieldName];

      // Executa regras desse campo
      for (const rule of rules) {
        const error = rule(fieldValue, values);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
          break; // Para no primeiro erro
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Wrapper do submit que adiciona validação automática.
   * 
   * Essa função retorna outra função (currying) que vai ser
   * usada no onSubmit do form.
   * 
   * Fluxo:
   * 1. Previne comportamento padrão do form (recarregar página)
   * 2. Marca todos os campos como touched (pra mostrar todos os erros)
   * 3. Valida tudo
   * 4. Se válido, chama a função onSubmit que foi passada
   * 5. Controla estado de isSubmitting (loading)
   */
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();
      
      /**
       * Marca todos os campos como touched.
       * 
       * reduce() transforma o array de chaves em objeto.
       * Inicio com {} vazio e vou adicionando { campo: true } pra cada campo.
       */
      const allTouched = Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Valida form
      const isValid = validateForm();
      
      // Se inválido, para aqui sem chamar onSubmit
      if (!isValid) {
        return;
      }

      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        // finally garante que isSubmitting volta a false mesmo se der erro
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm, validationRules]);

  /**
   * Helper que retorna todas as props que um Input precisa.
   * 
   * Ao invés de fazer isso manualmente em cada input:
   * <Input name="email" value={values.email} onChange={handleChange} ... />
   * 
   * Eu faço:
   * <Input {...getFieldProps('email')} />
   * 
   * Muito mais limpo e DRY. Só mostro erro se o campo foi tocado.
   */
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : null
  }), [values, handleChange, handleBlur, errors, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    handleSubmit,
    getFieldProps,
    // Valores computados úteis pra desabilitar botões, etc
    hasErrors: Object.values(errors).some(error => error !== null),
    isValid: Object.keys(validationRules).length === 0 || 
             Object.keys(validationRules).every(key => !errors[key])
  };
};

/**
 * Regras de validação reutilizáveis.
 * 
 * Cada função recebe (value, allValues) e retorna null (válido) ou string (erro).
 * Exporto junto com o hook pra facilitar o uso.
 */
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo é obrigatório';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Email inválido';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const cleanPhone = value.replace(/\D/g, '');
    return cleanPhone.length >= 10 && phoneRegex.test(value) ? null : 'Telefone inválido';
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Mínimo de ${min} caracteres`;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Máximo de ${max} caracteres`;
  }
};