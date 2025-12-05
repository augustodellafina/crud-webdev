import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';

// Array de itens do menu - facilita adicionar/remover itens sem mexer no JSX
const menuItems = [
  { label: 'Início', link: '/' },
  { label: 'Novo Utilizador', link: '/user' },
  { label: 'Lista de Utilizadores', link: '/users' }
];

export function Sidebar() {
  /**
   * useLocation retorna a localização atual (URL).
   * Uso pra saber qual link tá ativo e destacar no menu.
   */
  const location = useLocation();

  /**
   * Verifica se um link tá ativo baseado na URL atual.
   * 
   * Tratamento especial pra home ('/') - só marca ativo se for EXATAMENTE '/'.
   * Senão '/user' também marcaria '/' como ativo (porque começa com '/').
   */
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    /**
     * aside com role="navigation" pra acessibilidade.
     * aria-label descreve o propósito da navegação.
     */
    <aside className="sidebar" role="navigation" aria-label="Menu principal">
      <nav className="sidebar-nav">
        {/**
         * map() renderiza um Link pra cada item do menu.
         * 
         * Uso idx como key porque a ordem dos itens é estática.
         * Em listas dinâmicas, seria melhor usar ID único.
         * 
         * aria-current="page" informa screen readers qual página tá ativa.
         */}
        {menuItems.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.link} 
            className={`nav-link ${isActiveLink(item.link) ? 'active' : ''}`}
            aria-current={isActiveLink(item.link) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <footer className="sidebar-footer">
        <p>2025® CRUD Project</p>
      </footer>
    </aside>
  );
}
