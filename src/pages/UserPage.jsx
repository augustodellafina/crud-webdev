import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../lib/context/UserContext';
import { useForm, validationRules } from '../lib/hooks/useForm';
import { useNotification } from '../lib/hooks/useNotification';
import { USER_TYPES } from '../lib/constants/userTypes';
import { NOTIFICATION_MESSAGES } from '../lib/constants/notifications';
import CollapsibleSection from '../components/CollapsibleSection/CollapsibleSection';
import { Button, Input } from '../components';
import { Checkbox } from '../components/Checkbox/Checkbox';

export function UserPage() {
  /**
   * Sistema de roteamento dinâmico pra suportar criação e edição.
   * 
   * Se a URL tiver /user/:id, significa que estou editando um usuário existente.
   * Se for só /user, estou criando um novo.
   * 
   * useParams pega os parâmetros da URL - nesse caso, o ID se existir.
   * useNavigate é pra navegar programaticamente depois de salvar.
   */
  const { id } = useParams();
  const navigate = useNavigate();
  
  /**
   * Acesso ao contexto global de usuários.
   * 
   * Uso Context API pra evitar prop drilling - não preciso passar
   * users/addUser/updateUser através de 3-4 níveis de componentes.
   * 
   * Desestruturei só o que preciso aqui ao invés de pegar tudo.
   */
  const { users, addUser, updateUser } = useUserContext();
  const { showSuccess, showError } = useNotification();
  
  /**
   * Busca o usuário atual se tiver ID na URL.
   * 
   * find() retorna o primeiro elemento que satisfaz a condição.
   * Se não encontrar ou se id for undefined, currentUser fica null.
   * 
   * Essa lógica determina se estou no modo criação ou edição.
   */
  const currentUser = id ? users.find(u => u.id === id) : null;
  
  // Estado local pra controlar o ID do usuário sendo editado
  // Se currentUser existe, pego o ID dele. Se não, null = modo criação
  const [editingId, setEditingId] = useState(currentUser?.id || null);

  /**
   * Valores iniciais do formulário.
   * 
   * Se estou editando (currentUser existe), preencho os campos com os dados dele.
   * Se estou criando (currentUser é null), começo com campos vazios.
   * 
   * O operador || funciona como fallback - se currentUser.name for undefined,
   * usa string vazia. Isso evita o warning "uncontrolled to controlled input"
   * do React (quando um campo começa undefined e depois vira string).
   */
  const initialValues = {
    name: currentUser?.name || '',
    userTypes: currentUser?.userTypes || [],
    email: currentUser?.email || '',
    password: currentUser?.password || '',
    phone: currentUser?.phone || ''
  };

  /**
   * Regras de validação aplicadas aos campos.
   * 
   * validationRules vem do hook useForm - são funções reutilizáveis
   * que eu exportei junto com o hook pra não repetir lógica.
   * 
   * Cada campo pode ter múltiplas regras (ex: email é required E tem formato válido).
   * O hook executa elas em ordem e para no primeiro erro.
   */
  const formValidationRules = {
    name: [validationRules.required],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.required, validationRules.phone]
  };

  /**
   * Hook customizado que centraliza toda a lógica de formulário.
   * 
   * Isso evita ter 5+ useState pra cada campo, onChange handlers manuais,
   * validação espalhada, etc. Tudo fica encapsulado.
   * 
   * getFieldProps é especialmente útil - retorna tudo que o Input precisa:
   * { name, value, onChange, onBlur, error }
   * 
   * Então no JSX eu só faço {...getFieldProps('name')} ao invés de
   * passar 5 props manualmente.
   */
  const {
    values,
    setValue,
    errors,
    isSubmitting,
    handleSubmit,
    resetForm,
    getFieldProps
  } = useForm(initialValues, formValidationRules);

  /**
   * Handler pra checkboxes de tipo de usuário.
   * 
   * Como userTypes é um array (pode selecionar múltiplos), preciso
   * adicionar/remover do array conforme clica.
   * 
   * Se o tipo já está no array, uso filter pra tirar.
   * Se não está, uso spread pra adicionar mantendo os existentes.
   * 
   * Importante: sempre crio um NOVO array ao invés de modificar o existente.
   * Isso é essencial pro React detectar mudança e re-renderizar.
   * Se eu fizesse currentTypes.push(type), não funcionaria.
   */
  const handleUserTypeChange = (type) => {
    const currentTypes = values.userTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)  // Remove se já existe
      : [...currentTypes, type];               // Adiciona se não existe
    
    setValue('userTypes', newTypes);
  };

  /**
   * Handler principal de submissão.
   * 
   * Marquei como async mesmo que as operações atuais sejam síncronas.
   * Isso porque quando eu integrar com API real (backend), addUser e updateUser
   * vão virar chamadas HTTP que retornam Promises. Deixei já preparado.
   * 
   * Fluxo completo:
   * 1. Monto objeto final com dados do form + ID
   * 2. Se editingId existe, atualizo usuário existente
   * 3. Se não, crio novo
   * 4. Mostro notificação de sucesso
   * 5. Navego de volta pra lista (só se veio via URL com ID)
   * 6. Se der erro em qualquer ponto, mostro mensagem genérica pro usuário
   *    mas mostro detalhes no console pra eu poder debugar
   */
  const onSubmit = async (formData) => {
    try {
      // Spread operator (...) copia todos os campos do formData
      // Depois adiciono/sobrescrevo o ID
      const userData = {
        ...formData,
        id: editingId || Date.now().toString() // Gera ID se for criação
      };

      if (editingId) {
        // Modo edição
        updateUser(editingId, userData);
        showSuccess(NOTIFICATION_MESSAGES.USER_UPDATED);
        
        /**
         * Se veio de /user/:id (tem id na URL), significa que abriu
         * a página de edição diretamente. Nesse caso, volto pra lista.
         * 
         * Se não tem id na URL, pode ser edição inline de outro lugar.
         * Nesse caso não navego automaticamente.
         */
        if (id) {
          navigate('/users');
          return; // Para aqui pra não executar código abaixo
        }
      } else {
        // Modo criação
        addUser(userData);
        showSuccess(NOTIFICATION_MESSAGES.USER_CREATED);
        
        /**
         * Após criar, reseto o form pra facilitar criar outro usuário
         * logo em seguida sem precisar limpar tudo manualmente.
         */
        resetForm();
        setEditingId(null);
      }
    } catch (error) {
      /**
       * Se algo der errado (validação falhar no Context, futuramente
       * erro de rede), mostro mensagem genérica pro usuário.
       * 
       * Não exponho detalhes técnicos na UI por segurança e UX,
       * mas logo no console pra eu conseguir debugar.
       */
      showError(NOTIFICATION_MESSAGES.GENERIC_ERROR);
      console.error('Error saving user:', error);
    }
  };

  /**
   * Cancela a operação atual.
   * 
   * Comportamento varia conforme contexto:
   * - Se veio via URL com ID: volta pra lista (navegação direta)
   * - Se está criando: só limpa o form (fica na mesma página)
   */
  const handleCancel = () => {
    if (id) {
      // Veio de URL com ID - volta pra lista
      navigate('/users');
    } else {
      // está criando - só reseta o form
      resetForm();
      setEditingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{editingId ? 'Editar Utilizador' : 'Novo Utilizador'}</h1>
      </div>

      <div className="page-content">
        {/**
         * handleSubmit do useForm faz a validação automática antes
         * de chamar onSubmit. Só chama onSubmit se tudo passar.
         * 
         * Isso evita código duplicado de validação aqui.
         */}
        <form className="user-form" onSubmit={handleSubmit(onSubmit)}>
          <CollapsibleSection title="Informações Básicas" isInitiallyOpen={true}>
            {/**
             * getFieldProps retorna tudo que o Input precisa num objeto:
             * { name: 'name', value: values.name, onChange, onBlur, error }
             * 
             * O spread (...) expande isso como props individuais.
             * Muito mais limpo do que passar prop por prop.
             */}
            <Input
              label="Nome"
              placeholder="Nome completo"
              required
              {...getFieldProps('name')}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Tipo de utilizador" isInitiallyOpen={true}>
            <div className="flex flex-col gap-2 md:gap-3">
              {/**
               * Renderizo um checkbox pra cada tipo disponível.
               * 
               * map() percorre o array USER_TYPES e retorna um
               * componente Checkbox pra cada item.
               * 
               * key é obrigatório em listas - React usa pra otimizar
               * re-renders e saber qual elemento mudou.
               */}
              {USER_TYPES.map(type => (
                <Checkbox
                  key={type.value}
                  label={type.label}
                  checked={(values.userTypes || []).includes(type.value)}
                  onChange={() => handleUserTypeChange(type.value)}
                />
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Contacto" isInitiallyOpen={true}>
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              required
              {...getFieldProps('email')}
            />
            
            <Input
              type="password"
              label="Palavra-passe"
              placeholder="••••••••"
              {...getFieldProps('password')}
            />
            
            <Input
              type="tel"
              label="Telefone"
              placeholder="+351"
              required
              {...getFieldProps('phone')}
            />
          </CollapsibleSection>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            {/**
             * Enquanto está submetendo (isSubmitting), desabilito o botão
             * e mostro loading spinner.
             * 
             * Isso previne double-submit (usuário clicar 2x rapidamente)
             * e dá feedback visual de que está processando.
             */}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              GUARDAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
