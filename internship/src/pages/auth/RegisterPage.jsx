import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Investor' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(form);
      setSuccess('Account created. You can sign in now.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <h2 className="mb-2 text-2xl font-semibold text-white">Create account</h2>
        <p className="mb-6 text-sm text-slate-400">Choose your role and join the platform.</p>
        {error ? <div className="mb-4 rounded bg-red-950/60 p-3 text-sm text-red-300">{error}</div> : null}
        {success ? <div className="mb-4 rounded bg-emerald-950/60 p-3 text-sm text-emerald-300">{success}</div> : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <input name="email" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Email" type="email" value={form.email} onChange={handleChange} />
          <input name="password" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Password" type="password" value={form.password} onChange={handleChange} />
          <select name="role" className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={form.role} onChange={handleChange}>
            <option value="Investor">Investor</option>
            <option value="Founder">Founder</option>
          </select>
          <button className="w-full rounded bg-cyan-600 px-4 py-2 font-medium text-white" type="submit">Register</button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account? <Link className="text-cyan-400" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
