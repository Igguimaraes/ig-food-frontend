import "./menuItem.css";
import { NavLink } from "react-router-dom";

const MenuItem = () => {
  return (
    <nav className="menu" aria-label="Navegação principal">
      <div className="menu-content">
        <NavLink to="/" end className="menu-link">
          <img src="/assets/store.png" alt="Loja" />
        </NavLink>

        <NavLink to="/order" className="menu-link">
          <img src="/assets/order.png" alt="Pedidos" />
        </NavLink>

        <NavLink to="/profile" className="menu-link">
          <img src="/assets/profile.png" alt="Perfil" />
        </NavLink>
      </div>
    </nav>
  );
};

export default MenuItem;
