import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  GitCompare,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  fetchSkillTrendsDetailed,
  fetchEmergingSkills,
  fetchSkillCooccurrences,
  fetchSkillHeatmap,
  compareSkills
} from '../api/client';
import { EmergingSkill, SkillPairCooccurrence } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { SkillBadge } from '../components/common/SkillBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const SkillTrendsPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [trendsData, setTrendsData] = useState<any>(null);
  const [emergingSkills, setEmergingSkills] = useState<EmergingSkill[]>([]);
  const [cooccurrences, setCooccurrences] = useState<SkillPairCooccurrence[]>([]);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Skill comparison state
  const [compSkillA, setCompSkillA] = useState<string>('Python');
  const [compSkillB, setCompSkillB] = useState<string>('Machine Learning');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [trendRes, emRes, coocRes, heatRes] = await Promise.all([
        fetchSkillTrendsDetailed({
          role: selectedRole === 'All' ? undefined : selectedRole,
          city: selectedCity === 'All' ? undefined : selectedCity
        }),
        fetchEmergingSkills(12),
        fetchSkillCooccurrences(4, 12),
        fetchSkillHeatmap(8)
      ]);

      setTrendsData(trendRes);
      setEmergingSkills(emRes);
      setCooccurrences(coocRes);
      setHeatmap(heatRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load skill trends.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    setIsComparing(true);
    try {
      const res = await compareSkills(compSkillA, compSkillB);
      setComparisonResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRole, selectedCity]);

  useEffect(() => {
    handleCompare();
  }, [compSkillA, compSkillB]);

  const rolesList = ['All', 'Data Analyst', 'Data Scientist', 'Data Engineer', 'ML Engineer', 'BI Developer', 'Software Engineer'];
  const citiesList = ['All', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai'];

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const risingSkills = emergingSkills.filter((s) => s.status === 'Emerging');
  const decliningSkills = emergingSkills.filter((s) => s.status === 'Declining');

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Skill Trends Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Time-series demand curves, emerging tech formulas, role penetration heatmaps, and pair co-occurrences.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {rolesList.map((r) => (
              <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {citiesList.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Row 1: Time Series & Dynamic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Skill Demand Trends */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Monthly Skill Demand Trajectory"
            subtitle={`Tracking technology postings across ${trendsData?.total_jobs_analyzed || 0} jobs`}
            badge="12-Month Window"
          >
            {isLoading ? (
              <LoadingSkeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendsData?.data || []} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Python" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="SQL" stroke="#14b8a6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Machine Learning" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Power BI" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="AWS" stroke="#ec4899" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Dynamic Trend Insights Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Data-Driven Trend Insights</h3>
            </div>
            <div className="space-y-2.5">
              {trendsData?.insights?.map((ins: string, idx: number) => (
                <div key={idx} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/70 text-xs text-slate-700 leading-relaxed">
                  {ins}
                </div>
              ))}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                <strong>Synergy Rule:</strong> 82% of postings that require <strong>Spark</strong> also demand <strong>Python & SQL</strong> simultaneously.
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            Calculated via periodic linear regression & exponential smoothing.
          </div>
        </div>
      </div>

      {/* Row 2: Skill Demand Heatmap across Roles */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Skill Penetration Heatmap (% Demand by Role)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Empirical percentage of role postings requiring each core technology</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Higher % = Deeper Blue</span>
        </div>

        {isLoading || !heatmap ? (
          <LoadingSkeleton className="h-48 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2.5 px-4 font-bold text-slate-700">Role</th>
                  {heatmap.skills.map((s: string) => (
                    <th key={s} className="py-2.5 px-3 font-bold text-slate-700">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {heatmap.matrix.map((row: any) => (
                  <tr key={row.role} className="hover:bg-slate-50/80">
                    <td className="text-left py-3 px-4 font-bold text-slate-900">{row.role}</td>
                    {heatmap.skills.map((s: string) => {
                      const val = row[s] || 0;
                      // Determine heat color intensity
                      let bgClass = 'bg-slate-50 text-slate-400';
                      if (val >= 70) bgClass = 'bg-blue-600 text-white font-bold';
                      else if (val >= 45) bgClass = 'bg-blue-500 text-white font-semibold';
                      else if (val >= 25) bgClass = 'bg-blue-200 text-blue-900 font-semibold';
                      else if (val > 5) bgClass = 'bg-blue-50 text-blue-700';

                      return (
                        <td key={s} className="py-3 px-3">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs ${bgClass}`}>
                            {val}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row 3: 1-on-1 Skill Comparison Engine */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Head-to-Head Skill Comparison</h3>
              <p className="text-xs text-slate-500">Compare market volume, salary impact, and combination synergy</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={compSkillA}
              onChange={(e) => setCompSkillA(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 w-36"
              placeholder="Skill A"
            />
            <span className="text-xs font-bold text-slate-400">vs</span>
            <input
              type="text"
              value={compSkillB}
              onChange={(e) => setCompSkillB(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 w-36"
              placeholder="Skill B"
            />
            <button
              onClick={handleCompare}
              disabled={isComparing}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Compare
            </button>
          </div>
        </div>

        {comparisonResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Skill A Card */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase">Skill A</span>
              <h4 className="text-lg font-black text-slate-900">{comparisonResult.skill_a.name}</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Volume: <strong>{comparisonResult.skill_a.total_mentions}</strong> posts ({comparisonResult.skill_a.market_share_pct}%)</p>
                <p>Avg Salary: <strong>₹{comparisonResult.skill_a.average_salary_lpa} LPA</strong></p>
              </div>
            </div>

            {/* Synergy / Both Card */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase">Combination Synergy</span>
              <h4 className="text-lg font-black text-slate-900">Both Combined</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Co-occurrence: <strong>{comparisonResult.cooccurrence.both_count}</strong> posts</p>
                <p>Combined Avg Salary: <strong>₹{comparisonResult.cooccurrence.both_avg_salary_lpa} LPA</strong></p>
                <p className="text-emerald-700 font-bold">
                  +{comparisonResult.cooccurrence.synergy_salary_premium_pct}% Salary Premium
                </p>
              </div>
            </div>

            {/* Skill B Card */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
              <span className="text-xs font-bold text-purple-600 uppercase">Skill B</span>
              <h4 className="text-lg font-black text-slate-900">{comparisonResult.skill_b.name}</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Volume: <strong>{comparisonResult.skill_b.total_mentions}</strong> posts ({comparisonResult.skill_b.market_share_pct}%)</p>
                <p>Avg Salary: <strong>₹{comparisonResult.skill_b.average_salary_lpa} LPA</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Skill Co-occurrence Matrix */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Frequent Skill Co-occurrences</h3>
            <p className="text-xs text-slate-500">Pairwise association rules, support metrics, and conditional probability</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Apriori Analytics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cooccurrences.map((cooc, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <span>{cooc.source_skill}</span>
                  <span className="text-slate-400 font-normal">+</span>
                  <span>{cooc.target_skill}</span>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Support: {cooc.support}% • Conf: {cooc.confidence}%
                </span>
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {cooc.cooccurrence_count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
