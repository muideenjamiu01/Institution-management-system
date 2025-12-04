import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dashboardApi,
  courseApi,
  assignmentApi,
  resultsApi,
  paymentsApi,
  documentsApi,
  profileApi,
} from '@/lib/api-student';
import { useToast } from '@/components/ui/use-toast';

// Query Keys
export const studentKeys = {
  all: ['student'] as const,
  dashboard: () => [...studentKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...studentKeys.dashboard(), 'stats'] as const,
  dashboardActivities: () => [...studentKeys.dashboard(), 'activities'] as const,
  dashboardNotifications: () => [...studentKeys.dashboard(), 'notifications'] as const,
  courses: () => [...studentKeys.all, 'courses'] as const,
  availableCourses: (params?: any) => [...studentKeys.courses(), 'available', params] as const,
  registeredCourses: (params?: any) => [...studentKeys.courses(), 'registered', params] as const,
  courseDetails: (id: number) => [...studentKeys.courses(), 'details', id] as const,
  assignments: () => [...studentKeys.all, 'assignments'] as const,
  assignmentList: (params?: any) => [...studentKeys.assignments(), 'list', params] as const,
  assignmentDetails: (id: number) => [...studentKeys.assignments(), 'details', id] as const,
  assignmentSubmission: (id: number) => [...studentKeys.assignments(), 'submission', id] as const,
  results: () => [...studentKeys.all, 'results'] as const,
  resultsList: (params?: any) => [...studentKeys.results(), 'list', params] as const,
  gpa: (sessionId?: number) => [...studentKeys.results(), 'gpa', sessionId] as const,
  cgpa: () => [...studentKeys.results(), 'cgpa'] as const,
  payments: () => [...studentKeys.all, 'payments'] as const,
  invoices: (params?: any) => [...studentKeys.payments(), 'invoices', params] as const,
  paymentHistory: () => [...studentKeys.payments(), 'history'] as const,
  walletBalance: () => [...studentKeys.payments(), 'wallet'] as const,
  documents: () => [...studentKeys.all, 'documents'] as const,
  profile: () => [...studentKeys.all, 'profile'] as const,
  academicInfo: () => [...studentKeys.profile(), 'academic'] as const,
};

// ===== Dashboard Hooks =====
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: studentKeys.dashboard(),
    queryFn: dashboardApi.getOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: studentKeys.dashboardStats(),
    queryFn: dashboardApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDashboardActivities = () => {
  return useQuery({
    queryKey: studentKeys.dashboardActivities(),
    queryFn: dashboardApi.getRecentActivities,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: [...studentKeys.dashboard(), 'alerts'] as const,
    queryFn: dashboardApi.getAlerts,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useDashboardNotifications = (params?: { page?: number; limit?: number; type?: string }) => {
  return useQuery({
    queryKey: [...studentKeys.dashboardNotifications(), params] as const,
    queryFn: () => dashboardApi.getNotifications(params),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.dashboardNotifications() });
      queryClient.invalidateQueries({ queryKey: studentKeys.dashboard() });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.dashboardNotifications() });
      queryClient.invalidateQueries({ queryKey: studentKeys.dashboard() });
    },
  });
};

// ===== Course Hooks =====
export const useAvailableCourses = (params?: { level?: number; semester?: number }) => {
  return useQuery({
    queryKey: studentKeys.availableCourses(params),
    queryFn: () => courseApi.getAvailableCourses(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useRegisteredCourses = (params?: { sessionId?: number; semester?: number }) => {
  return useQuery({
    queryKey: studentKeys.registeredCourses(params),
    queryFn: () => courseApi.getRegisteredCourses(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCourseDetails = (courseId: number) => {
  return useQuery({
    queryKey: studentKeys.courseDetails(courseId),
    queryFn: () => courseApi.getCourseDetails(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useRegisterCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ courseId, sessionId, semester }: {
      courseId: number;
      sessionId: number;
      semester: number;
    }) => courseApi.registerCourse(courseId, sessionId, semester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.courses() });
      toast({
        title: 'Success',
        description: 'Course registered successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to register course',
        variant: 'destructive',
      });
    },
  });
};

export const useDropCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: courseApi.dropCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.courses() });
      toast({
        title: 'Success',
        description: 'Course dropped successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to drop course',
        variant: 'destructive',
      });
    },
  });
};

