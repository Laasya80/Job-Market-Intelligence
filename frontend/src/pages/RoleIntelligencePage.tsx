import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Target,
  IndianRupee,
  Briefcase,
  Building,
  TrendingUp,
  GitCompare,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import {
  fetchAllRoles,
  fetchRoleAnalytics,
  compareTwoRoles
} from '../api/client';
import { RoleAnalytics, RoleComparison } from '../types';
import { ChartCard } from '../components/common/ChartCard';
import { KPICard } from '../components/common/KPICard';
import { SkillBadge } from '../components/common/SkillBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const RoleIntelligencePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'Data Analyst';

  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [roleData, setRoleData] = useState<RoleAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Role Comparison State
  const [compRoleA, setCompRoleA] = useState<string>('Data Analyst');
  const [compRoleB, setCompRoleB] = useState<string>('Data Scientist');
  const [comparison, setComparison] = useState<RoleComparison | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const loadRolesAndAnalytics = async (roleName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [allRoles, analytics] = await Promise.all([
        fetchAllRoles(),
        fetchRoleAnalytics(roleName)
      ]);
      setRoles(allRoles);
      setRoleData(analytics);
    } catch (err: any) {
      setError(err.message || 'Failed to load role analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const res = await compareTwoRoles(compRoleA, compRoleB);
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  useEffect(() => {
    loadRolesAndAnalytics(selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    handleRunComparison();
  }, [compRoleA, compRoleB]);

  if (error) {
    return <ErrorState message={error} onRetry={() => loadRolesAndAnalytics(selectedRole)} />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Role Selector Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Role Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Competency radar benchmarks, progression ladders, tool requirements, and comparative analysis.
          </p>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Role KPIs Row */}
      {isLoading || !roleData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Average Salary"
            value={`₹${roleData.average_salary_lpa} LPA`}
            subtitle={`Range: ₹${roleData.salary_min_lpa} - ₹${roleData.salary_max_lpa} LPA`}
            icon={IndianRupee}
            color="blue"
          />
          <KPICard
            title="Average Experience"
            value={`${roleData.average_experience} Yrs`}
            subtitle="Industry Baseline"
            icon={Briefcase}
            color="teal"
          />
          <KPICard
            title="Total Openings"
            value={roleData.total_openings}
            subtitle="Analyzed Postings"
            icon={Target}
            color="purple"
          />
          <KPICard
            title="Top Hiring Sector"
            value={roleData.top_industry}
            subtitle="Leading Employer Sector"
            icon={Building}
            color="emerald"
          />
        </div>
      )}

      {/* Main Row: Radar Chart + Tools & Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Competency Demand Radar Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            title={`${selectedRole} Competency Profile`}
            subtitle="Required core competencies scored out of 100"
            badge="Radar Benchmark"
          >
            {isLoading || !roleData ? (
              <LoadingSkeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={roleData.competencies}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="competency"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar
                    name="Demand Index"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Top Tools & Common JD Keywords */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Tools Required */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Top Tools & Technologies Required</h3>
            <div className="space-y-2">
              {roleData?.top_tools.map((t) => (
                <div key={t.name} className="text-xs">
                  <div className="flex justify-between text-slate-700 font-semibold mb-1">
                    <span>{t.name}</span>
                    <span>{t.pct}% of postings</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${t.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common JD Keywords */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Common Job Description Keywords</h3>
            <p className="text-xs text-slate-500 mb-3">High-frequency terms extracted via text tokenization</p>
            <div className="flex flex-wrap gap-1.5">
              {roleData?.common_keywords.map((kw) => (
                <span
                  key={kw.keyword}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{kw.keyword}</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1 rounded">
                    {kw.frequency}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Career Progression Path Ladder */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Career Progression Ladder</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hierarchical career trajectory from associate to principal leadership</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {roleData?.career_path.map((step, idx) => (
            <div
              key={step.level}
              className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-blue-50/30 hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {step.level}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    ₹{step.average_salary_lpa} LPA
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h4>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{step.experience_range}</span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                <span>Next Milestone</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Role vs Role Comparison */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Direct Role vs Role Comparison</h3>
              <p className="text-xs text-slate-500">Benchmark compensation, openings, and technical requirements</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={compRoleA}
              onChange={(e) => setCompRoleA(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="text-xs font-bold text-slate-400">vs</span>
            <select
              value={compRoleB}
              onChange={(e) => setCompRoleB(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {comparison && (
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 font-medium">
              {comparison.comparison_summary}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Metric Table */}
              <div className="md:col-span-2 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2">Dimension</th>
                      <th className="py-2 text-blue-600">{comparison.role_a}</th>
                      <th className="py-2 text-purple-600">{comparison.role_b}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700">Average Salary</td>
                      <td className="py-2.5 font-bold text-slate-900">₹{comparison.metrics.average_salary_lpa.role_a} LPA</td>
                      <td className="py-2.5 font-bold text-slate-900">₹{comparison.metrics.average_salary_lpa.role_b} LPA</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700">Total Openings</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.openings.role_a}</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.openings.role_b}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700">Avg Experience Required</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.avg_experience_years.role_a} Yrs</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.avg_experience_years.role_b} Yrs</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700">Python Penetration</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.python_penetration_pct.role_a}%</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.python_penetration_pct.role_b}%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700">SQL Penetration</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.sql_penetration_pct.role_a}%</td>
                      <td className="py-2.5 font-bold text-slate-900">{comparison.metrics.sql_penetration_pct.role_b}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Unique Skills List */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Distinctive to {comparison.role_b}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {comparison.unique_to_b.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Shared Overlap Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {comparison.common_skills.slice(0, 5).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
