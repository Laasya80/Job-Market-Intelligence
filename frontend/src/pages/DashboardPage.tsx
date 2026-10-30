import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Layers,
  IndianRupee,
  TrendingUp,
  MapPin,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  fetchDashboardSummary,
  fetchTopSkills,
  fetchMonthlyTrends,
  fetchRoleDistribution,
  fetchHiringHotspots,
  fetchEmergingSkills,
  fetchRecentInsights
} from '../api/client';
import {
  DashboardSummary,
  TopSkill,
  RoleDistribution,
  HiringHotspot,
  EmergingSkill,
  RecentInsight
} from '../types';
import { KPICard } from '../components/common/KPICard';
import { ChartCard } from '../components/common/ChartCard';
import { InsightCard } from '../components/common/InsightCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

const ROLE_COLORS = ['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];
const TREND_COLORS = ['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

const AVAILABLE_TREND_SKILLS = [
  'Python',
  'SQL',
  'Machine Learning',
  'Power BI',
  'AWS',
  'Tableau',
  'Docker',
  'PyTorch',
  'Generative AI'
];

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [topSkills, setTopSkills] = useState<TopSkill[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'SQL', 'Machine Learning', 'Power BI']);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [hotspots, setHotspots] = useState<HiringHotspot[]>([]);
  const [emergingSkills, setEmergingSkills] = useState<EmergingSkill[]>([]);
  const [insights, setInsights] = useState<RecentInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, topRes, trendRes, roleRes, hotRes, emRes, insRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchTopSkills(10),
        fetchMonthlyTrends(selectedSkills),
        fetchRoleDistribution(),
        fetchHiringHotspots(),
        fetchEmergingSkills(6),
        fetchRecentInsights()
      ]);

      setSummary(sumRes);
      setTopSkills(topRes);
      setTrendData(trendRes.data || []);
      setRoleDistribution(roleRes);
      setHotspots(hotRes);
      setEmergingSkills(emRes);
      setInsights(insRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSkill = async (skill: string) => {
    let next: string[];
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length <= 1) return; // keep at least 1
      next = selectedSkills.filter(s => s !== skill);
    } else {
      if (selectedSkills.length >= 5) return; // max 5
      next = [...selectedSkills, skill];
    }
    setSelectedSkills(next);
    try {
      const res = await fetchMonthlyTrends(next);
      setTrendData(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time market analytics, skill penetration rates, and compensation benchmarks.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards Grid */}
      {isLoading || !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Job Posts"
            value={summary.total_jobs.toLocaleString()}
            subtitle="Analyzed Postings"
            changePct={12.4}
            icon={Briefcase}
            color="blue"
          />
          <KPICard
            title="Skills Tracked"
            value={summary.total_skills_tracked}
            subtitle="Standardized Taxonomy"
            changePct={8.2}
            icon={Layers}
            color="teal"
          />
          <KPICard
            title="Average Salary"
            value={`₹${summary.average_salary_lpa} LPA`}
            subtitle="Market Benchmark"
            changePct={6.5}
            icon={IndianRupee}
            color="purple"
          />
          <KPICard
            title="Fastest Growing Skill"
            value={summary.fastest_growing_skill}
            subtitle={`+${summary.fastest_growth_rate_pct}% QoQ surge`}
            changePct={summary.fastest_growth_rate_pct}
            icon={TrendingUp}
            color="emerald"
          />
        </div>
      )}

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 10 In-Demand Skills (Horizontal Bar Chart) */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Top 10 In-Demand Skills"
            subtitle="Market penetration across all active job postings"
            badge="Top Penetration"
          >
            {isLoading ? (
              <LoadingSkeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={topSkills}
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={95}
                  />
                  <Tooltip
                    formatter={(val: number, name: string, item: any) => [
                      `${val}% (${item.payload.count} jobs)`,
                      'Penetration'
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="percentage" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Monthly Skill Demand Trends (Line Chart) */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Monthly Skill Demand Trends"
            subtitle="Tracking posting velocity for technologies over 12 months"
            badge="Time Series"
          >
            {isLoading ? (
              <LoadingSkeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-3">
                {/* Skill Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Compare:</span>
                  {AVAILABLE_TREND_SKILLS.map((sk) => {
                    const isSelected = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        onClick={() => handleToggleSkill(sk)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sk}
                      </button>
                    );
                  })}
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        borderColor: '#e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    {selectedSkills.map((sk, idx) => (
                      <Line
                        key={sk}
                        type="monotone"
                        dataKey={sk}
                        name={sk}
                        stroke={TREND_COLORS[idx % TREND_COLORS.length]}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Role Distribution + Hiring Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Distribution (Donut Chart) */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Role Distribution"
            subtitle="Proportion of openings across canonical role families"
            badge="Role Share"
          >
            {isLoading ? (
              <LoadingSkeleton className="h-64 w-full" />
            ) : (
              <div className="w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {roleDistribution.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        `${val} postings`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        borderColor: '#e2e8f0',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend list */}
                <div className="w-full grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                  {roleDistribution.map((item, idx) => (
                    <div key={item.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length] }}
                        />
                        <span className="text-slate-600 truncate">{item.role}</span>
                      </div>
                      <span className="font-bold text-slate-800 ml-1">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Hiring Hotspots City List */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Hiring Hotspots (India)"
            subtitle="Volume, average compensation & living cost across tech hubs"
            badge="Geographic Intelligence"
          >
            {isLoading ? (
              <LoadingSkeleton className="h-64 w-full" />
            ) : (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hotspots.map((city, idx) => (
                    <div
                      key={city.city}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <h4 className="text-xs font-bold text-slate-900">{city.city}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {city.job_count} posts • {city.top_role}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900">
                          ₹{city.average_salary_lpa} LPA
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-semibold">
                          {city.percentage}% total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Row 3: Emerging Skills Table + Recent Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Emerging Skills Table */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900">Emerging Skills Leaderboard</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Calculated by smoothed growth, market share & volume</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  ML Algorithm
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      <th className="pb-2">Skill</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-right">Growth %</th>
                      <th className="pb-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {emergingSkills.map((sk) => (
                      <tr key={sk.skill} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sk.skill}</span>
                          {sk.status === 'Emerging' && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                              NEW
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-500">{sk.category}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-600">
                          +{sk.growth_rate}%
                        </td>
                        <td className="py-2.5 text-right font-bold text-blue-600">
                          {sk.emerging_score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Formula: 50% Growth + 30% Share + 20% Volume</span>
              <span className="text-slate-600 font-semibold">{emergingSkills.length} Tracked</span>
            </div>
          </div>
        </div>

        {/* Dynamic Insight Cards */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Automated Market Insights</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Empirical Analytics</span>
          </div>
          {insights.map((ins) => (
            <InsightCard
              key={ins.id}
              title={ins.title}
              description={ins.description}
              category={ins.category}
              impact={ins.impact}
              metric={ins.metric}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
