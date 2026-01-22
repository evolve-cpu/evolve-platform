import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const ok = sessionStorage.getItem("admin_access") === "true";
  if (!ok) return <Navigate to="/admin" replace />;
  return children;
}
