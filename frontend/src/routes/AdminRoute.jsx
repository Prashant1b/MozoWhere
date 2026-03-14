import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function AdminRoute() {
  const { user, booting } = useContext(AuthContext);
  const location = useLocation();

  if (booting) return <div className="p-6">Loading…</div>;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = user?.role || user?.userRole || "user";
  if (role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}