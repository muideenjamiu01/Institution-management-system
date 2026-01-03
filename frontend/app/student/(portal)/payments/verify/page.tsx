'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { studentApi } from '@/lib/api-student';

export default function PaymentVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from the URL
        const trxref = searchParams.get('trxref');
        const reference = searchParams.get('reference');
        const status = searchParams.get('status');
        
        const paymentReference = reference || trxref;

        if (!paymentReference) {
          console.error('No payment reference found in URL');
          setError('Invalid payment reference');
          setTimeout(() => {
            router.replace('/student/payments?verification=failed');
          }, 2000);
          return;
        }

        console.log('Verifying payment with reference:', paymentReference);

        // Call the backend verification endpoint with api=true parameter
        try {
          const response = await studentApi.get(`/payments/verify?reference=${paymentReference}&api=true`, {
            maxRedirects: 0, // Don't follow redirects
            validateStatus: (status) => status >= 200 && status < 400, // Accept 2xx and 3xx
          });
          
          console.log('Verification response:', response.data);

          if (response.data.success && response.data.data?.status === 'PAID') {
            console.log('Payment verified successfully');
            // Wait a moment to show success message
            setTimeout(() => {
              router.replace(`/student/payments?verification=success&reference=${paymentReference}`);
            }, 1500);
          } else {
            console.log('Payment verification failed');
            setTimeout(() => {
              router.replace(`/student/payments?verification=failed&reference=${paymentReference}`);
            }, 1500);
          }
        } catch (apiError: any) {
          console.error('API verification error:', apiError);
          
          // If the status parameter indicates success, trust it
          if (status === 'successful' || status === 'success') {
            console.log('Using status parameter as fallback');
            setTimeout(() => {
              router.replace(`/student/payments?verification=success&reference=${paymentReference}`);
            }, 1500);
          } else {
            setError(apiError.response?.data?.message || 'Verification failed');
            setTimeout(() => {
              router.replace(`/student/payments?verification=failed&reference=${paymentReference}`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setError('An unexpected error occurred');
        setTimeout(() => {
          router.replace('/student/payments?verification=failed');
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {verifying ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment with the gateway...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </>
        ) : error ? (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        ) : (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Verified</h2>
            <p className="text-gray-600">Your payment has been confirmed successfully!</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}