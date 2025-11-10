import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import AccessDenied from './AccessDenied';

export default function OrganizerRoute({ children }) {
	const ctx = useAuth();
	const location = useLocation();
	if (!ctx) return children ?? <Outlet />;

	const { user, ready } = ctx;
	if (!ready) return null;
	if (!user) return <Navigate to="/auth/login" replace state={{ from: location }} />;

	const isAdmin = Boolean(user && (user.role === 'admin' || user.is_staff));
	const isOrganizer = Boolean(user && (user.role === 'organizer' || isAdmin));
		if (!isOrganizer) return <AccessDenied />;

	return children ?? <Outlet />;
}
