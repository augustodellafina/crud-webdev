import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './lib/context/UserContext';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { HomePage } from './pages/HomePage';
import { UserPage } from './pages/UserPage';
import { UsersListPage } from './pages/UsersListPage';
import './App.scss';

export function App() {
  return (
    /**
     * UserProvider envolve tudo pra disponibilizar contexto de usuários.
     * Qualquer componente filho pode usar useUserContext().
     * 
     * Router gerencia navegação - mantém URL sincronizada com componentes.
     */
    <UserProvider>
      <Router>
        <div className="app-container">
          {/* Header fixo no topo - aparece em todas as páginas */}
          <Header />
          <div className="app-body">
            {/* Sidebar de navegação - também aparece em todas as páginas */}
            <Sidebar />
            {/**
             * Main content area com role="main" pra acessibilidade.
             * Screen readers podem pular direto pro conteúdo principal.
             * 
             * Routes define qual componente renderizar baseado na URL:
             * / -> HomePage
             * /user -> UserPage (modo criação)
             * /user/:id -> UserPage (modo edição, mesmo componente!)
             * /users -> UsersListPage
             */}
            <main id="main-content" className="main-content" role="main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/user" element={<UserPage />} />
                <Route path="/user/:id" element={<UserPage />} />
                <Route path="/users" element={<UsersListPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}
