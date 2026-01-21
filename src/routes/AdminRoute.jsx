// src/routes/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { session } from "../utils/session";

export default function AdminRoute() {
  const location = useLocation();

  const token = session.getToken();
  const user = session.getUser();

  // 1) Não autenticado
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2) Sessão inconsistente
  if (!user) {
    session.clear();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 3) Usuário não é ADMIN
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // 4) OK → libera rotas admin
  return <Outlet />;
}
