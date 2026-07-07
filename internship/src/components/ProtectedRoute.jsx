import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-10 text-center text-slate-300">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role?.trim())) return <Navigate to="/profile" replace />;

  return children;
}

export default ProtectedRoute;
