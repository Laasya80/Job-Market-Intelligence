import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentHomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return <div className="mx-auto max-w-4xl space-y-7 pb-10">
    <div><p className="text-sm font-semibold text-teal-700">Student profile</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Your account</h1><p className="mt-2 text-sm text-slate-500">Your basic account details and career tools.</p></div>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">Profile details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-medium text-slate-500">Name</p><p className="mt-1 text-sm font-semibold text-slate-900">{user?.full_name}</p></div>
        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-medium text-slate-500">Email</p><p className="mt-1 text-sm font-semibold text-slate-900">{user?.email}</p></div>
      </div>
    </section>
    <section><h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Career tools</h2><div className="grid gap-3 sm:grid-cols-3">
      <ToolCard icon={<FileText size={19}/>} title="Resume" detail="Upload and review your match" onClick={() => navigate('/resume')}/>
      <ToolCard icon={<Briefcase size={19}/>} title="Find jobs" detail="Roles and salary details" onClick={() => navigate('/jobs')}/>
      <ToolCard icon={<TrendingUp size={19}/>} title="Market trends" detail="Growing skills and domains" onClick={() => navigate('/skills')}/>
    </div></section>
  </div>;
};

const ToolCard = ({ icon, title, detail, onClick }: { icon: React.ReactNode; title: string; detail: string; onClick: () => void }) => <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40"><span className="text-teal-700">{icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{detail}</span></span><ArrowRight size={16} className="text-slate-400"/></button>;
