"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useApplicantAuth } from "@/lib/applicant-auth-context";
import { applicantKeys } from "@/lib/hooks/useApplicantQueries";
import { paymentApi } from "@/lib/api-applicant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type VerificationStatus = "verifying" | "success" | "failed";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { refreshProfile } = useApplicantAuth();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const verificationAttempted = useRef(false);
  
  // Create a custom mutation without automatic toasts for verification page
  const verifyPaymentMutation = useMutation({
    mutationFn: paymentApi.verifyPayment,
  });

  useEffect(() => {
    const reference = searchParams.get("reference");
    
    // Reset states when reference changes
    if (reference && verificationAttempted.current && !isVerified) {
      verificationAttempted.current = false;
      setIsVerified(false);
      setPaymentInfo(null);
    }
    
    // Prevent multiple calls for the same reference
    if (!reference || isVerified || verifyPaymentMutation.isPending || verificationAttempted.current) {
      return;
    }

    verificationAttempted.current = true; // Mark that we've attempted verification

    verifyPaymentMutation.mutate(reference, {
      onSuccess: async (response) => {
        if (response.data?.status === "PAID") {
          setPaymentInfo(response.data);
          setIsVerified(true); // Mark as verified to prevent further calls
          
          // Invalidate queries to mark them stale, but don't force immediate refetch
          await queryClient.invalidateQueries({ queryKey: applicantKeys.all });
          
          // Use single source of truth - either React Query OR auth context, not both
          try {
            // Try React Query first (more efficient with caching)
            await queryClient.refetchQueries({ queryKey: applicantKeys.profile(), type: 'active' });
          } catch (error) {
            // Fallback to auth context refresh if React Query fails
            console.log('React Query refetch failed, using auth context');
            await refreshProfile();
          }
        } else {
          setIsVerified(true); // Even if payment failed, mark as verified to stop retrying
        }
      },
      onError: () => {
        setIsVerified(true); // Mark as verified even on error to prevent infinite retries
      },
    });
  }, [searchParams.get("reference")]);

  const getPaymentTypeMessage = () => {
    if (!paymentInfo) return "";

    if (paymentInfo.type === "APPLICATION_FEE") {
      return "";
    } else if (paymentInfo.type === "ACCEPTANCE_FEE") {
      return paymentInfo.matricNo
        ? `Your matriculation number is: ${paymentInfo.matricNo}`
        : "Your admission has been confirmed.";
    }
    return "";
  };

  const status = verifyPaymentMutation.isPending || !isVerified
    ? "verifying" 
    : verifyPaymentMutation.isSuccess && paymentInfo?.status === "PAID"
    ? "success"
    : "failed";

  const error = verifyPaymentMutation.error instanceof Error 
    ? verifyPaymentMutation.error.message 
    : "Failed to verify payment";

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Payment Verification</CardTitle>
          <CardDescription className="text-center">
            {status === "verifying" && "Verifying your payment..."}
            {status === "success" && "Payment Successful"}
            {status === "failed" && "Verification Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <p className="text-muted-foreground">
                Please wait while we verify your payment...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800">
                  Payment Successful!
                </h3>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">
                      Your{" "}
                      {paymentInfo?.type === "APPLICATION_FEE"
                        ? "application"
                        : "acceptance"}{" "}
                      fee payment has been confirmed.
                    </p>
                    <p>{getPaymentTypeMessage()}</p>
                    {paymentInfo?.matricNo && (
                      <p className="text-lg font-bold bg-blue-100 text-blue-900 px-3 py-2 rounded mt-2">
                        📋 {paymentInfo.matricNo}
                      </p>
                    )}
                    {paymentInfo?.paidAt && (
                      <p className="text-sm">
                        Paid: {new Date(paymentInfo.paidAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="">
                <Button
                  onClick={() => router.push("/applicant/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
                
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="rounded-full bg-red-100 p-4 mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-800">
                  Verification Failed
                </h3>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error ||
                    "We could not verify your payment. Please try again or contact support."}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push("/applicant/payment")}
                  className="w-full sm:flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/applicant/dashboard")}
                  variant="outline"
                  className="w-full sm:flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
