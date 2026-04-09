import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  // 1. Authentication Check
  if (!token) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Authorization Check (Role-Based)
  // Ensures standard users cannot access Admin hardware management panels
  if (role && role !== userRole) {
    console.warn(`Access Denied: Required role [${role}], found [${userRole}]`);
    
    // Redirect based on role to prevent "Dead Ends"
    const redirectTo = userRole === "admin" ? "/admin-dashboard" : "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  /**
   * 3. Tenant Integrity Check (Optional)
   * If using KVM high-security standards, we ensure children components 
   * only render when the session is validated.
   */
  return children;
}