'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  authApi,
  setTokens,
  clearTokens,
  getStoredUser,
  setStoredUser,
} from './api-student';

interface Student {
  id: number;
  matricNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: number;
  programId: number | null;
  currentLevel: number;
  status: string;
  profilePicture: string | null;
  walletBalance: number;
  acceptanceFeePaid: boolean;
}

interface AuthContextType {
  student: Student | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    matricNo: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  updateStudent: (student: Student) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const StudentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage on mount
    const storedUser = getStoredUser();
    if (storedUser) {
      setStudent(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      const { accessToken, refreshToken, student: studentData } = response.data;

      setTokens(accessToken, refreshToken);
      setStoredUser(studentData);
      setStudent(studentData);

      router.push('/student/dashboard');
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
      setStudent(null);
      router.push('/student/login');
    }
  };

  const register = async (data: {
    matricNo: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    try {
      const response = await authApi.register(data);
      const { accessToken, refreshToken, student: studentData } = response.data;

      setTokens(accessToken, refreshToken);
      setStoredUser(studentData);
      setStudent(studentData);

      router.push('/student/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudent(updatedStudent);
    setStoredUser(updatedStudent);
  };

  const value = {
    student,
    isLoading,
    isAuthenticated: !!student,
    login,
    logout,
    register,
    updateStudent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useStudentAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};
