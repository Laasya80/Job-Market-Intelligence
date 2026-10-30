import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Briefcase, FileText, Loader2, Plus, Save, TrendingUp, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyzeSkillGap, uploadResumeAndAnalyze } from '../api/client';
import { SkillGapResponse } from '../types';

type ResumeResult = SkillGapResponse;

export const ResumePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResumeResult | null>(() => {
    try { return JSON.parse(localStorage.getItem('jmi_resume_result') || 'null'); } catch { return null; }
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (result && result.target_role !== user?.target_role) setResult(null);
  }, [user?.target_role]);

  useEffect(() => {
    if (result) {
      setEditedName(result.candidate_name || user?.full_name || '');
      setEditedSkills([...new Set([...result.matched_skills, ...result.partially_matched_skills])]);
    }
  }, [result?.target_role]);

  const analyze = async () => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const next = await uploadResumeAndAnalyze(file, user?.target_role || 'Data Analyst') as ResumeResult;
      setResult(next);
      localStorage.setItem('jmi_resume_result', JSON.stringify(next));
      localStorage.setItem('jmi_resume_filename', file.name);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'We could not read this resume. Try a text based PDF or TXT file.');
    } finally { setBusy(false); }
  };

  const openGaps = () => navigate('/skill-gap');

  const addSkill = (event: React.FormEvent) => {
    event.preventDefault();
    const skill = newSkill.trim();
    if (skill && !editedSkills.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
      setEditedSkills([...editedSkills, skill]);
    }
    setNewSkill('');
  };

  const saveEdits = async () => {
    if (!result) return;
    const name = editedName.trim() || user?.full_name || 'Student';
    setSaving(true);
    setError('');
    try {
      await updateProfile({ full_name: name, skills: editedSkills.join(',') });
      const recalculated = await analyzeSkillGap({ candidate_skills: editedSkills, target_role: result.target_role });
      const updated: ResumeResult = {
        ...recalculated,
        candidate_name: name,
        candidate_email: result.candidate_email || user?.email,
        candidate_phone: result.candidate_phone,
      };
      setResult(updated);
      localStorage.setItem('jmi_resume_result', JSON.stringify(updated));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not save your resume edits. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="mx-auto max-w-5xl space-y-7 pb-10">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold text-teal-700">Resume module</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Resume review</h1><p className="mt-2 text-sm text-slate-500">Upload your resume to see extracted details, role fit and skills to build next.</p></div>
      <button onClick={() => navigate('/jobs')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Browse jobs <ArrowRight size={16}/></button>
    </div>

    {!result ? <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><FileText size={22}/></div><div><h2 className="text-lg font-bold text-slate-900">Start with your resume</h2><p className="text-sm text-slate-500">PDF or TXT · We’ll find your skills and contact details</p></div></div>
        <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-teal-500 hover:bg-teal-50/40">
          <Upload className="mb-3 text-teal-700" size={28}/><span className="text-sm font-semibold text-slate-800">{file?.name || 'Choose a resume to upload'}</span><span className="mt-1 text-xs text-slate-500">Your resume is used to generate your profile and match score.</span><input type="file" accept=".pdf,.txt" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
        </label>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <button disabled={!file || busy} onClick={analyze} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <><Loader2 size={16} className="animate-spin"/> Reading your resume…</> : 'Analyze my resume'}</button>
        <p className="mt-3 text-center text-xs text-slate-400">Match scores are estimates based on the selected role and available job listings.</p>
      </div>
      <div className="rounded-3xl bg-slate-900 p-7 text-white"><div className="mb-6 inline-flex rounded-xl bg-white/10 p-3 text-teal-200"><BadgeCheck size={22}/></div><h2 className="text-xl font-bold">A clearer way into your next role</h2><div className="mt-6 space-y-5 text-sm text-slate-300"><p className="flex gap-3"><span className="font-bold text-teal-200">01</span> Get your resume skills and profile in one place.</p><p className="flex gap-3"><span className="font-bold text-teal-200">02</span> See relevant jobs, salary ranges and match scores.</p><p className="flex gap-3"><span className="font-bold text-teal-200">03</span> Focus on the skills employers are asking for.</p></div></div>
    </section> : <>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ATS-style role match</p><p className="mt-2 text-4xl font-bold text-slate-950">{Math.round(result.profile_match_score)}<span className="text-xl text-slate-400">%</span></p><p className="mt-1 text-xs text-slate-500">Estimate for {result.target_role}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills found</p><p className="mt-2 text-4xl font-bold text-slate-950">{result.matched_skills.length + result.partially_matched_skills.length}</p><p className="mt-1 text-xs text-slate-500">Matched or related skills</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next skills to build</p><p className="mt-2 text-4xl font-bold text-slate-950">{result.missing_skills.length}</p><p className="mt-1 text-xs text-slate-500">Based on role requirements</p></div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Your resume profile</h2><p className="mt-1 text-sm text-slate-500">Edit details and skills · {localStorage.getItem('jmi_resume_filename') || 'Resume uploaded'}</p></div><button onClick={() => { setResult(null); setFile(null); localStorage.removeItem('jmi_resume_result'); }} className="shrink-0 text-xs font-semibold text-teal-700 hover:text-teal-900">Replace resume</button></div>
          <label className="mt-5 block text-xs font-medium text-slate-500">Name<input value={editedName} onChange={event => setEditedName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"/></label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><ProfileField label="Email" value={result.candidate_email || user?.email || 'Not found in resume'}/><ProfileField label="Phone" value={result.candidate_phone || 'Not found in resume'}/></div>
          <div className="mt-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p><div className="flex flex-wrap gap-2">{editedSkills.length ? editedSkills.map(skill => <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-teal-50 py-1 pl-3 pr-1.5 text-xs font-medium text-teal-800">{skill}<button type="button" aria-label={`Remove ${skill}`} onClick={() => setEditedSkills(editedSkills.filter(item => item !== skill))} className="rounded-full p-0.5 hover:bg-teal-100"><X size={13}/></button></span>) : <span className="text-sm text-slate-500">No skills added yet</span>}</div>
            <form onSubmit={addSkill} className="mt-3 flex gap-2"><input value={newSkill} onChange={event => setNewSkill(event.target.value)} placeholder="Add a skill" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600"/><button className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Plus size={15}/> Add</button></form>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <button disabled={saving} onClick={saveEdits} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}Save changes</button>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-900">Recommended next steps</h2><p className="mt-1 text-sm text-slate-500">Keep your search focused and build skills in demand.</p><div className="mt-5 space-y-3"><ActionCard icon={<Briefcase size={18}/>} title="Jobs that fit your profile" detail="Compare role, salary and required skills" onClick={() => navigate('/jobs')}/><ActionCard icon={<TrendingUp size={18}/>} title="Skills employers want" detail="Explore trending skills and job domains" onClick={() => navigate('/skills')}/><ActionCard icon={<FileText size={18}/>} title="Close your skill gaps" detail={`${result.missing_skills.slice(0, 3).join(', ') || 'Review your matched skills'}`} onClick={openGaps}/></div></div>
      </section>
    </>}
  </div>;
};

const ProfileField = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-medium text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{value}</p></div>;
const ActionCard = ({ icon, title, detail, onClick }: { icon: React.ReactNode; title: string; detail: string; onClick: () => void }) => <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50/50"><span className="text-teal-700">{icon}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="block truncate text-xs text-slate-500">{detail}</span></span><ArrowRight size={16} className="text-slate-400"/></button>;
