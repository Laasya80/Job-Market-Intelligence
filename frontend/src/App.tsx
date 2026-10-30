import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobExplorerPage } from './pages/JobExplorerPage';
import { SkillTrendsPage } from './pages/SkillTrendsPage';
import { RoleIntelligencePage } from './pages/RoleIntelligencePage';
import { SkillGapPage } from './pages/SkillGapPage';
import { SalaryLocationPage } from './pages/SalaryLocationPage';
import { DataPipelinePage } from './pages/DataPipelinePage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentHomePage } from './pages/StudentHomePage';
import { ResumePage } from './pages/ResumePage';
import { useAuth } from './context/AuthContext';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-10 text-sm text-slate-500">Loading your workspace…</div>;
  return user ? <MainLayout /> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public & Landing Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main SaaS Analytics Dashboard Routes wrapped in MainLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<StudentHomePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/jobs" element={<JobExplorerPage />} />
          <Route path="/skills" element={<SkillTrendsPage />} />
          <Route path="/roles" element={<RoleIntelligencePage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/salary-location" element={<SalaryLocationPage />} />
          <Route path="/pipeline" element={<DataPipelinePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
