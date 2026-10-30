import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, AlertTriangle, ChevronDown, CheckCircle, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMarketAnomalies } from '../../api/client';
import { AnomalyAlert } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopNavbarProps {
  onSearch?: (term: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketAnomalies()
      .then((data) => setAnomalies(data))
      .catch(() => {});

  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`);
      if (onSearch) onSearch(searchTerm.trim());
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for skills, roles, companies and more..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </form>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Market Anomaly Alerts"
          >
            <Bell className="w-5 h-5" />
            {anomalies.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-800">Market Anomaly Alerts</h4>
                </div>
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  {anomalies.length} active
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {anomalies.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    No market anomalies detected.
                  </div>
                ) : (
                  anomalies.map((anom) => (
                    <div key={anom.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-slate-800">{anom.item_name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded">
                          {anom.anomaly_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{anom.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-85 transition-opacity text-left cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-full ${user?.avatar_color || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
              {getInitials(user?.full_name)}
            </div>
            <div className="hidden sm:block text-left">
              <h5 className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name || 'Guest User'}</h5>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${user?.avatar_color || 'bg-blue-600'} text-white font-black text-sm flex items-center justify-center`}>
                    {getInitials(user?.full_name)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-black text-slate-900 truncate">{user?.full_name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="px-2 pt-2 space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/resume');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Resume review</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
