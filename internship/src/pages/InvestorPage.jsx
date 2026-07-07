import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import apiClient from '../api/axios';

ChartJS.register(
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
);

const categories = [
  'Healthcare',
  'FinTech',
  'EdTech',
  'Food',
  'Sports',
  'AI',
  'Cyber Security',
  'Agriculture',
  'Travel',
  'Gaming',
  'SaaS',
  'Logistics',
  'Manufacturing',
  'Fashion',
  'Energy',
];

const fundingStages = [
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
];

function InvestorPage() {
  const [category, setCategory] = useState('All');
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryLabel = useMemo(() => (category === 'All' ? 'All Categories' : category), [category]);

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchStartups = async (selectedCategory = '', currentSearch = '', currentSort = '') => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory || undefined,
        search: currentSearch || undefined,
        sort_by: currentSort || undefined,
      };
      const response = await apiClient.get('/startups', { params });
      const payload = response.data.items || response.data;
      setStartups(payload);
      if (!payload.some((startup) => startup.id === selectedStartup?.id)) {
        setSelectedStartup(null);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load startups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups(category === 'All' ? '' : category, searchText, sortBy);
  }, [category, searchText, sortBy]);

  const handleCategoryClick = (name) => {
    setCategory(name);
  };

  const handleAction = async (startupId, action) => {
    try {
      await apiClient.post(`/startups/${startupId}/action`, { action });
      setMessage(`Startup ${action}ed successfully`);
      fetchStartups(category === 'All' ? '' : category);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Action failed');
    }
  };

  const handleViewPitchDeck = async (startup) => {
    if (!startup.pitch_deck_path) {
      setMessage('No pitch deck uploaded for this startup.');
      return;
    }

    try {
      const response = await apiClient.get(`/startups/${startup.id}/pitch_deck`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to download pitch deck');
    }
  };

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalStartups = startups.length;
    const analyzed = startups.filter((s) => s.analysis);
    const avgScore = analyzed.length
      ? Math.round((analyzed.reduce((sum, s) => sum + (s.analysis?.overall_score || 0), 0) / analyzed.length) * 10) / 10
      : 0;
    
    return {
      totalStartups,
      analyzedCount: analyzed.length,
      averageScore: avgScore,
      highScoreCount: analyzed.filter((s) => (s.analysis?.overall_score || 0) >= 7).length,
    };
  }, [startups]);

  // Chart: Startups by category
  const categoryChartData = useMemo(() => {
    const categoryCount = categories.map(
      (cat) => startups.filter((startup) => startup.category === cat).length
    );

    return {
      labels: categories,
      datasets: [
        {
          label: 'Startups by Category',
          data: categoryCount,
          backgroundColor: [
            'rgba(34, 211, 238, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(52, 211, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(194, 65, 12, 0.8)',
            'rgba(25, 118, 210, 0.8)',
            'rgba(79, 172, 254, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(17, 24, 39, 0.8)',
            'rgba(107, 114, 128, 0.8)',
            'rgba(55, 65, 81, 0.8)',
          ],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [startups]);

  // Chart: Startups by funding stage
  const fundingStageChartData = useMemo(() => {
    const stageCount = fundingStages.map(
      (stage) => startups.filter((startup) => startup.funding_stage === stage).length
    );

    return {
      labels: fundingStages,
      datasets: [
        {
          label: 'Startups by Funding Stage',
          data: stageCount,
          backgroundColor: [
            'rgba(34, 211, 238, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [startups]);

  // Chart: Category distribution (Doughnut)
  const categoryDistributionData = useMemo(() => {
    const categoryCount = categories
      .map((cat) => ({ cat, count: startups.filter((startup) => startup.category === cat).length }))
      .filter((item) => item.count > 0);

    return {
      labels: categoryCount.map((item) => item.cat),
      datasets: [
        {
          data: categoryCount.map((item) => item.count),
          backgroundColor: [
            'rgba(34, 211, 238, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(52, 211, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
          ],
          borderColor: 'rgba(15, 23, 42, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [startups]);

  // Chart: Analysis scores trend
  const scoresChartData = useMemo(() => {
    const analyzed = startups.filter((s) => s.analysis);
    const scoreCategories = ['Market', 'Team', 'Product', 'Business', 'Scalability', 'Financial'];
    
    const averageScores = scoreCategories.map((label) => {
      const key = `${label.toLowerCase()}_score`;
      const values = analyzed
        .map((startup) => startup.analysis[key])
        .filter((val) => typeof val === 'number');
      const average = values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      return Math.round(average * 10) / 10;
    });

    return {
      labels: scoreCategories,
      datasets: [
        {
          label: 'Average Score (Analyzed Startups)',
          data: averageScores,
          borderColor: 'rgba(34, 211, 238, 1)',
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          borderWidth: 2,
          fill: true,
          pointBackgroundColor: 'rgba(34, 211, 238, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [startups]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-400">Investor Dashboard</p>
              <h1 className="text-4xl font-semibold text-white">Investment Opportunity Pipeline</h1>
              <p className="mt-2 max-w-2xl text-slate-400">Real-time analytics on startup portfolio, category insights, and investment-ready opportunities.</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              Selected: <span className="font-semibold text-white">{categoryLabel}</span>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-sm text-rose-200">
            {message}
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-cyan-700 bg-cyan-950/40 p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Total Startups</p>
            <p className="mt-4 text-4xl font-semibold text-white">{dashboardMetrics.totalStartups}</p>
            <p className="mt-2 text-xs text-cyan-200">In pipeline</p>
          </div>
          <div className="rounded-3xl border border-blue-700 bg-blue-950/40 p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Analyzed</p>
            <p className="mt-4 text-4xl font-semibold text-white">{dashboardMetrics.analyzedCount}</p>
            <p className="mt-2 text-xs text-blue-200">With AI evaluation</p>
          </div>
          <div className="rounded-3xl border border-purple-700 bg-purple-950/40 p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300">Avg Score</p>
            <p className="mt-4 text-4xl font-semibold text-white">{dashboardMetrics.averageScore}/10</p>
            <p className="mt-2 text-xs text-purple-200">Overall rating</p>
          </div>
          <div className="rounded-3xl border border-emerald-700 bg-emerald-950/40 p-6 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">High Potential</p>
            <p className="mt-4 text-4xl font-semibold text-white">{dashboardMetrics.highScoreCount}</p>
            <p className="mt-2 text-xs text-emerald-200">Score 7+</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Category Chart */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">Startups by Category</h2>
            <div className="rounded-2xl bg-slate-950/70 p-4">
              <Bar
                data={categoryChartData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true, backgroundColor: 'rgba(15, 23, 42, 0.8)', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' },
                  },
                  scales: {
                    x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Funding Stage Chart */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">Startups by Funding Stage</h2>
            <div className="rounded-2xl bg-slate-950/70 p-4">
              <Bar
                data={fundingStageChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true, backgroundColor: 'rgba(15, 23, 42, 0.8)', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' },
                  },
                  scales: {
                    x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          {/* Scores Trend */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">Average Evaluation Scores</h2>
            <div className="rounded-2xl bg-slate-950/70 p-4">
              <Line
                data={scoresChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true, backgroundColor: 'rgba(15, 23, 42, 0.8)', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' },
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 10,
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' },
                    },
                    x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } },
                  },
                }}
              />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-white">Category Mix</h2>
            <div className="rounded-2xl bg-slate-950/70 p-4">
              <Doughnut
                data={categoryDistributionData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 15 } },
                    tooltip: { enabled: true, backgroundColor: 'rgba(15, 23, 42, 0.8)', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <section className="mb-8">
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  category === 'All'
                    ? 'border-cyan-400 bg-cyan-600/20 text-cyan-100'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500 hover:text-white'
                }`}
                onClick={() => handleCategoryClick('All')}
              >
                All
              </button>
              {categories.map((categoryLabel) => (
                <button
                  key={categoryLabel}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    category === categoryLabel
                      ? 'border-cyan-400 bg-cyan-600/20 text-cyan-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500 hover:text-white'
                  }`}
                  onClick={() => handleCategoryClick(categoryLabel)}
                >
                  {categoryLabel}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search startups..."
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest_score">Highest score</option>
                <option value="most_fundable">Most fundable</option>
              </select>
            </div>
          </div>
        </section>

        {/* Startups Grid */}
        <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Startup Pipeline</h2>
                {loading && <span className="text-sm text-slate-400">Loading…</span>}
              </div>
              {startups.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/80 p-8 text-center text-slate-500">
                  No startups found in this category.
                </div>
              ) : (
                <div className="space-y-4">
                  {startups.map((startup) => (
                    <div key={startup.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 transition hover:border-cyan-600 hover:bg-slate-900">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">{startup.startup_name}</h3>
                          <p className="text-sm text-slate-400">
                            {startup.industry} • {startup.category}
                          </p>
                          {startup.analysis && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-block rounded-full bg-cyan-600/20 px-3 py-1 text-xs text-cyan-200">
                                Score: {startup.analysis.overall_score}/10
                              </span>
                              {startup.analysis.overall_score >= 7 && (
                                <span className="inline-block rounded-full bg-emerald-600/20 px-3 py-1 text-xs text-emerald-200">
                                  High Potential
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {startup.funding_ask || 'Ask N/A'}
                          </span>
                          {startup.investor_action && (
                            <span className="rounded-full bg-cyan-600/10 px-3 py-1 text-xs text-cyan-200">
                              {startup.investor_action}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-300">{startup.description}</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStartup(startup)}
                          className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:border-cyan-500 hover:text-cyan-100"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewPitchDeck(startup)}
                          className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:border-cyan-500 hover:text-cyan-100"
                        >
                          Pitch Deck
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(startup.id, 'shortlist')}
                          className="rounded-2xl border border-cyan-700 bg-cyan-600/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-600/20"
                        >
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(startup.id, 'save')}
                          className="rounded-2xl border border-emerald-700 bg-emerald-600/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-600/20"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(startup.id, 'reject')}
                          className="rounded-2xl border border-rose-700 bg-rose-600/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-600/20"
                        >
                          Pass
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Selected Startup Details */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="mb-4 text-2xl font-semibold text-white">Startup Profile</h2>
              {selectedStartup ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Name</p>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedStartup.startup_name}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Category</p>
                      <p className="mt-1 text-sm font-medium text-slate-200">{selectedStartup.category}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Industry</p>
                      <p className="mt-1 text-sm font-medium text-slate-200">{selectedStartup.industry}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Funding Ask</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">{selectedStartup.funding_ask || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Problem</p>
                    <p className="mt-1 text-sm text-slate-300">{selectedStartup.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Solution</p>
                    <p className="mt-1 text-sm text-slate-300">{selectedStartup.solution}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Traction</p>
                    <p className="mt-1 text-sm text-slate-300">{selectedStartup.traction}</p>
                  </div>
                  {selectedStartup.analysis && (
                    <div className="rounded-2xl border border-cyan-700/50 bg-cyan-950/30 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Overall Score</p>
                      <p className="mt-2 text-3xl font-semibold text-cyan-200">{selectedStartup.analysis.overall_score}/10</p>
                      <p className="mt-2 text-xs text-slate-400">AI-evaluated</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">Select a startup to view detailed profile.</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-semibold text-white">Portfolio Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-sm text-slate-400">Shortlisted</span>
                  <span className="text-lg font-semibold text-white">
                    {startups.filter((s) => s.investor_action === 'shortlist').length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-sm text-slate-400">Saved</span>
                  <span className="text-lg font-semibold text-white">
                    {startups.filter((s) => s.investor_action === 'save').length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-sm text-slate-400">Analyzed</span>
                  <span className="text-lg font-semibold text-white">
                    {startups.filter((s) => s.analysis).length}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default InvestorPage;
