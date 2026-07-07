import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <h2 className="mb-2 text-2xl font-semibold text-white">Welcome back</h2>
        <p className="mb-6 text-sm text-slate-400">Sign in to access your pitch workspace.</p>
        {error ? <div className="mb-4 rounded bg-red-950/60 p-3 text-sm text-red-300">{error}</div> : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full rounded bg-cyan-600 px-4 py-2 font-medium text-white" type="submit">Login</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          New here? <Link className="text-cyan-400" to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
