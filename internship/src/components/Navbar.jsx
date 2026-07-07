import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-white">
          Pitch Analyzer
        </Link>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link to="/profile">Profile</Link>
              {user.role?.toLowerCase() === 'founder' ? (
                <>
                  <Link to="/founder">Founder Area</Link>
                  <Link to="/founder-dashboard">Dashboard</Link>
                </>
              ) : (
                <Link to="/investor">Investor Area</Link>
              )}
              <button onClick={handleLogout} className="rounded bg-slate-800 px-3 py-2">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
