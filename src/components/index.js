/**
 * Barrel export de componentes.
 * 
 * Ao invés de:
 * import Button from './components/Button/Button';
 * import Input from './components/Input/Input';
 * 
 * Posso fazer:
 * import { Button, Input } from './components';
 * 
 * Mais limpo e facilita refactoring (se mover arquivo, só atualizo aqui).
 */

// Componentes que usam default export
export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as Modal } from './Modal/Modal';
export { default as NotificationContainer } from './NotificationContainer/NotificationContainer';

// Componentes que usam named export
export { Checkbox } from './Checkbox/Checkbox';
export { Header } from './Header/Header';
export { Sidebar } from './Sidebar/Sidebar';
export { default as CollapsibleSection } from './CollapsibleSection/CollapsibleSection';
