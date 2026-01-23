import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function RequireRole({ allowedRoles }) {
  const { user } = useAuth();

  // 1. If user is not logged in, send them to Login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. If user exists but role is NOT in the allowed list, send to Tickets page (or home)
  if (!allowedRoles.includes(user.role)) {
    // You can also create a specific "Unauthorized" page if you prefer
    alert("Access Denied: You do not have permission to view this page.");
    return <Navigate to="/tickets" replace />;
  }

  // 3. If everything is good, show the page!
  return <Outlet />;
}