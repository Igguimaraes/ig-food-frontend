import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Home from "../pages/Home/Home";
import Store from "../pages/Store/Store";
import Order from "../pages/Order/Order";
import Profile from "../pages/Profile/Profile";
import About from "../pages/About/About";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Login/Login";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import Admin from "../pages/Admin/Admin";
import AdminOrder from "../components/AdminOrder/AdminOrder";
import AdminHistory from "../pages/Admin/AdminHistory";
import AdminOpenOrders from "../pages/Admin/AdminOpenOrders";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/about" element={<About />} />

        {/* Protegido (logado) */}
        <Route element={<PrivateRoute />}>
          <Route path="/order" element={<Order />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/open" element={<AdminOpenOrders />} />
          <Route path="/admin/history" element={<AdminHistory />} />
        </Route>

        {/* Protegido (ADMIN) */}
        <Route element={<AdminRoute />}>
          <Route path="/adminorder" element={<AdminOrder />} />

          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
