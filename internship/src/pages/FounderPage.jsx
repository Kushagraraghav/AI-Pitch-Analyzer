function FounderPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Founder Workspace</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Manage your startups and AI evaluations</h1>
              <p className="mt-3 max-w-2xl text-slate-400">
                Create and update your startup profile, upload your pitch deck, and run AI-powered investor analysis from one centralized workspace.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5 shadow-inner border border-slate-800">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Quick actions</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Create a new startup profile</li>
                <li>• Upload a pitch deck PDF</li>
                <li>• Run VC evaluation analysis</li>
                <li>• View founder dashboard metrics</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Your startups</h2>
            <p className="mt-2 text-sm text-slate-400">Manage company details, upload decks, and track which startups need evaluation.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">AI evaluation</h2>
            <p className="mt-2 text-sm text-slate-400">Run automated investor-grade scoring and generate market intelligence for every pitch.</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Founder insights</h2>
            <p className="mt-2 text-sm text-slate-400">Use the dashboard to spot funding readiness, strengths, weaknesses, and risk signals.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FounderPage;
