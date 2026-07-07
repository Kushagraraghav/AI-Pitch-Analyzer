function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-4 rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-sm text-slate-300">
          AI-Augmented Startup Pitch Analyzer
        </span>
        <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-6xl">
          Build sharper investor-ready pitch insights.
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          A clean starter scaffold for a modern web application with React, Vite, Tailwind, Flask, SQLAlchemy, and JWT-auth-ready architecture.
        </p>
      </section>
    </main>
  );
}

export default HomePage;
