import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, applicationApi, paymentApi, documentApi } from '@/lib/api-applicant';
import { useToast } from '@/components/ui/use-toast';

// Query Keys
export const applicantKeys = {
  all: ['applicant'] as const,
  profile: () => [...applicantKeys.all, 'profile'] as const,
  application: () => [...applicantKeys.all, 'application'] as const,
  applicationStatus: () => [...applicantKeys.application(), 'status'] as const,
  payments: () => [...applicantKeys.all, 'payments'] as const,
  paymentHistory: () => [...applicantKeys.payments(), 'history'] as const,
  documents: () => [...applicantKeys.all, 'documents'] as const,
};

// Rate limiting helper
let lastProfileFetch = 0;
const PROFILE_FETCH_COOLDOWN = 30000; // 30 seconds minimum between fetches

const rateLimitedProfileFetch = async () => {
  const now = Date.now();
  if (now - lastProfileFetch < PROFILE_FETCH_COOLDOWN) {
    throw new Error('Rate limited: Please wait before refreshing again');
  }
  lastProfileFetch = now;
  return profileApi.getProfile();
};

// ===== Profile Hooks =====
export const useApplicantProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: applicantKeys.profile(),
    queryFn: rateLimitedProfileFetch,
    staleTime: 1000 * 60 * 15, // 15 minutes - longer cache
    gcTime: 1000 * 60 * 60, // 1 hour in memory
    refetchOnWindowFocus: false, // Don't auto-refetch on focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchInterval: false, // Disable automatic refetching
    retry: (failureCount, error: any) => {
      // Don't retry on 429 errors
      if (error?.response?.status === 429) return false;
      return failureCount < 2;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.profile() });
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

// ===== Application Hooks =====
export const useApplicationStatus = () => {
  return useQuery({
    queryKey: applicantKeys.applicationStatus(),
    queryFn: applicationApi.getApplicationStatus,
    staleTime: 1000 * 60 * 15, // 15 minutes - longer cache for status
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: applicationApi.submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.applicationStatus() });
      queryClient.invalidateQueries({ queryKey: applicantKeys.profile() });
      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit application',
        variant: 'destructive',
      });
    },
  });
};

// ===== Payment Hooks =====
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: applicantKeys.paymentHistory(),
    queryFn: paymentApi.getPaymentHistory,
    staleTime: 1000 * 60 * 10, // 10 minutes - payment history changes less frequently
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};

export const useInitializeApplicationFee = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (method: 'PAYSTACK' | 'FLUTTERWAVE') =>
      paymentApi.initializeApplicationFee(method),
    onSuccess: (data) => {
      // Redirect to payment gateway
      if (data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
      } else {
        toast({
          title: 'Error',
          description: 'Payment URL not received from gateway',
          variant: 'destructive',
        });
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

export const useInitializeAcceptanceFee = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (method: 'PAYSTACK' | 'FLUTTERWAVE') =>
      paymentApi.initializeAcceptanceFee(method),
    onSuccess: (data) => {
      // Redirect to payment gateway
      if (data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
      } else {
        toast({
          title: 'Error',
          description: 'Payment URL not received from gateway',
          variant: 'destructive',
        });
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

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: paymentApi.verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.paymentHistory() });
      queryClient.invalidateQueries({ queryKey: applicantKeys.applicationStatus() });
      toast({
        title: 'Success',
        description: 'Payment verified successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    },
  });
};

// Document Upload Hooks
export const useUploadDocuments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: documentApi.uploadDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.documents() });
      queryClient.invalidateQueries({ queryKey: applicantKeys.profile() });
      toast({
        title: 'Success',
        description: 'Documents uploaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload documents',
        variant: 'destructive',
      });
    },
  });
};

export const useGetDocuments = () => {
  return useQuery({
    queryKey: applicantKeys.documents(),
    queryFn: documentApi.getDocuments,
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.documents() });
      queryClient.invalidateQueries({ queryKey: applicantKeys.profile() });
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete document',
        variant: 'destructive',
      });
    },
  });
};
