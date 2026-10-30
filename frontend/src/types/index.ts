export interface JobSkill {
  id: number;
  name: string;
  category: string;
}

export interface Job {
  id: number;
  job_title: string;
  normalized_role: string;
  company: string;
  location?: string;
  city: string;
  state?: string;
  country: string;
  description: string;
  experience_min: number;
  experience_max: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  work_mode: string;
  posted_date: string;
  source: string;
  created_at?: string;
  skills: JobSkill[];
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
}

export interface JobListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  jobs: Job[];
}

export interface DashboardSummary {
  total_jobs: number;
  total_skills_tracked: number;
  average_salary_lpa: number;
  fastest_growing_skill: string;
  fastest_growth_rate_pct: number;
  total_companies: number;
  total_roles: number;
  total_cities: number;
  dataset_type: string;
}

export interface TopSkill {
  skill: string;
  count: number;
  percentage: number;
  category: string;
}

export interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
  average_salary: number;
}

export interface HiringHotspot {
  city: string;
  state: string;
  job_count: number;
  percentage: number;
  average_salary_lpa: number;
  col_index: number;
  top_role: string;
}

export interface EmergingSkill {
  skill: string;
  category: string;
  current_period_count: number;
  previous_period_count: number;
  growth_rate: number;
  market_share: number;
  emerging_score: number;
  status: "Emerging" | "Stable" | "Declining";
}

export interface RecentInsight {
  id: string;
  title: string;
  description: string;
  category: "growth" | "salary" | "role" | "alert";
  impact: "positive" | "neutral" | "negative";
  metric?: string;
}

export interface SkillPairCooccurrence {
  source_skill: string;
  target_skill: string;
  cooccurrence_count: number;
  support: number;
  confidence: number;
}

export interface CompetencyScore {
  competency: string;
  score: number;
  full_mark: number;
}

export interface KeywordFreq {
  keyword: string;
  frequency: number;
}

export interface CareerProgressionStep {
  level: string;
  title: string;
  experience_range: string;
  average_salary_lpa: number;
  description: string;
}

export interface RoleAnalytics {
  role: string;
  total_openings: number;
  average_salary_lpa: number;
  salary_min_lpa: number;
  salary_max_lpa: number;
  average_experience: number;
  top_industry: string;
  competencies: CompetencyScore[];
  top_tools: { name: string; count: number; pct: number }[];
  top_skills: { name: string; count: number; pct: number }[];
  top_industries: { industry: string; count: number; pct: number }[];
  common_keywords: KeywordFreq[];
  career_path: CareerProgressionStep[];
  recommended_skills: string[];
  insights: string[];
}

export interface RoleComparison {
  role_a: string;
  role_b: string;
  metrics: {
    average_salary_lpa: { role_a: number; role_b: number; diff_pct: number };
    openings: { role_a: number; role_b: number };
    avg_experience_years: { role_a: number; role_b: number };
    python_penetration_pct: { role_a: number; role_b: number };
    sql_penetration_pct: { role_a: number; role_b: number };
    ml_penetration_pct: { role_a: number; role_b: number };
  };
  common_skills: string[];
  unique_to_a: string[];
  unique_to_b: string[];
  comparison_summary: string;
}

export interface LearningRoadmapItem {
  skill: string;
  category: string;
  market_demand_pct: number;
  growth_rate_pct: number;
  gap_priority_score: number;
  recommended_duration_weeks: number;
  learning_resources: string[];
}

export interface SkillGapResponse {
  target_role: string;
  profile_match_score: number;
  total_required_skills: number;
  matched_skills: string[];
  partially_matched_skills: string[];
  missing_skills: string[];
  benchmark_market_avg_score: number;
  roadmap: LearningRoadmapItem[];
  insights: string[];
  candidate_name?: string | null;
  candidate_email?: string | null;
  candidate_phone?: string | null;
}

export interface SalaryDistributionBucket {
  salary_range: string;
  count: number;
  percentage: number;
}

export interface CitySalaryComparison {
  city: string;
  average_salary_lpa: number;
  median_salary_lpa: number;
  job_posts: number;
  growth_rate_pct: number;
  col_index: number;
  adjusted_salary_lpa: number;
}

export interface SalaryAnalytics {
  overall_avg_salary_lpa: number;
  overall_median_salary_lpa: number;
  distribution: SalaryDistributionBucket[];
  top_paying_cities: CitySalaryComparison[];
  metro_avg_lpa: number;
  non_metro_avg_lpa: number;
  metro_salary_premium_pct: number;
  work_mode_distribution: Record<string, number>;
  role_salary_table: {
    role: string;
    average_lpa: number;
    median_lpa: number;
    min_lpa: number;
    max_lpa: number;
    sample_size: number;
  }[];
  insights: string[];
}

export interface ClusterInfo {
  cluster_id: number;
  cluster_name: string;
  job_count: number;
  percentage: number;
  top_keywords: string[];
  representative_roles: string[];
  avg_salary_lpa: number;
}

export interface AnomalyAlert {
  id: string;
  metric: string;
  item_name: string;
  anomaly_type: string;
  severity: "High" | "Medium" | "Low";
  z_score: number;
  baseline_value: number;
  current_value: number;
  description: string;
  detected_at: string;
}

export interface PipelineStatus {
  records_ingested: number;
  missing_salary_pct: number;
  skill_extraction_accuracy: number;
  last_processing_time: string;
  processing_status: string;
  completeness_score: number;
  consistency_score: number;
  uniqueness_score: number;
  validity_score: number;
  active_connectors: string[];
  recent_runs: {
    id: number;
    filename: string;
    status: string;
    records_ingested: number;
    records_failed: number;
    execution_time_sec: number;
    timestamp: string;
  }[];
  logs: string[];
  schema_coverage: {
    field: string;
    type: string;
    completeness_pct: number;
    status: string;
  }[];
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  target_role: string;
  target_city: string;
  experience_years: number;
  skills: string;
  avatar_color?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserRegisterRequest {
  full_name: string;
  email: string;
  password: string;
  target_role?: string;
  target_city?: string;
  experience_years?: number;
  skills?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserProfileUpdateRequest {
  full_name?: string;
  target_role?: string;
  target_city?: string;
  experience_years?: number;
  skills?: string;
}
