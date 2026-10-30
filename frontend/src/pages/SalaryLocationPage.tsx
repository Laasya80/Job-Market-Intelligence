import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  MapPin,
  TrendingUp,
  Building,
  Sparkles,
  PieChart as PieIcon,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { fetchSalaryAnalytics } from '../api/client';
import { SalaryAnalytics } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { KPICard } from '../components/common/KPICard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

const WORK_MODE_COLORS = ['#2563eb', '#14b8a6', '#8b5cf6'];

export const SalaryLocationPage: React.FC = () => {
  const [role, setRole] = useState<string>('All');
  const [city, setCity] = useState<string>('All');
  const [minExp, setMinExp] = useState<number | undefined>(undefined);
  const [salaryData, setSalaryData] = useState<SalaryAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSalaryAnalytics({
        role: role === 'All' ? undefined : role,
        city: city === 'All' ? undefined : city,
        min_exp: minExp
      });
      setSalaryData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch salary analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role, city, minExp]);

  const rolesList = ['All', 'Data Analyst', 'Data Scientist', 'Data Engineer', 'ML Engineer', 'BI Developer', 'Software Engineer'];
  const citiesList = ['All', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai'];

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  // Work Mode pie data
  const workModeData = salaryData?.work_mode_distribution
    ? Object.entries(salaryData.work_mode_distribution).map(([mode, count]) => ({
        name: mode,
        value: count
      }))
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Salary & Location Insights</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compensation distributions, metro premiums, cost-of-living purchasing parity, and work-mode trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs focus:ring-2 focus:ring-blue-500/20"
          >
            {rolesList.map((r) => (
              <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
            ))}
          </select>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs focus:ring-2 focus:ring-blue-500/20"
          >
            {citiesList.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading || !salaryData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Overall Average Salary"
            value={`₹${salaryData.overall_avg_salary_lpa} LPA`}
            subtitle="Analyzed Tech Benchmark"
            icon={IndianRupee}
            color="blue"
          />
          <KPICard
            title="Overall Median Salary"
            value={`₹${salaryData.overall_median_salary_lpa} LPA`}
            subtitle="Mid-Market Compensation"
            icon={IndianRupee}
            color="teal"
          />
          <KPICard
            title="Metro Salary Average"
            value={`₹${salaryData.metro_avg_lpa} LPA`}
            subtitle="BLR, HYD, MUM, DEL"
            icon={Building}
            color="purple"
          />
          <KPICard
            title="Metro Salary Premium"
            value={`+${salaryData.metro_salary_premium_pct}%`}
            subtitle="Tier-1 vs Tier-2 Spread"
            changePct={salaryData.metro_salary_premium_pct}
            icon={TrendingUp}
            color="emerald"
          />
        </div>
      )}

      {/* Row 1: Salary Distribution + Top Paying Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Salary Distribution Bar Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Salary Distribution (LPA Ranges)"
            subtitle="Percentage share of openings across compensation bands"
            badge="Distribution"
          >
            {isLoading || !salaryData ? (
              <LoadingSkeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salaryData.distribution} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="salary_range" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: number) => [`${val}% of jobs`, 'Share']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="percentage" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Top Paying Cities Bar Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            title="Top Paying Cities (Average vs Median)"
            subtitle="Compensation benchmarks across Indian technology clusters"
            badge="Metro Benchmarks"
          >
            {isLoading || !salaryData ? (
              <LoadingSkeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salaryData.top_paying_cities} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis unit="L" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: number) => [`₹${val} LPA`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="average_salary_lpa" name="Average Salary" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="adjusted_salary_lpa" name="CoL-Adjusted Real Salary" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Row 2: City Comparison Table + Work Mode & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* City Comparison Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">City Cost-of-Living & Compensation Parity</h3>
              <p className="text-xs text-slate-500">Real purchasing power calculated using city price indexes</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
              Benchmark Index: 100
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5">City</th>
                  <th className="py-2.5">Avg Salary</th>
                  <th className="py-2.5">Median</th>
                  <th className="py-2.5">Posts</th>
                  <th className="py-2.5">Living Index</th>
                  <th className="py-2.5 font-bold text-emerald-600">CoL Adjusted Real LPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {salaryData?.top_paying_cities.map((c) => (
                  <tr key={c.city} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.city}
                    </td>
                    <td className="py-3 text-slate-800">₹{c.average_salary_lpa} LPA</td>
                    <td className="py-3 text-slate-800">₹{c.median_salary_lpa} LPA</td>
                    <td className="py-3 text-slate-600">{c.job_posts}</td>
                    <td className="py-3 text-slate-600">{c.col_index}</td>
                    <td className="py-3 font-bold text-emerald-600">
                      ₹{c.adjusted_salary_lpa} LPA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Mode Breakdown & Market Insights */}
        <div className="lg:col-span-4 space-y-6">
          {/* Work Mode Donut */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Work Mode Distribution
            </h4>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={workModeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {workModeData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={WORK_MODE_COLORS[idx % WORK_MODE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs font-semibold pt-1">
              {workModeData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: WORK_MODE_COLORS[idx % WORK_MODE_COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights Panel */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Location Intelligence
              </h4>
            </div>
            {salaryData?.insights.map((ins, idx) => (
              <p key={idx} className="text-xs text-slate-600 leading-relaxed font-medium">
                • {ins}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
