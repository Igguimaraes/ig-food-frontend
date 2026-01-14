import "./menuItem.css";
import { NavLink } from "react-router-dom";

const MenuItem = () => {
  return (
    <section className="menu">
      <div className="menu-content">
        <NavLink to="/" end>
          <img src="/assets/store.png" alt="Home" />
        </NavLink>
        <NavLink to="/order">
          <img src="/assets/order.png" alt="Order" />
        </NavLink>
        <NavLink to="/profile">
          <img src="/assets/profile.png" alt="Profile" />
        </NavLink>
      </div>
    </section>
  );
};

export default MenuItem;
