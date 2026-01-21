import { Navigate, Outlet, useLocation } from "react-router-dom";
import { session } from "../utils/session";

export default function PrivateRoute() {
  const location = useLocation();
  const logged = session.isLogged();

  if (!logged) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
