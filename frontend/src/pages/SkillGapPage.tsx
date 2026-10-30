import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Plus,
  X,
  Clock,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { analyzeSkillGap } from '../api/client';
import { SkillGapResponse } from '../types';
import { SkillBadge } from '../components/common/SkillBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const SkillGapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const savedAnalysis = (() => {
    try { return JSON.parse(localStorage.getItem('jmi_resume_result') || 'null') as SkillGapResponse | null; } catch { return null; }
  })();
  const initialRole = searchParams.get('role') || savedAnalysis?.target_role || 'Data Analyst';

  const [targetRole, setTargetRole] = useState<string>(initialRole);
  const [candidateSkills, setCandidateSkills] = useState<string[]>(savedAnalysis ? [...savedAnalysis.matched_skills, ...savedAnalysis.partially_matched_skills] : ['Python', 'SQL', 'Excel', 'Pandas']);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  const [analysisResult, setAnalysisResult] = useState<SkillGapResponse | null>(savedAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed && !candidateSkills.includes(trimmed)) {
      setCandidateSkills([...candidateSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCandidateSkills(candidateSkills.filter((s) => s !== skillToRemove));
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeSkillGap({
        candidate_skills: candidateSkills,
        target_role: targetRole
      });
      setAnalysisResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze skill gap.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const roles = [
    'Data Analyst',
    'Data Scientist',
    'Data Engineer',
    'ML Engineer',
    'BI Developer',
    'Software Engineer'
  ];

  // Colors for Match Donut
  const matchScore = analysisResult?.profile_match_score || 0;
  const matchData = [
    { name: 'Matched', value: matchScore },
    { name: 'Gap', value: Math.max(0, 100 - matchScore) }
  ];
  const GAUGE_COLORS = ['#2563eb', '#e2e8f0'];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Skill Gap Analyzer</h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            NLP & Vector Gap Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          See which skills match your target role and what to learn next. Manage your resume in the separate Resume module.
        </p>
      </div>

      {/* Input Section Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-600">{savedAnalysis ? 'Skills from your resume' : 'Add your current skills'}</p>

          {/* Target Role Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Target Role:</span>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add a candidate skill (e.g. Tableau, PyTorch, Docker, Spark)..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </form>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Your Candidate Skills Profile ({candidateSkills.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {candidateSkills.map((s) => (
                  <SkillBadge
                    key={s}
                    name={s}
                    size="md"
                    onRemove={() => handleRemoveSkill(s)}
                  />
                ))}
              </div>
            </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyzing Market Vectors...' : 'Calculate Skill Gap & Roadmap'}</span>
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={handleRunAnalysis} />}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Row 1: Score Donut + Skill Category Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Donut Gauge */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Profile Match Index
              </span>
              
              <div className="relative w-44 h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={matchData}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={0}
                    >
                      <Cell fill="#2563eb" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900">
                    {analysisResult.profile_match_score}%
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">
                    Alignment
                  </span>
                </div>
              </div>

              {/* Market Benchmark Comparison */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 w-full text-xs text-slate-600 flex items-center justify-between">
                <span>Market Average Candidate:</span>
                <strong className="text-slate-900">{analysisResult.benchmark_market_avg_score}%</strong>
              </div>
            </div>

            {/* Matched, Partial, Missing Breakdown */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900">Empirical Skill Audit for {analysisResult.target_role}</h3>

              {/* Matched Skills */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Direct Matched Skills ({analysisResult.matched_skills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.matched_skills.length > 0 ? (
                    analysisResult.matched_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No direct matches.</span>
                  )}
                </div>
              </div>

              {/* Partially Matched Skills */}
              {analysisResult.partially_matched_skills.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800">
                      Partially Related Competencies ({analysisResult.partially_matched_skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.partially_matched_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                        ~ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Missing Required Skills ({analysisResult.missing_skills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.missing_skills.length > 0 ? (
                    analysisResult.missing_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
                        ✕ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold">Zero skill gaps found! Ready for interview.</span>
                  )}
                </div>
              </div>

              {/* Dynamic Insights Alert */}
              <div className="pt-2">
                {analysisResult.insights.map((ins, idx) => (
                  <p key={idx} className="text-xs text-slate-600 leading-relaxed font-medium">
                    💡 {ins}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Prioritized Learning Roadmap */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Prioritized Learning Roadmap</h3>
                <p className="text-xs text-slate-500">
                  Prioritized by: Market Demand (50%) + Growth Velocity (30%) + Gap Weight (20%)
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
                Personalized Plan
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {analysisResult.roadmap.map((item, idx) => (
                <div
                  key={item.skill}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 hover:bg-white hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{item.skill}</h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.category} • In <strong>{item.market_demand_pct}%</strong> of target postings
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Est. {item.recommended_duration_weeks} Weeks
                      </span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        Priority Score: {item.gap_priority_score}
                      </span>
                    </div>
                  </div>

                  {/* Recommended Curricula Resources */}
                  <div className="pl-11">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Curated Learning Modules
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                      {item.learning_resources.map((res, rIdx) => (
                        <li key={rIdx} className="p-2 bg-white rounded-lg border border-slate-200/70 font-medium flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
