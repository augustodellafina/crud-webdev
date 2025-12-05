import { createContext, useContext, useReducer, useEffect } from 'react';
import { UserService } from '../services/userService';

const UserContext = createContext();

/**
 * Estado inicial com dados de exemplo.
 * 
 * Coloquei 2 usuários mockados pra facilitar desenvolvimento e testes.
 * Em produção, isso viria vazio e seria carregado do backend.
 * 
 * createdAt como ISO string pra facilitar ordenação e exibição.
 */
const initialState = {
  users: [
    {
      id: '1',
      name: 'Augusto Chagas',
      userTypes: ['Web Developer', 'UI/UX Designer'],
      email: 'augusto.chagas@crud.com',
      password: '••••••••',
      phone: '+351 916 534 613',
      createdAt: new Date('2025-10-03').toISOString()
    },
    {
      id: '2',
      name: 'João Silva',
      userTypes: ['Project Manager'],
      email: 'joao.silva@crud.com',
      password: '••••••••',
      phone: '+351 934 123 456',
      createdAt: new Date('2025-10-03').toISOString()
    }
  ],
  loading: false,
  error: null,
  currentUser: null
};

// Action types
export const USER_ACTIONS = {
  SET_USERS: 'SET_USERS',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

/**
 * Reducer que gerencia todas as ações de usuário.
 * 
 * Reducer é uma função pura: (state, action) => newState.
 * Nunca modifica o state diretamente - sempre retorna novo objeto.
 * 
 * Isso é crucial pro React detectar mudanças e re-renderizar.
 * Se eu fizesse state.users.push(user), não funcionaria.
 */
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_USERS:
      return { ...state, users: action.payload, loading: false };
      
    /**
     * Adiciona novo usuário ao array.
     * Uso spread [...state.users, novo] ao invés de push().
     */
    case USER_ACTIONS.ADD_USER:
      return { 
        ...state, 
        users: [...state.users, action.payload],
        loading: false,
        error: null
      };
      
    /**
     * Atualiza usuário existente.
     * map() cria novo array, substituindo só o usuário com ID correspondente.
     */
    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(u => 
          u.id === action.payload.id ? action.payload : u
        ),
        currentUser: null,
        loading: false,
        error: null
      };
      
    /**
     * Remove usuário.
     * filter() cria novo array sem o usuário com o ID especificado.
     */
    case USER_ACTIONS.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
        loading: false,
        error: null
      };
      
    case USER_ACTIONS.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
      
    case USER_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case USER_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case USER_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    default:
      return state;
  }
};

/**
 * Componente Provider que envolve a aplicação.
 * 
 * useReducer gerencia o estado com o reducer definido acima.
 * Exporto tanto o state quanto as actions pra facilitar uso.
 */
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  /**
   * Carrega usuários do localStorage quando o componente monta.
   * 
   * useEffect com [] vazio roda só uma vez (componentDidMount).
   * try/catch protege contra JSON inválido no localStorage.
   */
  useEffect(() => {
    const savedUsers = localStorage.getItem('crud-users');
    if (savedUsers) {
      try {
        const users = JSON.parse(savedUsers);
        dispatch({ type: USER_ACTIONS.SET_USERS, payload: users });
      } catch (error) {
        console.error('Error loading users from localStorage:', error);
      }
    }
  }, []);

  /**
   * Salva usuários no localStorage sempre que o array mudar.
   * 
   * useEffect com [state.users] roda toda vez que users muda.
   * Isso mantém localStorage sincronizado com o estado.
   */
  useEffect(() => {
    if (state.users.length > 0) {
      localStorage.setItem('crud-users', JSON.stringify(state.users));
    }
  }, [state.users]);

  /**
   * Ações que os componentes podem chamar.
   * 
   * Cada ação valida os dados com UserService antes de despachar.
   * Se validação falhar, lança erro que pode ser capturado com try/catch.
   */
  const actions = {
    addUser: (userData) => {
      // Valida dados antes de adicionar
      const validation = UserService.validateUser(userData);
      if (!validation.isValid) {
        dispatch({ type: USER_ACTIONS.SET_ERROR, payload: validation.errors });
        throw new Error('Validation failed');
      }
      
      // Cria usuário com ID e timestamp
      const newUser = {
        ...userData,
        id: UserService.generateId(),
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: USER_ACTIONS.ADD_USER, payload: newUser });
    },
    
    updateUser: (id, userData) => {
      const validation = UserService.validateUser(userData);
      if (!validation.isValid) {
        dispatch({ type: USER_ACTIONS.SET_ERROR, payload: validation.errors });
        throw new Error('Validation failed');
      }
      
      const updatedUser = {
        ...userData,
        id,
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: updatedUser });
    },
    
    deleteUser: (id) => {
      dispatch({ type: USER_ACTIONS.DELETE_USER, payload: id });
    },
    
    setCurrentUser: (user) => {
      dispatch({ type: USER_ACTIONS.SET_CURRENT_USER, payload: user });
    },
    
    clearCurrentUser: () => {
      dispatch({ type: USER_ACTIONS.SET_CURRENT_USER, payload: null });
    },
    
    clearError: () => {
      dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
    }
  };

  return (
    <UserContext.Provider value={{ ...state, ...actions }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook customizado pra acessar o contexto de usuários.
 * 
 * Verifica se tá sendo usado dentro do Provider.
 * Se não tiver, lança erro claro ao invés de dar undefined.
 * 
 * Isso ajuda a debugar - se esquecer de envolver com Provider,
 * o erro diz exatamente o que fazer.
 */
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};