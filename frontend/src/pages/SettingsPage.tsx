import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle,
  Network,
  User as UserIcon,
  MapPin,
  Briefcase,
  Save
} from 'lucide-react';
import { fetchJobClusters, resetDemoDataset } from '../api/client';
import { ClusterInfo } from '../types';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [growthWeight, setGrowthWeight] = useState<number>(0.50);
  const [marketShareWeight, setMarketShareWeight] = useState<number>(0.30);
  const [volumeWeight, setVolumeWeight] = useState<number>(0.20);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // User Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Data Analyst');
  const [targetCity, setTargetCity] = useState(user?.target_city || 'Bengaluru');
  const [experienceYears, setExperienceYears] = useState(user?.experience_years || 2.0);
  const [skills, setSkills] = useState(user?.skills || 'Python, SQL, Power BI');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setTargetRole(user.target_role);
      setTargetCity(user.target_city);
      setExperienceYears(user.experience_years);
      setSkills(user.skills);
    }
  }, [user]);

  useEffect(() => {
    fetchJobClusters()
      .then((data) => setClusters(data))
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      target_role: targetRole,
      target_city: targetCity,
      experience_years: experienceYears,
      skills
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const roles = [
    'Data Analyst',
    'Data Scientist',
    'Data Engineer',
    'ML Engineer',
    'BI Developer',
    'Software Engineer'
  ];

  const cities = [
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Mumbai',
    'Delhi NCR',
    'Chennai'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings & Profile Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Personalize candidate profile attributes, tune data science scoring parameters, and inspect latent KMeans clusters.
        </p>
      </div>

      {/* User Candidate Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Your Candidate Profile Credentials</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Account: <strong className="text-slate-800">{user?.email}</strong>
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Tech Hub</label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Your Primary Technical Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, SQL, Tableau, AWS, Docker"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSaved ? 'Profile Updated!' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ML Weights Tuning Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Emerging Skill Formula Weights</h3>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Period-over-Period Growth Weight</span>
                <span>{(growthWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={growthWeight}
                onChange={(e) => setGrowthWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Market Share Penetration Weight</span>
                <span>{(marketShareWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={marketShareWeight}
                onChange={(e) => setMarketShareWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Total Mention Volume Weight</span>
                <span>{(volumeWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={volumeWeight}
                onChange={(e) => setVolumeWeight(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Score Formula: <code>Growth * {growthWeight} + Share * {marketShareWeight} + Vol * {volumeWeight}</code>
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {isSaved ? 'Weights Saved!' : 'Save Weights'}
              </button>
            </div>
          </form>
        </div>

        {/* Database & Environment Info */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Database & System Runtime</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Backend Engine:</span>
              <strong className="text-slate-900">FastAPI (Python 3.11+)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">ORM & Driver:</span>
              <strong className="text-slate-900">SQLAlchemy 2.0 (Dual SQLite / PostgreSQL)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">NLP & ML Stack:</span>
              <strong className="text-slate-900">Scikit-Learn (TF-IDF, KMeans, Cosine Sim)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Frontend Stack:</span>
              <strong className="text-slate-900">React 18 + TypeScript + Vite + Tailwind</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Latent KMeans Clusters Inspection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">K-Means Job Family Clusters (Unsupervised ML)</h3>
              <p className="text-xs text-slate-500">
                Discovered semantic clusters of job descriptions derived via TF-IDF vectorization and KMeans centroids.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            K = 5 Clusters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {clusters.map((c) => (
            <div
              key={c.cluster_id}
              className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  Cluster #{c.cluster_id}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {c.job_count} posts ({c.percentage}%)
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900">{c.cluster_name}</h4>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Top Centroid Keywords
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.top_keywords.map((kw) => (
                    <span key={kw} className="px-1.5 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[11px] font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex justify-between text-xs">
                <span className="text-slate-500">Avg Salary:</span>
                <strong className="text-slate-900">₹{c.avg_salary_lpa} LPA</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
