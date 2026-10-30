import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  role?: string;
  city?: string;
  work_mode?: string;
  min_exp?: number;
  min_salary?: number;
  skill?: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  showSkillFilter?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  showSkillFilter = false
}) => {
  const roles = ['All', 'Data Analyst', 'Data Scientist', 'Data Engineer', 'ML Engineer', 'BI Developer', 'Software Engineer'];
  const cities = ['All', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai'];
  const workModes = ['All', 'Onsite', 'Hybrid', 'Remote'];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
        <Filter className="w-4 h-4 text-blue-600" />
        <span>Filters:</span>
      </div>

      {/* Role Filter */}
      <div className="flex flex-col">
        <select
          value={filters.role || 'All'}
          onChange={(e) => onChange({ ...filters, role: e.target.value === 'All' ? undefined : e.target.value })}
          className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium cursor-pointer"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r === 'All' ? 'All Roles' : r}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="flex flex-col">
        <select
          value={filters.city || 'All'}
          onChange={(e) => onChange({ ...filters, city: e.target.value === 'All' ? undefined : e.target.value })}
          className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium cursor-pointer"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Cities' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Work Mode */}
      <div className="flex flex-col">
        <select
          value={filters.work_mode || 'All'}
          onChange={(e) => onChange({ ...filters, work_mode: e.target.value === 'All' ? undefined : e.target.value })}
          className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium cursor-pointer"
        >
          {workModes.map((w) => (
            <option key={w} value={w}>
              {w === 'All' ? 'All Work Modes' : w}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Filter */}
      <div className="flex flex-col">
        <select
          value={filters.min_exp !== undefined ? String(filters.min_exp) : 'All'}
          onChange={(e) => onChange({ ...filters, min_exp: e.target.value === 'All' ? undefined : parseFloat(e.target.value) })}
          className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium cursor-pointer"
        >
          <option value="All">All Experience</option>
          <option value="0">Entry Level (0+ yrs)</option>
          <option value="2">Mid Level (2+ yrs)</option>
          <option value="5">Senior Level (5+ yrs)</option>
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset
      </button>
    </div>
  );
};
