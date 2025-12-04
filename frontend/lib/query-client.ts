import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - increased from 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes in memory - increased from 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 429 rate limit errors
        if (error?.response?.status === 429) return false;
        // Only retry network errors and 500+ server errors up to 2 times
        return failureCount < 2 && (error?.code === 'NETWORK_ERROR' || error?.response?.status >= 500);
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchInterval: false, // Disable automatic polling
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on 429 rate limit errors or client errors (4xx)
        if (error?.response?.status === 429 || (error?.response?.status >= 400 && error?.response?.status < 500)) {
          return false;
        }
        return failureCount < 1; // Only retry server errors once
      },
      retryDelay: 2000, // Wait 2 seconds before retrying mutations
    },
  },
});
