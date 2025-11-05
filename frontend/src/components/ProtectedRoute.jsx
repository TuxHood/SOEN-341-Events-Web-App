import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const ctx = useAuth();
  const location = useLocation();
  if (!ctx) return children ?? <Outlet />;

  const { user } = ctx;
  if (!user) return <Navigate to="/auth/login" replace state={{ from: location }} />;

  return children ?? <Outlet />;
}
