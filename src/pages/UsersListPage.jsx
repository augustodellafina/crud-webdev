import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '../lib/context/UserContext';
import { useNotification } from '../lib/hooks/useNotification';
import { NOTIFICATION_MESSAGES } from '../lib/constants/notifications';
import { Button, Input, Modal } from '../components';
import './UsersListPage.scss';

export function UsersListPage() {
  const navigate = useNavigate();
  const { users, deleteUser } = useUserContext();
  const { showSuccess, showError } = useNotification();
  
  // Estado local pra termo de busca e lista filtrada
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  
  /**
   * Estado do modal de confirmação de exclusão.
   * 
   * Guardo isOpen (boolean) e user (objeto do usuário a deletar).
   * Poderia ter 2 states separados, mas assim fica mais organizado.
   */
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  /**
   * Filtra usuários baseado no termo de busca.
   * 
   * useEffect roda toda vez que users ou searchTerm mudar.
   * Busca em nome, email e tipos de usuário (case-insensitive).
   * 
   * some() retorna true se PELO MENOS UM tipo incluir o termo.
   */
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userTypes?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  /**
   * Abre modal de confirmação ao invés de deletar direto.
   * 
   * Boas práticas de UX - ações destrutivas sempre pedem confirmação.
   * Guardo qual usuário quer deletar no estado do modal.
   */
  const handleDeleteClick = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  /**
   * Confirma exclusão do usuário.
   * 
   * async porque em produção seria chamada HTTP.
   * try/catch captura erros e mostra notificação apropriada.
   * finally garante que o modal fecha mesmo se der erro.
   */
  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.user) {
        deleteUser(deleteModal.user.id);
        showSuccess(NOTIFICATION_MESSAGES.USER_DELETED);
      }
    } catch (error) {
      showError(NOTIFICATION_MESSAGES.GENERIC_ERROR);
      console.error('Error deleting user:', error);
    } finally {
      // Fecha modal independente de sucesso ou erro
      setDeleteModal({ isOpen: false, user: null });
    }
  };

  // Cancela exclusão - só fecha o modal
  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  // Navega pra página de edição com o ID do usuário
  const handleEdit = (user) => {
    navigate(`/user/${user.id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lista de Utilizadores</h1>
      </div>

      <div className="page-content">
        {/* Campo de busca - atualiza searchTerm a cada tecla digitada */}
        <div className="search-bar">
          <Input
            type="text"
            placeholder="Pesquisar utilizadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="medium"
            fullWidth
          />
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/**
               * map() renderiza uma linha (tr) pra cada usuário.
               * 
               * key={user.id} é importante - React usa pra otimizar updates.
               * join(', ') transforma array de tipos em string separada por vírgula.
               */}
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.userTypes?.join(', ')}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/**
           * Empty state - mensagem quando não há usuários.
           * 
           * Diferencia entre "nenhum usuário cadastrado" e "busca sem resultados".
           * Melhora UX - usuário entende o que tá acontecendo.
           */}
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              {users.length === 0 
                ? 'Nenhum utilizador cadastrado ainda.'
                : 'Nenhum utilizador encontrado com os critérios de busca.'
              }
            </div>
          )}
        </div>
      </div>

      {/**
       * Modal de confirmação de exclusão.
       * 
       * Só renderiza quando deleteModal.isOpen === true.
       * deleteModal.user?.name usa optional chaining pra evitar erro se user for null.
       */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        title="Confirmar exclusão"
        size="small"
      >
        <div className="delete-confirmation">
          <p>
            Tem certeza que deseja excluir o usuário <strong>{deleteModal.user?.name}</strong>?
          </p>
          <p className="warning-text">
            Esta ação não pode ser desfeita.
          </p>
          
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
