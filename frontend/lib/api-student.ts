import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance for student portal
export const studentApi = axios.create({
  baseURL: `${API_BASE_URL}/student`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('student_access_token');
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('student_refresh_token');
  }
  return null;
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('student_access_token', accessToken);
    localStorage.setItem('student_refresh_token', refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('student_access_token');
    localStorage.removeItem('student_refresh_token');
    localStorage.removeItem('student_user');
  }
};

export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('student_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setStoredUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('student_user', JSON.stringify(user));
  }
};

// Request interceptor - add auth token
studentApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
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

studentApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Don't trigger token refresh on login or register endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register');

    // If error is 401 and we haven't tried to refresh yet, and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return studentApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/student/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/student/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return studentApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/student/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===== Authentication API =====
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await studentApi.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (data: {
    matricNo: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    const response = await studentApi.post('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await studentApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await studentApi.post('/auth/reset-password', { token, password });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await studentApi.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await studentApi.post('/auth/logout');
    clearTokens();
    return response.data;
  },
};

// ===== Dashboard API =====
export const dashboardApi = {
  getOverview: async () => {
    const response = await studentApi.get('/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await studentApi.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await studentApi.get('/dashboard/activities');
    return response.data;
  },

  getAlerts: async () => {
    const response = await studentApi.get('/dashboard/alerts');
    return response.data;
  },

  getUpcomingDeadlines: async () => {
    const response = await studentApi.get('/dashboard/deadlines');
    return response.data;
  },

  getNotifications: async (params?: { page?: number; limit?: number; type?: string }) => {
    const response = await studentApi.get('/notifications', { params });
    return response.data;
  },

  markNotificationAsRead: async (notificationId: number) => {
    const response = await studentApi.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await studentApi.patch('/notifications/read-all');
    return response.data;
  },

  getAcademicOverview: async () => {
    const response = await studentApi.get('/dashboard/academic-overview');
    return response.data;
  },
};

// ===== Course Registration API =====
export const courseApi = {
  getAvailableCourses: async (params?: { level?: number; semester?: number }) => {
    const response = await studentApi.get('/courses/available', { params });
    return response.data;
  },

  getRegisteredCourses: async (params?: { sessionId?: number; semester?: number }) => {
    const response = await studentApi.get('/courses/registered', { params });
    return response.data;
  },

  registerCourse: async (courseId: number, sessionId: number, semester: number) => {
    const response = await studentApi.post('/courses/register', {
      courseId,
      sessionId,
      semester,
    });
    return response.data;
  },

  dropCourse: async (registrationId: number) => {
    const response = await studentApi.delete(`/courses/drop/${registrationId}`);
    return response.data;
  },

  getCourseDetails: async (courseId: number) => {
    const response = await studentApi.get(`/courses/${courseId}`);
    return response.data;
  },

  checkPrerequisites: async (courseId: number) => {
    const response = await studentApi.get(`/courses/${courseId}/prerequisites`);
    return response.data;
  },
};

// ===== Assignments API =====
export const assignmentApi = {
  getAssignments: async (params?: { courseId?: number; status?: string }) => {
    const response = await studentApi.get('/assignments', { params });
    return response.data;
  },

  getAssignmentDetails: async (assignmentId: number) => {
    const response = await studentApi.get(`/assignments/${assignmentId}`);
    return response.data;
  },

  submitAssignment: async (assignmentId: number, formData: FormData) => {
    const response = await studentApi.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSubmission: async (assignmentId: number) => {
    const response = await studentApi.get(`/assignments/${assignmentId}/submission`);
    return response.data;
  },

  downloadAssignment: async (assignmentId: number) => {
    const response = await studentApi.get(`/assignments/${assignmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getMySubmissions: async () => {
    const response = await studentApi.get('/assignments/submissions');
    return response.data;
  },

  getPendingAssignments: async () => {
    const response = await studentApi.get('/assignments/pending');
    return response.data;
  },
};

// ===== Results API =====
export const resultsApi = {
  getResults: async (params?: { sessionId?: number; semester?: number }) => {
    const response = await studentApi.get('/results', { params });
    return response.data;
  },

  getSemesterResults: async (sessionId: number, semester: number) => {
    const response = await studentApi.get(`/results/semester/${sessionId}/${semester}`);
    return response.data;
  },

  getGPA: async (sessionId?: number) => {
    const response = await studentApi.get('/results/gpa', {
      params: { sessionId },
    });
    return response.data;
  },

  getCGPA: async () => {
    const response = await studentApi.get('/results/cgpa');
    return response.data;
  },

  getTranscript: async () => {
    const response = await studentApi.get('/results/transcript');
    return response.data;
  },

  downloadTranscript: async () => {
    const response = await studentApi.get('/results/transcript/download', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ===== Payments API =====
export const paymentsApi = {
  getInvoices: async (params?: { status?: string; type?: string }) => {
    const response = await studentApi.get('/payments/invoices', { params });
    return response.data;
  },

  getInvoiceDetails: async (invoiceId: number) => {
    const response = await studentApi.get(`/payments/invoices/${invoiceId}`);
    return response.data;
  },

  initializePayment: async (invoiceId: number, method: 'PAYSTACK' | 'FLUTTERWAVE') => {
    const response = await studentApi.post('/payments/initialize', {
      invoiceId,
      method,
    });
    return response.data;
  },

  verifyPayment: async (reference: string) => {
    const response = await studentApi.post('/payments/verify', { reference });
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await studentApi.get('/payments/history');
    return response.data;
  },

  getWalletBalance: async () => {
    const response = await studentApi.get('/payments/wallet/balance');
    return response.data;
  },

  payWithWallet: async (invoiceId: number) => {
    const response = await studentApi.post('/payments/wallet/pay', { invoiceId });
    return response.data;
  },

  downloadReceipt: async (paymentId: number) => {
    const response = await studentApi.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ===== Documents API =====
export const documentsApi = {
  downloadAdmissionLetter: async () => {
    const response = await studentApi.get('/documents/admission-letter', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadIDCard: async () => {
    const response = await studentApi.get('/documents/id-card', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadPaymentReceipt: async (paymentId: number) => {
    const response = await studentApi.get(`/documents/payment-receipt/${paymentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadTranscript: async () => {
    const response = await studentApi.get('/documents/transcript', {
      responseType: 'blob',
    });
    return response.data;
  },

  listDocuments: async () => {
    const response = await studentApi.get('/documents');
    return response.data;
  },
};

// ===== Profile API =====
export const profileApi = {
  getProfile: async () => {
    const response = await studentApi.get('/profile');
    return response.data;
  },

  updateProfile: async (data: {
    phone?: string;
    address?: string;
    email?: string;
  }) => {
    const response = await studentApi.put('/profile', data);
    return response.data;
  },

  uploadProfilePicture: async (formData: FormData) => {
    const response = await studentApi.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await studentApi.post('/profile/change-password', data);
    return response.data;
  },

  getAcademicInfo: async () => {
    const response = await studentApi.get('/profile/academic');
    return response.data;
  },

  getSettings: async () => {
    const response = await studentApi.get('/profile/settings');
    return response.data;
  },
};

// Helper function to handle file downloads
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Helper function to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

// Helper function to format date
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to format relative time
export const formatRelativeTime = (date: string | Date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(date);
};
