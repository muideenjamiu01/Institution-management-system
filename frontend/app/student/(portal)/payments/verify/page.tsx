'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PaymentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get parameters from the URL
    const trxref = searchParams.get('trxref');
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');

    // Determine verification status based on parameters
    let verification = 'failed';
    if (status === 'successful' || status === 'success') {
      verification = 'success';
    }

    // Redirect to main payments page with verification parameters
    const redirectUrl = `/student/payments?verification=${verification}&reference=${reference || trxref}`;
    
    // Use replace to avoid adding to browser history
    router.replace(redirectUrl);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying Payment</h2>
        <p className="text-gray-600">Please wait while we verify your payment...</p>
      </div>
    </div>
  );
}