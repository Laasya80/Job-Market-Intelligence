import axios from 'axios';
import {
  DashboardSummary,
  TopSkill,
  RoleDistribution,
  HiringHotspot,
  EmergingSkill,
  RecentInsight,
  JobListResponse,
  Job,
  SkillPairCooccurrence,
  RoleAnalytics,
  RoleComparison,
  SkillGapResponse,
  SalaryAnalytics,
  ClusterInfo,
  AnomalyAlert,
  PipelineStatus,
  User,
  TokenResponse,
  UserRegisterRequest,
  UserLoginRequest,
  UserProfileUpdateRequest
} from '../types';

const configuredApiUrl = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '');
const API_BASE_URL = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jmi_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = async (data: UserRegisterRequest): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>('/auth/register', data);
  return res.data;
};

export const loginUser = async (data: UserLoginRequest): Promise<TokenResponse> => {
  const res = await api.post<TokenResponse>('/auth/login', data);
  return res.data;
};

export const getMe = async (): Promise<User> => {
  const res = await api.get<User>('/auth/me');
  return res.data;
};

export const updateUserProfile = async (data: UserProfileUpdateRequest): Promise<User> => {
  const res = await api.put<User>('/auth/profile', data);
  return res.data;
};

export const fetchDemoUsers = async (): Promise<User[]> => {
  const res = await api.get<User[]>('/auth/demo-users');
  return res.data;
};

// Dashboard APIs
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get<DashboardSummary>('/dashboard/summary');
  return res.data;
};

export const fetchTopSkills = async (limit: number = 10): Promise<TopSkill[]> => {
  const res = await api.get<TopSkill[]>(`/dashboard/top-skills?limit=${limit}`);
  return res.data;
};

export const fetchMonthlyTrends = async (skills?: string[]): Promise<any> => {
  const query = skills && skills.length > 0 ? `?skills=${encodeURIComponent(skills.join(','))}` : '';
  const res = await api.get(`/dashboard/monthly-trends${query}`);
  return res.data;
};

export const fetchRoleDistribution = async (): Promise<RoleDistribution[]> => {
  const res = await api.get<RoleDistribution[]>('/dashboard/role-distribution');
  return res.data;
};

export const fetchHiringHotspots = async (): Promise<HiringHotspot[]> => {
  const res = await api.get<HiringHotspot[]>('/dashboard/hiring-hotspots');
  return res.data;
};

export const fetchEmergingSkills = async (limit: number = 10): Promise<EmergingSkill[]> => {
  const res = await api.get<EmergingSkill[]>(`/dashboard/emerging-skills?limit=${limit}`);
  return res.data;
};

export const fetchRecentInsights = async (): Promise<RecentInsight[]> => {
  const res = await api.get<RecentInsight[]>('/dashboard/insights');
  return res.data;
};

// Jobs APIs
export const fetchJobs = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  city?: string;
  work_mode?: string;
  min_exp?: number;
  max_exp?: number;
  min_salary?: number;
  skill?: string;
}): Promise<JobListResponse> => {
  const res = await api.get<JobListResponse>('/jobs', { params });
  return res.data;
};

export const fetchJobById = async (id: number): Promise<Job> => {
  const res = await api.get<Job>(`/jobs/${id}`);
  return res.data;
};

// Skill Trends APIs
export const fetchSkillTrendsDetailed = async (params: {
  role?: string;
  city?: string;
  skills?: string[];
}): Promise<any> => {
  const queryParams: Record<string, string> = {};
  if (params.role) queryParams.role = params.role;
  if (params.city) queryParams.city = params.city;
  if (params.skills && params.skills.length > 0) queryParams.skills = params.skills.join(',');

  const res = await api.get('/skills/trends', { params: queryParams });
  return res.data;
};

export const fetchSkillCooccurrences = async (minSupport: number = 5, limit: number = 20): Promise<SkillPairCooccurrence[]> => {
  const res = await api.get<SkillPairCooccurrence[]>(`/skills/cooccurrence?min_support=${minSupport}&limit=${limit}`);
  return res.data;
};

export const fetchSkillHeatmap = async (topN: number = 10): Promise<any> => {
  const res = await api.get(`/skills/heatmap?top_n=${topN}`);
  return res.data;
};

export const compareSkills = async (skillA: string, skillB: string): Promise<any> => {
  const res = await api.get(`/skills/compare?skill_a=${encodeURIComponent(skillA)}&skill_b=${encodeURIComponent(skillB)}`);
  return res.data;
};

// Roles APIs
export const fetchAllRoles = async (): Promise<string[]> => {
  const res = await api.get<string[]>('/roles');
  return res.data;
};

export const fetchRoleAnalytics = async (roleName: string): Promise<RoleAnalytics> => {
  const res = await api.get<RoleAnalytics>(`/roles/${encodeURIComponent(roleName)}/analytics`);
  return res.data;
};

export const compareTwoRoles = async (roleA: string, roleB: string): Promise<RoleComparison> => {
  const res = await api.get<RoleComparison>(`/roles/compare/roles?role_a=${encodeURIComponent(roleA)}&role_b=${encodeURIComponent(roleB)}`);
  return res.data;
};

// Salary APIs
export const fetchSalaryAnalytics = async (params?: {
  role?: string;
  city?: string;
  min_exp?: number;
  max_exp?: number;
}): Promise<SalaryAnalytics> => {
  const res = await api.get<SalaryAnalytics>('/salary/analytics', { params });
  return res.data;
};

// Skill Gap APIs
export const analyzeSkillGap = async (payload: {
  candidate_skills: string[];
  target_role: string;
  location?: string;
  experience_years?: number;
  raw_resume_text?: string;
}): Promise<SkillGapResponse> => {
  const res = await api.post<SkillGapResponse>('/skill-gap/analyze', payload);
  return res.data;
};

export const uploadResumeAndAnalyze = async (file: File, targetRole: string): Promise<SkillGapResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_role', targetRole);

  const res = await api.post<SkillGapResponse>('/skill-gap/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Pipeline APIs
export const fetchPipelineStatus = async (): Promise<PipelineStatus> => {
  const res = await api.get<PipelineStatus>('/pipeline/status');
  return res.data;
};

export const uploadDatasetCSV = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/pipeline/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const resetDemoDataset = async (): Promise<any> => {
  const res = await api.post('/pipeline/reset-demo');
  return res.data;
};

// ML & Analytics APIs
export const fetchJobClusters = async (): Promise<ClusterInfo[]> => {
  const res = await api.get<ClusterInfo[]>('/analytics/clusters');
  return res.data;
};

export const fetchMarketAnomalies = async (): Promise<AnomalyAlert[]> => {
  const res = await api.get<AnomalyAlert[]>('/analytics/anomalies');
  return res.data;
};

export default api;
