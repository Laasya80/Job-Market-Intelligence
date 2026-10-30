import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Briefcase, MapPin, IndianRupee, Calendar } from 'lucide-react';
import { fetchJobs } from '../api/client';
import { Job, JobListResponse } from '../types';
import { FilterBar, FilterState } from '../components/common/FilterBar';
import { DataTable, Column } from '../components/common/DataTable';
import { SkillBadge } from '../components/common/SkillBadge';
import { JobDrawer } from '../components/jobs/JobDrawer';
import { ErrorState } from '../components/common/ErrorState';
import { formatSalaryLPA } from '../utils/formatters';

export const JobExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobsData, setJobsData] = useState<JobListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<FilterState>({
    role: searchParams.get('role') || undefined,
    city: searchParams.get('city') || undefined,
    work_mode: undefined,
    min_exp: undefined,
    min_salary: undefined
  });

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchJobs({
        page,
        page_size: 12,
        search: search.trim() || undefined,
        role: filters.role,
        city: filters.city,
        work_mode: filters.work_mode,
        min_exp: filters.min_exp,
        min_salary: filters.min_salary
      });
      setJobsData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job postings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadJobs();
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  const columns: Column<Job>[] = [
    {
      header: 'Job Title & Role',
      render: (job) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block hover:text-blue-600">
            {job.job_title}
          </span>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
            {job.normalized_role}
          </span>
        </div>
      )
    },
    {
      header: 'Company',
      accessor: 'company',
      render: (job) => (
        <span className="font-semibold text-slate-800">{job.company}</span>
      )
    },
    {
      header: 'Location',
      render: (job) => (
        <div className="flex items-center gap-1 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.city}</span>
        </div>
      )
    },
    {
      header: 'Experience',
      render: (job) => (
        <span>{job.experience_min} - {job.experience_max} Yrs</span>
      )
    },
    {
      header: 'Salary (LPA)',
      render: (job) => (
        <span className="font-bold text-slate-900">
          {formatSalaryLPA(job.salary_min, job.salary_max)}
        </span>
      )
    },
    {
      header: 'Extracted Skills',
      render: (job) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {job.skills.slice(0, 3).map((s) => (
            <SkillBadge key={s.id} name={s.name} category={s.category} size="sm" />
          ))}
          {job.skills.length > 3 && (
            <span className="text-[10px] text-slate-400 font-semibold self-center">
              +{job.skills.length - 3}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Posted',
      accessor: 'posted_date',
      render: (job) => (
        <span className="text-slate-500 text-[11px]">{job.posted_date}</span>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Explorer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore analyzed job market postings with extracted skill metadata, normalized roles, and compensation.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title, company or keyword (e.g. Data Scientist, Flipkart, PyTorch)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Results Table */}
      {error ? (
        <ErrorState message={error} onRetry={loadJobs} />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{jobsData?.jobs.length || 0}</strong> of{' '}
              <strong className="text-slate-900">{jobsData?.total || 0}</strong> job postings
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">
              Tip: Click any row to inspect deep role requirements
            </span>
          </div>

          <DataTable
            columns={columns}
            data={jobsData?.jobs || []}
            keyExtractor={(j) => j.id}
            onRowClick={(j) => setSelectedJob(j)}
            page={page}
            totalPages={jobsData?.total_pages || 1}
            onPageChange={(newPage) => setPage(newPage)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Job Details Slide-over Drawer */}
      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};
