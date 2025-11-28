import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, applicationApi, paymentApi } from '@/lib/api-applicant';
import { useToast } from '@/components/ui/use-toast';

// Query Keys
export const applicantKeys = {
  all: ['applicant'] as const,
  profile: () => [...applicantKeys.all, 'profile'] as const,
  application: () => [...applicantKeys.all, 'application'] as const,
  applicationStatus: () => [...applicantKeys.application(), 'status'] as const,
  payments: () => [...applicantKeys.all, 'payments'] as const,
  paymentHistory: () => [...applicantKeys.payments(), 'history'] as const,
};

// ===== Profile Hooks =====
export const useApplicantProfile = () => {
  return useQuery({
    queryKey: applicantKeys.profile(),
    queryFn: profileApi.getProfile,
    staleTime: 1000 * 60 * 10, // 10 minutes
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
