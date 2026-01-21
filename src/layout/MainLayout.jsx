import { Outlet } from "react-router-dom";
import "./mainLayout.css";
import MenuItem from "../components/MenuItem/MenuItem";

export default function MainLayout() {
  return (
    <div className="layout">
      {/* Menu topo (fixo) */}
      <header className="layout__header">
        <MenuItem />
      </header>

      {/* Conteúdo (centralizado) */}
      <main className="layout__content">
        <Outlet />
      </main>

      {/* Rodapé */}
      <footer className="layout__footer">
        <span>© 2026 - Igor Guimarães Dev.</span>
      </footer>
    </div>
  );
}
