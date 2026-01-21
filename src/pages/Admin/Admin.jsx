// src/pages/Admin/Admin.jsx
import "./AdminOrders.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { session } from "../../utils/session";
import AdminMetrics from "./AdminMetrics";
import AdminOpenOrders from "./AdminOpenOrders";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = session.getToken();
    const user = session.getUser();

    if (!token) {
      navigate("/login", { replace: true, state: { from: "/admin" } });
      return;
    }

    if (user?.role !== "ADMIN") {
      navigate("/", { replace: true });
      return;
    }
  }, [navigate]);

  return (
    <div className="adm-page">
      <header className="adm-header">
        <div>
          <h1 className="adm-title">Painel Admin</h1>
          <p className="adm-sub">
            Gerencie pedidos em aberto e acompanhe o faturamento.
          </p>
        </div>
      </header>

      <AdminMetrics />
      <AdminOpenOrders />
    </div>
  );
}
