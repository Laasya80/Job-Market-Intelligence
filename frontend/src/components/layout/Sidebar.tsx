import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, TrendingUp, FileSearch, Sparkles, FileText } from 'lucide-react';
import { BrandMark } from '../BrandMark';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'My profile', icon: LayoutDashboard },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/jobs', label: 'Find jobs', icon: Briefcase },
  { path: '/skill-gap', label: 'Skill gaps', icon: FileSearch, badge: 'AI' },
  { path: '/skills', label: 'Market trends', icon: TrendingUp },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
        <BrandMark size="sm" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              JMI
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
              STUDENT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Your career toolkit</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          YOUR NEXT STEP
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Dataset & System Badge */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold text-slate-800">Career snapshot</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Jobs, in-demand skills and salary details in one place.
          </p>
        </div>
      </div>
    </aside>
  );
};
