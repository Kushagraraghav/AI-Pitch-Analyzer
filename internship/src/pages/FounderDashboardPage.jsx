import { useEffect, useMemo, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import apiClient from '../api/axios';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
);

const initialForm = {
  startup_name: '',
  industry: '',
  category: 'AI',
  funding_stage: '',
  problem: '',
  solution: '',
  target_market: '',
  business_model: '',
  traction: '',
  funding_ask: '',
  description: '',
};

function FounderDashboardPage() {
  const [form, setForm] = useState(initialForm);
  const [startups, setStartups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [pitchDeck, setPitchDeck] = useState(null);
  const [logo, setLogo] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const fetchStartups = async (queryOverrides = {}) => {
    const params = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      ...queryOverrides,
    };

    if (categoryFilter !== 'All') params.category = categoryFilter;
    if (searchText) params.search = searchText;

    const { data } = await apiClient.get('/startups', { params });
    setStartups(data.items || data);
    setTotal(data.pagination?.total ?? data.length);
  };

  useEffect(() => {
    fetchStartups();
  }, [page, categoryFilter, sortBy]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (pitchDeck) formData.append('pitch_deck', pitchDeck);
    if (logo) formData.append('logo', logo);

    try {
      let response;
      if (editingId) {
        response = await apiClient.put(`/startups/${editingId}`, formData);
        setMessage('Startup updated successfully');
      } else {
        response = await apiClient.post('/startups', formData);
        setMessage('Startup created successfully');
      }

      if (pitchDeck && response?.data?.id) {
        setAnalysisLoading(true);
        try {
          await apiClient.post(`/generate-analysis`, { startup_id: response.data.id });
          setMessage('Analysis completed successfully');
        } catch (analysisError) {
          setMessage(analysisError.response?.data?.message || 'Analysis failed');
        } finally {
          setAnalysisLoading(false);
        }
      }

      setForm(initialForm);
      setEditingId(null);
      setPitchDeck(null);
      setLogo(null);
      await fetchStartups();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Operation failed');
      setAnalysisLoading(false);
    }
  };

  const handleEdit = (startup) => {
    setEditingId(startup.id);
    setForm({
      startup_name: startup.startup_name,
      industry: startup.industry,
      category: startup.category,
      funding_stage: startup.funding_stage || '',
      problem: startup.problem,
      solution: startup.solution,
      target_market: startup.target_market,
      business_model: startup.business_model,
      traction: startup.traction,
      funding_ask: startup.funding_ask,
      description: startup.description,
    });
  };

  const handleDelete = async (id) => {
    await apiClient.delete(`/startups/${id}`);
    await fetchStartups();
  };

  const handleSearch = async () => {
    setPage(1);
    await fetchStartups({ page: 1 });
  };

  const handleSortByChange = async (value) => {
    setSortBy(value);
    setPage(1);
    await fetchStartups({ page: 1, sort_by: value });
  };

  const handleCategoryFilter = async (value) => {
    setCategoryFilter(value);
    setPage(1);
    await fetchStartups({ page: 1, category: value === 'All' ? '' : value });
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(total / pageSize)) return;
    setPage(newPage);
    await fetchStartups({ page: newPage });
  };

  const handleDownloadReport = async (startupId) => {
    setAnalysisLoading(true);
    try {
      const response = await apiClient.get(`/analysis/${startupId}/report`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `startup_${startupId}_evaluation_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('Report download started.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to download report');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateAnalysis = async (startupId) => {
    setAnalysisLoading(true);
    try {
      await apiClient.post('/generate-analysis', { startup_id: startupId });
      setMessage('Analysis completed successfully');
      await fetchStartups();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const summaryMetrics = useMemo(() => {
    const analyzed = startups.filter((startup) => startup.analysis);
    const totals = analyzed.reduce(
      (acc, startup) => {
        const analysis = startup.analysis;
        acc.total += 1;
        acc.overall += analysis.overall_score || 0;
        acc.readiness += analysis.funding_readiness_score || 0;
        return acc;
      },
      { total: 0, overall: 0, readiness: 0 }
    );

    return {
      totalStartups: startups.length,
      analyzedStartups: totals.total,
      averageOverall: totals.total ? Math.round((totals.overall / totals.total) * 10) / 10 : 0,
      averageReadiness: totals.total ? Math.round((totals.readiness / totals.total) * 10) / 10 : 0,
    };
  }, [startups]);

  const chartData = useMemo(() => {
    const categories = ['Market', 'Team', 'Product', 'Business', 'Scalability', 'Financial'];
    const scores = categories.map((label) => {
      const key = `${label.toLowerCase()}_score`;
      const values = startups
        .filter((startup) => startup.analysis && typeof startup.analysis[key] === 'number')
        .map((startup) => startup.analysis[key]);
      const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
      return Math.round(average * 10) / 10;
    });

    return {
      labels: categories,
      datasets: [
        {
          label: 'Average score',
          data: scores,
          backgroundColor: 'rgba(34, 211, 238, 0.6)',
          borderColor: 'rgba(34, 211, 238, 1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  }, [startups]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      {analysisLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 text-white">
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/95 px-10 py-8 text-center shadow-2xl">
            <div className="mb-4 text-3xl font-semibold">Running AI analysis…</div>
            <div className="text-slate-300">Extracting your pitch deck, generating summary, and creating startup intelligence.</div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-400">Founder Dashboard</p>
          <h1 className="mb-3 text-4xl font-semibold">Launch and manage your startup story</h1>
          <p className="max-w-3xl text-slate-400">Create startup cards, upload your pitch deck and logo, and keep investor-ready metadata in one place.</p>
        </div>

        {message ? <div className="mb-6 rounded border border-cyan-800 bg-cyan-950/50 p-3 text-cyan-200">{message}</div> : null}

        <div className="mb-8 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-white">Founder KPI Snapshot</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total startups</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summaryMetrics.totalStartups}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Evaluated</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summaryMetrics.analyzedStartups}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Avg overall</p>
                <p className="mt-3 text-3xl font-semibold text-white">{summaryMetrics.averageOverall}/10</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Startup analysis trends</h2>
                <p className="text-sm text-slate-400">Average score per dimension for evaluated startups.</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-950/70 p-4">
              <Radar data={chartData} options={{ responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { r: { min: 0, max: 10, ticks: { stepSize: 2, color: '#94a3b8' }, pointLabels: { color: '#cbd5e1' } } } }} />
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[2fr_0.8fr]">
          <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-lg">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search startups, market, solution..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            />
            <button type="button" onClick={handleSearch} className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm text-white hover:bg-cyan-500">Search</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={categoryFilter} onChange={(e) => handleCategoryFilter(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500">
              <option value="All">All categories</option>
              <option value="AI">AI</option>
              <option value="Fintech">Fintech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="Climate">Climate</option>
              <option value="Other">Other</option>
            </select>
            <select value={sortBy} onChange={(e) => handleSortByChange(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest_score">Highest score</option>
              <option value="most_fundable">Most fundable</option>
            </select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
            <h2 className="text-2xl font-semibold">{editingId ? 'Edit Startup' : 'Create Startup'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input name="startup_name" value={form.startup_name} onChange={handleChange} placeholder="Startup Name" className="rounded border border-slate-700 bg-slate-950 p-3" />
              <input name="industry" value={form.industry} onChange={handleChange} placeholder="Industry" className="rounded border border-slate-700 bg-slate-950 p-3" />
              <select name="category" value={form.category} onChange={handleChange} className="rounded border border-slate-700 bg-slate-950 p-3">
                <option value="AI">AI</option>
                <option value="Fintech">Fintech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="Climate">Climate</option>
                <option value="Other">Other</option>
              </select>
              <select name="funding_stage" value={form.funding_stage} onChange={handleChange} className="rounded border border-slate-700 bg-slate-950 p-3">
                <option value="">Funding stage</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B+">Series B+</option>
              </select>
              <input name="funding_ask" value={form.funding_ask} onChange={handleChange} placeholder="Funding Ask" className="rounded border border-slate-700 bg-slate-950 p-3" />
            </div>
            <textarea name="problem" value={form.problem} onChange={handleChange} placeholder="Problem" className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 p-3" />
            <textarea name="solution" value={form.solution} onChange={handleChange} placeholder="Solution" className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 p-3" />
            <textarea name="target_market" value={form.target_market} onChange={handleChange} placeholder="Target Market" className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 p-3" />
            <textarea name="business_model" value={form.business_model} onChange={handleChange} placeholder="Business Model" className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 p-3" />
            <textarea name="traction" value={form.traction} onChange={handleChange} placeholder="Traction" className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 p-3" />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="min-h-24 w-full rounded border border-slate-700 bg-slate-950 p-3" />

            <div className="rounded border border-dashed border-slate-700 bg-slate-950/70 p-4">
              <label className="mb-2 block text-sm text-slate-400">Upload Pitch Deck (PDF)</label>
              <input type="file" accept="application/pdf" onChange={(e) => setPitchDeck(e.target.files[0])} className="block w-full text-sm text-slate-400" />
            </div>
            <div className="rounded border border-dashed border-slate-700 bg-slate-950/70 p-4">
              <label className="mb-2 block text-sm text-slate-400">Upload Logo</label>
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="block w-full text-sm text-slate-400" />
            </div>

            <button className="w-full rounded bg-cyan-600 px-4 py-3 font-medium text-white">{editingId ? 'Update Startup' : 'Save Startup'}</button>
          </form>

          <div className="space-y-4">
            {startups.map((startup) => (
              <div key={startup.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{startup.startup_name}</h3>
                    <p className="text-sm text-slate-400">{startup.industry} • {startup.category}</p>
                  </div>
                  <span className="rounded-full border border-cyan-800 bg-cyan-950/60 px-3 py-1 text-xs text-cyan-200">{startup.funding_ask}</span>
                </div>
                <p className="mb-4 text-sm text-slate-400">{startup.description}</p>
                <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                      Status: {startup.analysis_status || 'Not analyzed'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateAnalysis(startup.id)}
                        className="inline-flex items-center justify-center rounded bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
                      >
                        Run VC Evaluation
                      </button>
                      {startup.analysis && (
                        <button
                          type="button"
                          onClick={() => handleDownloadReport(startup.id)}
                          className="inline-flex items-center justify-center rounded border border-cyan-600 bg-slate-950 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-500 hover:text-white"
                        >
                          Download Report
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-6 grid gap-4">
                    {startup.analysis ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-3xl border border-cyan-700 bg-cyan-950/60 p-5 text-white shadow-xl">
                            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Overall Score</p>
                            <p className="mt-4 text-4xl font-semibold">{startup.analysis.overall_score ?? '--'}/10</p>
                          </div>
                          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-200 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Market</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{startup.analysis.market_score ?? '--'}/10</p>
                          </div>
                          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-200 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Team</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{startup.analysis.team_score ?? '--'}/10</p>
                          </div>
                          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-200 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Product</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{startup.analysis.product_score ?? '--'}/10</p>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-200 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Business</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{startup.analysis.business_score ?? '--'}/10</p>
                          </div>
                          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-200 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scalability</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{startup.analysis.scalability_score ?? '--'}/10</p>
                          </div>
                          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-200 shadow-lg">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Financial</p>
                            <p className="mt-4 text-3xl font-semibold text-white">{startup.analysis.financial_score ?? '--'}/10</p>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 shadow-lg">
                            <h4 className="mb-3 text-sm uppercase tracking-[0.25em] text-cyan-300">Strengths</h4>
                            <ul className="space-y-2 text-sm leading-6 text-slate-300">
                              {startup.analysis.strengths.length > 0 ? startup.analysis.strengths.map((item, index) => (
                                <li key={`strength-${index}`} className="list-disc pl-4">{item}</li>
                              )) : <li className="text-slate-500">No strengths available.</li>}
                            </ul>
                          </div>
                          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 shadow-lg">
                            <h4 className="mb-3 text-sm uppercase tracking-[0.25em] text-cyan-300">Weaknesses</h4>
                            <ul className="space-y-2 text-sm leading-6 text-slate-300">
                              {startup.analysis.weaknesses.length > 0 ? startup.analysis.weaknesses.map((item, index) => (
                                <li key={`weakness-${index}`} className="list-disc pl-4">{item}</li>
                              )) : <li className="text-slate-500">No weaknesses available.</li>}
                            </ul>
                          </div>
                          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 shadow-lg">
                            <h4 className="mb-3 text-sm uppercase tracking-[0.25em] text-cyan-300">Risks</h4>
                            <ul className="space-y-2 text-sm leading-6 text-slate-300">
                              {startup.analysis.risks.length > 0 ? startup.analysis.risks.map((item, index) => (
                                <li key={`risk-${index}`} className="list-disc pl-4">{item}</li>
                              )) : <li className="text-slate-500">No risks captured.</li>}
                            </ul>
                          </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 shadow-lg">
                            <h4 className="mb-3 text-sm uppercase tracking-[0.25em] text-cyan-300">Investment Recommendation</h4>
                            <p className="text-sm leading-7 text-slate-300">{startup.analysis.investment_recommendation || 'No recommendation available.'}</p>
                          </div>
                          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-200 shadow-lg">
                            <h4 className="mb-3 text-sm uppercase tracking-[0.25em] text-cyan-300">Due Diligence Questions</h4>
                            <ul className="space-y-2 text-sm leading-7 text-slate-300">
                              {startup.analysis.due_diligence_questions.length > 0 ? startup.analysis.due_diligence_questions.map((item, index) => (
                                <li key={`question-${index}`} className="list-disc pl-4">{item}</li>
                              )) : <li className="text-slate-500">No due diligence questions available.</li>}
                            </ul>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-5 text-slate-400">
                        <p className="text-sm">No AI evaluation has been generated yet. Upload a pitch deck and run the VC evaluation to get a complete report.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(startup)} className="rounded bg-slate-800 px-3 py-2 text-sm">Edit</button>
                    <button onClick={() => handleDelete(startup.id)} className="rounded bg-rose-900/60 px-3 py-2 text-sm text-rose-200">Delete</button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FounderDashboardPage;
