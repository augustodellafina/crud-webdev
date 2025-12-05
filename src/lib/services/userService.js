/**
 * Service layer pra lógica de negócio relacionada a usuários.
 * 
 * Criei isso como classe com métodos estáticos pra:
 * - Separar lógica de validação dos componentes (Separation of Concerns)
 * - Facilitar testes unitários (posso testar validação independente da UI)
 * - Reutilizar em múltiplos lugares sem duplicar código
 * 
 * Métodos estáticos porque não preciso de instância - são funções puras.
 */
export class UserService {
  /**
   * Valida todos os campos de um usuário.
   * 
   * Retorna objeto com isValid (boolean) e errors (objeto com mensagens).
   * Preferi retornar objeto ao invés de lançar erro pra ter mais controle.
   */
  static validateUser(userData) {
    const errors = {};
    
    // trim() remove espaços nas pontas - "  " não é nome válido
    if (!userData.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!userData.email?.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!this.isValidEmail(userData.email)) {
      errors.email = 'Email deve ter formato válido';
    }
    
    if (!userData.phone?.trim()) {
      errors.phone = 'Telefone é obrigatório';
    } else if (!this.isValidPhone(userData.phone)) {
      errors.phone = 'Telefone deve ter formato válido';
    }
    
    if (!userData.userTypes?.length) {
      errors.userTypes = 'Selecione pelo menos um tipo de utilizador';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  /**
   * Valida formato de email com regex.
   * 
   * Regex simples mas eficaz: [algo]@[algo].[algo]
   * Não é perfeita (email real pode ser mais complexo),
   * mas suficiente pra 99% dos casos.
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Valida telefone português.
   * 
   * Aceita +351 opcional e 9 dígitos.
   * replace(/\s/g, '') remove espaços pra validar só os números.
   */
  static isValidPhone(phone) {
    // Portuguese phone format validation
    const phoneRegex = /^(\+351)?[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  /**
   * Formata usuário pra exibição.
   * 
   * Adiciona campos computados sem modificar o original.
   * join(', ') transforma array ['Dev', 'Designer'] em string "Dev, Designer".
   */
  static formatUserForDisplay(user) {
    return {
      ...user,
      userTypesDisplay: user.userTypes.join(', '),
      phoneDisplay: this.formatPhone(user.phone)
    };
  }
  
  /**
   * Formata telefone pra exibição bonita.
   * 
   * +351 xxx xxx xxx ao invés de +351xxxxxxxxx.
   * replace(/\D/g, '') remove tudo que não é dígito.
   * slice() pega pedaços da string pra formatar.
   */
  static formatPhone(phone) {
    // Format: +351 xxx xxx xxx
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('351')) {
      const number = cleaned.slice(3);
      return `+351 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
    return phone;
  }
  
  /**
   * Gera ID único.
   * 
   * Uso timestamp + random pra garantir unicidade.
   * toString(36) converte pra base36 (letras + números) = mais compacto.
   * substring(2, 7) pega 5 caracteres do random.
   * 
   * Exemplo de ID gerado: "l8xk2y3abc"
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}