// ===== Assignment Hooks =====
export const useAssignments = (params?: { courseId?: number; status?: string }) => {
  return useQuery({
    queryKey: studentKeys.assignmentList(params),
    queryFn: () => assignmentApi.getAssignments(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAssignmentDetails = (assignmentId: number) => {
  return useQuery({
    queryKey: studentKeys.assignmentDetails(assignmentId),
    queryFn: () => assignmentApi.getAssignmentDetails(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useAssignmentSubmission = (assignmentId: number) => {
  return useQuery({
    queryKey: studentKeys.assignmentSubmission(assignmentId),
    queryFn: () => assignmentApi.getSubmission(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ assignmentId, formData }: { assignmentId: number; formData: FormData }) =>
      assignmentApi.submitAssignment(assignmentId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.assignmentSubmission(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ queryKey: studentKeys.assignments() });
      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit assignment',
        variant: 'destructive',
      });
    },
  });
};

// ===== Results Hooks =====
export const useResults = (params?: { sessionId?: number; semester?: number }) => {
  return useQuery({
    queryKey: studentKeys.resultsList(params),
    queryFn: () => resultsApi.getResults(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGPA = (sessionId?: number) => {
  return useQuery({
    queryKey: studentKeys.gpa(sessionId),
    queryFn: () => resultsApi.getGPA(sessionId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCGPA = () => {
  return useQuery({
    queryKey: studentKeys.cgpa(),
    queryFn: resultsApi.getCGPA,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// ===== Payment Hooks =====
export const useInvoices = (params?: { status?: string; type?: string }) => {
  return useQuery({
    queryKey: studentKeys.invoices(params),
    queryFn: () => paymentsApi.getInvoices(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: studentKeys.paymentHistory(),
    queryFn: paymentsApi.getPaymentHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useWalletBalance = () => {
  return useQuery({
    queryKey: studentKeys.walletBalance(),
    queryFn: paymentsApi.getWalletBalance,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useInitializePayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ invoiceId, method }: { invoiceId: number; method: 'PAYSTACK' | 'FLUTTERWAVE' }) =>
      paymentsApi.initializePayment(invoiceId, method),
    onSuccess: (data) => {
      // Handle the nested response structure
      const authUrl = data.data?.authorization_url || data.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
    },
  });
};

export const usePayWithWallet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: number }) =>
      paymentsApi.payWithWallet(invoiceId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: studentKeys.payments() });
      queryClient.invalidateQueries({ queryKey: studentKeys.walletBalance() });
      toast({
        title: 'Success',
        description: 'Payment completed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process payment',
        variant: 'destructive',
      });
    },
  });
};

export const usePaymentStats = () => {
  return useQuery({
    queryKey: [...studentKeys.payments(), 'stats'] as const,
    queryFn: paymentsApi.getPaymentStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ===== Profile Hooks =====
export const useStudentProfile = () => {
  return useQuery({
    queryKey: studentKeys.profile(),
    queryFn: profileApi.getProfile,
    staleTime: 1000 * 60 * 30, // 30 minutes - longer cache to reduce calls
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

export const useAcademicInfo = () => {
  return useQuery({
    queryKey: studentKeys.academicInfo(),
    queryFn: profileApi.getAcademicInfo,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
};

export const useChangePassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });
};

// ===== Documents Hooks =====
export const useDocuments = () => {
  return useQuery({
    queryKey: studentKeys.documents(),
    queryFn: documentsApi.listDocuments,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
