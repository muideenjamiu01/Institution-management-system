'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '@/lib/student-auth-context';

export default function StudentIndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useStudentAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/student/dashboard');
      } else {
        router.push('/student/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
