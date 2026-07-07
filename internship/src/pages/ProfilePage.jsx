import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const roleTag = useMemo(() => {
    if (user.role?.toLowerCase() === 'founder') return 'Founder';
    if (user.role?.toLowerCase() === 'investor') return 'Investor';
    return 'Member';
  }, [user.role]);

  const roleColor = roleTag === 'Founder' ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-slate-950';
  const nextPage = roleTag === 'Founder' ? '/founder' : '/investor';

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Your profile</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back, {user.name.split(' ')[0]}.</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              This is your account hub. Manage your identity, review your access level, and jump into the tools built for your role.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-lg">
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${roleColor}`}>
              {roleTag}
            </span>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Current access</p>
            <button
              type="button"
              onClick={() => navigate(nextPage)}
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Go to {roleTag} area
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Account overview</h2>
              <p className="mt-2 text-slate-400">Your profile details and quick account status are available here.</p>
            </div>
            <span className="rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-300">Active</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Name</p>
              <p className="mt-3 text-lg font-semibold text-white">{user.name}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Email</p>
              <p className="mt-3 text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Role</p>
              <p className="mt-3 text-lg font-semibold text-white">{roleTag}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/90 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Member since</p>
              <p className="mt-3 text-lg font-semibold text-white">Joined securely</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-950/90 p-6">
            <h3 className="text-lg font-semibold text-white">Profile insights</h3>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <span>Access role controls tailored for {roleTag.toLowerCase()} workflows.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <span>Secure password storage with bcrypt hashing on the server.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                <span>Use the navigation links to explore your startup or investor workspace.</span>
              </li>
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white">Quick actions</h2>
            <p className="mt-2 text-slate-400">Jump into the pages you use most often.</p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View profile details
              </button>
              <button
                type="button"
                onClick={() => navigate(nextPage)}
                className="w-full rounded-3xl bg-cyan-600 px-4 py-3 text-left text-sm font-medium text-slate-950 transition hover:bg-cyan-500"
              >
                Open {roleTag} workspace
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Browse startup pitches
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white">Account security</h2>
            <p className="mt-2 text-slate-400">Your login credentials are protected and token-based sessions are used for API access.</p>
            <div className="mt-6 space-y-4 text-slate-300">
              <div className="rounded-3xl bg-slate-950/90 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Authentication</p>
                <p className="mt-2 text-white">JWT token stored in secure local storage.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/90 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Data handling</p>
                <p className="mt-2 text-white">Passwords are hashed before saving to the database.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProfilePage;
