import { Link, Outlet } from "react-router-dom";
import "./mainLayout.css";
import MenuItem from "../components/MenuItem/MenuItem";

export default function MainLayout() {
  return (
    <div className="app">
      <header className="app-header">
        <MenuItem />
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>© 2026 - Igor Guimarães Dev.</span>
      </footer>
    </div>
  );
}
