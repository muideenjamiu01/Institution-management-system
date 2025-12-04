import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance for applicant portal
export const applicantApi = axios.create({
  baseURL: `${API_BASE_URL}/applicant`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('applicant_access_token');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('applicant_refresh_token');
  }
  return null;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('applicant_access_token', accessToken);
    localStorage.setItem('applicant_refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('applicant_access_token');
    localStorage.removeItem('applicant_refresh_token');
    localStorage.removeItem('applicant_user');
  }
};

export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('applicant_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setStoredUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('applicant_user', JSON.stringify(user));
  }
};

// Request interceptor to add token to requests
applicantApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

applicantApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Don't trigger token refresh on login or register endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return applicantApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/applicant/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/applicant/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return applicantApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/applicant/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===== Authentication API =====
export const authApi = {
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    const response = await applicantApi.post('/auth/register', data);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await applicantApi.post('/auth/login', { username, password });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await applicantApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await applicantApi.post('/auth/reset-password', { token, password });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await applicantApi.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await applicantApi.post('/auth/logout');
    clearTokens();
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await applicantApi.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ===== Profile API =====
export const profileApi = {
  getProfile: async () => {
    const response = await applicantApi.get('/profile');
    return response.data;
  },

  updateProfile: async (data: {
    phone?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    previousSchool?: string;
    gradeAverage?: number;
  }) => {
    const response = await applicantApi.put('/profile', data);
    return response.data;
  },
};

// ===== Application API =====
export const applicationApi = {
  submitApplication: async (data: {
    phone: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    address: string;
    previousSchool: string;
    gradeAverage: number;
    programType: 'ND' | 'HND' | 'BSC' | 'MSC' | 'PHD';
    departmentId: number;
    programId: number;
  }) => {
    const response = await applicantApi.post('/application/submit', data);
    return response.data;
  },

  getApplicationStatus: async () => {
    const response = await applicantApi.get('/application/status');
    return response.data;
  },
};

// Helper functions
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRelativeTime = (date: string | Date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(date);
};

export const getApplicationStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 bg-green-50';
    case 'REJECTED':
      return 'text-red-600 bg-red-50';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getApplicationStatusText = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'PENDING':
      return 'Under Review';
    default:
      return status;
  }
};

// ===== Payment API =====
export const paymentApi = {
  initializeApplicationFee: async (method: 'PAYSTACK' | 'FLUTTERWAVE') => {
    const response = await applicantApi.post('/payment/application-fee/initialize', { method });
    return response.data;
  },

  initializeAcceptanceFee: async (method: 'PAYSTACK' | 'FLUTTERWAVE') => {
    const response = await applicantApi.post('/payment/acceptance-fee/initialize', { method });
    return response.data;
  },

  verifyPayment: async (reference: string) => {
    const response = await applicantApi.get(`/payment/verify/${reference}`);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await applicantApi.get('/payment/history');
    return response.data;
  },
};
