import React from 'react';
import { X, Building, MapPin, Briefcase, IndianRupee, Calendar, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Job } from '../../types';
import { SkillBadge } from '../common/SkillBadge';
import { formatSalaryLPA } from '../../utils/formatters';

interface JobDrawerProps {
  job: Job | null;
  onClose: () => void;
}

export const JobDrawer: React.FC<JobDrawerProps> = ({ job, onClose }) => {
  const navigate = useNavigate();

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {job.normalized_role}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1.5 leading-snug">
              {job.job_title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{job.company}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location || job.city}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Compensation</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {formatSalaryLPA(job.salary_min, job.salary_max)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Experience</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {job.experience_min} - {job.experience_max} Years
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                <Building className="w-3.5 h-3.5" />
                <span>Work Mode</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{job.work_mode}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Posted Date</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{job.posted_date}</p>
            </div>
          </div>

          {/* Match Score if present */}
          {job.match_score !== undefined && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Candidate Profile Match</span>
                </div>
                <span className="text-sm font-extrabold text-blue-700">{job.match_score}%</span>
              </div>
              <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${job.match_score}%` }}
                />
              </div>
            </div>
          )}

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Extracted & Required Skills ({job.skills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <SkillBadge key={s.id} name={s.name} category={s.category} />
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Job Description & Responsibilities
            </h4>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {job.description}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              navigate(`/roles?role=${encodeURIComponent(job.normalized_role)}`);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition-colors"
          >
            <span>Analyze Role Intelligence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onClose();
              navigate(`/skill-gap?role=${encodeURIComponent(job.normalized_role)}`);
            }}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Check Skill Gap
          </button>
        </div>
      </div>
    </div>
  );
};
