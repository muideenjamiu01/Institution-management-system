import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook to handle rate limit errors globally
 * Provides user feedback when 429 errors occur
 */
export const useRateLimitHandler = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleQueryError = (error: any) => {
      if (error?.response?.status === 429) {
        toast({
          title: 'Too Many Requests',
          description: 'Please wait a moment before trying again. The system is temporarily limiting requests to ensure stability.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    };

    // Set up global error handler for queries
    queryClient.getQueryCache().config.onError = handleQueryError;
    queryClient.getMutationCache().config.onError = handleQueryError;

    return () => {
      // Clean up
      queryClient.getQueryCache().config.onError = undefined;
      queryClient.getMutationCache().config.onError = undefined;
    };
  }, [toast, queryClient]);
};

/**
 * Utility function to check if an error is a rate limit error
 */
export const isRateLimitError = (error: any): boolean => {
  return error?.response?.status === 429;
};

/**
 * Utility function to get the retry delay for rate limit errors
 */
export const getRateLimitRetryDelay = (error: any): number => {
  if (isRateLimitError(error)) {
    // Check for Retry-After header (in seconds)
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter) * 1000; // Convert to milliseconds
    }
    // Default to 60 seconds for rate limit errors
    return 60000;
  }
  return 0;
};

/**
 * Debounce function to prevent rapid successive API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function to limit the frequency of function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};