import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCode,
  Activity,
  Cpu,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Terminal
} from 'lucide-react';
import {
  fetchPipelineStatus,
  uploadDatasetCSV,
  resetDemoDataset
} from '../api/client';
import { PipelineStatus } from '../types';
import { KPICard } from '../components/common/KPICard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const DataPipelinePage: React.FC = () => {
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPipeline = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPipelineStatus();
      setPipeline(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pipeline telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setUploadMessage(null);
      try {
        const res = await uploadDatasetCSV(file);
        setUploadMessage(res.message || 'CSV Ingestion completed successfully.');
        loadPipeline();
      } catch (err: any) {
        setUploadMessage(`Upload failed: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Are you sure you want to reset the database to the 1,250 pre-seeded demo dataset?')) {
      setIsLoading(true);
      try {
        await resetDemoDataset();
        await loadPipeline();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadPipeline} />;
  }

  const pipelineStages = [
    { name: '1. Data Ingestion', desc: 'CSV Uploads & Raw Synthesized Feeds', icon: UploadCloud, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { name: '2. Cleaning & Validation', desc: 'Deduplication & Type Constraints', icon: CheckCircle2, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { name: '3. Skill Extraction', desc: 'PhraseMatcher & 100+ Skill Taxonomy', icon: Cpu, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { name: '4. Role Normalization', desc: 'Canonical Title Standardizer', icon: Layers, iconColor: 'text-amber-600', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { name: '5. Salary Parser', desc: 'Regex LPA & INR Normalizer', icon: Activity, color: 'bg-teal-50 text-teal-600 border-teal-200' },
    { name: '6. ML & Trend Engine', desc: 'TF-IDF, KMeans, Cosine & Anomalies', icon: Sparkles, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Pipeline & Engineering</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              ETL & ML Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, data quality metrics, schema coverage, ingestion logs, and dataset uploaders.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Dataset
        </button>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">End-to-End Data Processing Pipeline</h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            Status: {pipeline?.processing_status || 'HEALTHY'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          {pipelineStages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2 ${stg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{stg.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">{stg.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <span>Stage {idx + 1}</span>
                  {idx < 5 && <ArrowRight className="w-3 h-3 ml-auto text-slate-300" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Health & Quality Metrics KPIs */}
      {isLoading || !pipeline ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Records Ingested"
            value={pipeline.records_ingested.toLocaleString()}
            subtitle="Database Job Postings"
            icon={Database}
            color="blue"
          />
          <KPICard
            title="Completeness Score"
            value={`${pipeline.completeness_score}%`}
            subtitle="Non-Null Cell Density"
            icon={CheckCircle2}
            color="teal"
          />
          <KPICard
            title="Extraction Accuracy"
            value={`${pipeline.skill_extraction_accuracy}%`}
            subtitle="Taxonomy Precision"
            icon={Cpu}
            color="purple"
          />
          <KPICard
            title="Uniqueness / Validity"
            value={`${pipeline.uniqueness_score}%`}
            subtitle="Zero Duplicate Records"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      )}

      {/* Row 2: CSV Dataset Uploader + Active Connectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CSV Ingestion Tool */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Upload Custom Job CSV</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Live Ingest</span>
          </div>

          <p className="text-xs text-slate-500">
            Upload custom job post CSV datasets. Our pipeline automatically maps columns, extracts skills, normalizes roles, parses salaries, and persists to the database.
          </p>

          <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">
              {isUploading ? 'Ingesting and Processing CSV...' : 'Select CSV Dataset File'}
            </h4>
            <label className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors">
              <span>Choose File</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {uploadMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium">
              {uploadMessage}
            </div>
          )}
        </div>

        {/* Active Data Connectors & Schema Coverage */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Active Pipeline Connectors</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600">3 Active</span>
          </div>

          <div className="space-y-2">
            {pipeline?.active_connectors.map((conn, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{conn}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Connected
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Database Relational Models
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">jobs</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">skills</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">job_skills</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">companies</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">locations</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">pipeline_runs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Pipeline Logs Console & Schema Field Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Logs */}
        <div className="lg:col-span-7 bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-md font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Pipeline Execution Telemetry</span>
            </div>
            <span className="text-[10px] text-slate-500">Live Daemon Logs</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2 text-slate-300 leading-relaxed">
            {pipeline?.logs.map((log, idx) => (
              <p key={idx} className="text-[11px]">
                <span className="text-emerald-400">&gt;</span> {log}
              </p>
            ))}
          </div>
        </div>

        {/* Schema Field Coverage Table */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Schema Field Coverage</h3>
            <span className="text-[10px] font-bold text-slate-400">10 Fields</span>
          </div>

          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-1.5">Field</th>
                  <th className="pb-1.5">Type</th>
                  <th className="pb-1.5 text-right">Completeness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pipeline?.schema_coverage.map((f) => (
                  <tr key={f.field}>
                    <td className="py-1.5 font-semibold text-slate-800">{f.field}</td>
                    <td className="py-1.5 text-slate-400">{f.type}</td>
                    <td className="py-1.5 text-right font-bold text-emerald-600">
                      {f.completeness_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
