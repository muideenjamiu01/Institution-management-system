'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  authApi,
  profileApi,
  setTokens,
  clearTokens,
  getStoredUser,
  setStoredUser,
} from './api-applicant';

interface Applicant {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  previousSchool?: string | null;
  gradeAverage?: number | null;
  applicationStatus: string;
  hasMatricNumber: boolean;
  matricNo?: string | null;
  applicationFeePaid?: boolean;
  acceptanceFeePaid?: boolean;
}

interface AuthContextType {
  applicant: Applicant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => Promise<{ username: string; temporaryPassword: string }>;
  updateApplicant: (applicant: Applicant) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ApplicantAuthProvider = ({ children }: { children: ReactNode }) => {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage on mount
    const storedUser = getStoredUser();
    if (storedUser) {
      setApplicant(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      // authApi.login returns response.data from backend
      // Backend structure: { success, message, data: { accessToken, refreshToken, applicant } }
      const { accessToken, refreshToken, applicant: applicantData } = response.data;

      setTokens(accessToken, refreshToken);
      setStoredUser(applicantData);
      setApplicant(applicantData);

      router.push('/applicant/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      setApplicant(null);
      router.push('/applicant/login');
    }
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    try {
      const response = await authApi.register(data);
      
      // Return the generated credentials
      return {
        username: response.data.username,
        temporaryPassword: response.data.temporaryPassword,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const updateApplicant = (updatedApplicant: Applicant) => {
    setApplicant(updatedApplicant);
    setStoredUser(updatedApplicant);
  };

  const refreshProfile = async () => {
    try {
      // Only refresh if user is authenticated
      if (!applicant) return;
      
      // Add rate limiting to prevent excessive calls
      const now = Date.now();
      const lastRefresh = parseInt(localStorage.getItem('lastAuthProfileRefresh') || '0');
      
      if (now - lastRefresh < 30000) { // 30 second cooldown
        console.log('Auth profile refresh throttled');
        return;
      }
      
      const response = await profileApi.getProfile();
      const freshApplicantData = response.data;
      
      // Merge with existing applicant data to preserve any fields
      const updatedData = {
        ...applicant,
        ...freshApplicantData,
      };
      
      setApplicant(updatedData);
      setStoredUser(updatedData);
      localStorage.setItem('lastAuthProfileRefresh', now.toString());
    } catch (error: any) {
      console.error('Failed to refresh profile:', error);
      // Don't retry on 429 errors to prevent further rate limiting
      if (error?.response?.status === 429) {
        console.warn('Rate limited - skipping profile refresh');
        return;
      }
      // Don't clear user data on refresh failure
      // This prevents logout on API errors
    }
  };

  const value = {
    applicant,
    isLoading,
    isAuthenticated: !!applicant,
    login,
    logout,
    register,
    updateApplicant,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useApplicantAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useApplicantAuth must be used within an ApplicantAuthProvider');
  }
  return context;
};
