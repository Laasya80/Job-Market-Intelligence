import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserLoginRequest, UserRegisterRequest, UserProfileUpdateRequest } from '../types';
import { loginUser, registerUser, getMe, updateUserProfile } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: UserLoginRequest) => Promise<void>;
  register: (data: UserRegisterRequest) => Promise<void>;
  updateProfile: (data: UserProfileUpdateRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LEGACY_DEMO_EMAILS = new Set(['arjun@jmi.ai', 'priya@jmi.ai', 'rahul@jmi.ai', 'sneha@jmi.ai']);

const getSavedUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('jmi_auth_user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser) as User;
    return LEGACY_DEMO_EMAILS.has(parsed.email?.toLowerCase()) ? null : parsed;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return getSavedUser();
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedUser = getSavedUser();
    const rawUser = localStorage.getItem('jmi_auth_user');
    if (rawUser && !savedUser) {
      localStorage.removeItem('jmi_auth_user');
      localStorage.removeItem('jmi_auth_token');
      return null;
    }
    return localStorage.getItem('jmi_auth_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if token exists, fetch updated user profile
    const storedToken = localStorage.getItem('jmi_auth_token');
    if (storedToken && storedToken !== 'demo-token') {
      getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('jmi_auth_user', JSON.stringify(userData));
        })
        .catch(() => {
          // Keep current state
        });
    }
  }, []);

  const login = async (credentials: UserLoginRequest) => {
    setIsLoading(true);
    try {
      const res = await loginUser(credentials);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('jmi_auth_token', res.access_token);
      localStorage.setItem('jmi_auth_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: UserRegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('jmi_auth_token', res.access_token);
      localStorage.setItem('jmi_auth_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UserProfileUpdateRequest) => {
    setIsLoading(true);
    try {
      const updated = await updateUserProfile(data);
      setUser(updated);
      localStorage.setItem('jmi_auth_user', JSON.stringify(updated));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jmi_auth_token');
    localStorage.removeItem('jmi_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
