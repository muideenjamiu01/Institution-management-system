'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApplicantAuth } from '@/lib/applicant-auth-context';
import { 
  useApplicantProfile,
  useInitializeApplicationFee,
  useInitializeAcceptanceFee 
} from '@/lib/hooks/useApplicantQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaymentPage() {
  const { applicant } = useApplicantAuth();
  const { data: profileData } = useApplicantProfile();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [error, setError] = useState('');
  
  const initializeAppFee = useInitializeApplicationFee();
  const initializeAccFee = useInitializeAcceptanceFee();

  const currentProfile = profileData?.data || applicant;
  const hasApplicationFeePaid = currentProfile?.applicationFeePaid || false;
  const hasAcceptanceFeePaid = currentProfile?.acceptanceFeePaid || false;
  const isAdmissionApproved = currentProfile?.applicationStatus === 'APPROVED';

  const handlePayment = (feeType: 'APPLICATION' | 'ACCEPTANCE') => {
    setError('');
    
    if (feeType === 'APPLICATION') {
      initializeAppFee.mutate(paymentMethod);
    } else {
      initializeAccFee.mutate(paymentMethod);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Payment</h1>
        <p className="text-muted-foreground mt-2">
          Complete your payment to proceed with your application
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className={hasApplicationFeePaid ? 'border-green-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Application Fee
              </CardTitle>
              {hasApplicationFeePaid && (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
            </div>
            <CardDescription>This fee is required to complete your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl sm:text-3xl font-bold">₦20,000</div>
            {!hasApplicationFeePaid ? (
              <div className="space-y-4">
                <div className="space-y-3 sm:space-y-2">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'PAYSTACK' | 'FLUTTERWAVE')}>
                    <div className="flex items-center space-x-2 py-1">
                      <RadioGroupItem value="PAYSTACK" id="paystack-app" />
                      <Label htmlFor="paystack-app" className="cursor-pointer">Paystack</Label>
                    </div>
                    {/* <div className="flex items-center space-x-2 py-1">
                      <RadioGroupItem value="FLUTTERWAVE" id="flutterwave-app" />
                      <Label htmlFor="flutterwave-app" className="cursor-pointer">Flutterwave</Label>
                    </div> */}
                  </RadioGroup>
                </div>
                <Button onClick={() => handlePayment('APPLICATION')} disabled={initializeAppFee.isPending} className="w-full">
                  {initializeAppFee.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : ('Pay Now')}
                </Button>
              </div>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Application fee paid successfully</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className={hasAcceptanceFeePaid ? 'border-green-500' : !isAdmissionApproved ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Acceptance Fee
              </CardTitle>
              {hasAcceptanceFeePaid && (<CheckCircle2 className="h-6 w-6 text-green-600" />)}
            </div>
            <CardDescription>Required after admission approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl sm:text-3xl font-bold">₦50,000</div>
            {!isAdmissionApproved ? (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">Available after admission approval</AlertDescription>
              </Alert>
            ) : !hasAcceptanceFeePaid ? (
              <div className="space-y-4">
                <div className="space-y-3 sm:space-y-2">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'PAYSTACK' | 'FLUTTERWAVE')}>
                    <div className="flex items-center space-x-2 py-1">
                      <RadioGroupItem value="PAYSTACK" id="paystack-acc" />
                      <Label htmlFor="paystack-acc" className="cursor-pointer">Paystack</Label>
                    </div>
                    {/* <div className="flex items-center space-x-2 py-1">
                      <RadioGroupItem value="FLUTTERWAVE" id="flutterwave-acc" />
                      <Label htmlFor="flutterwave-acc" className="cursor-pointer">Flutterwave</Label>
                    </div> */}
                  </RadioGroup>
                </div>
                <Button onClick={() => handlePayment('ACCEPTANCE')} disabled={initializeAccFee.isPending} className="w-full">
                  {initializeAccFee.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : ('Pay Now')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Acceptance fee paid successfully</AlertDescription>
                </Alert>
                {currentProfile?.matricNo && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Your Matric Number:</p>
                    <p className="text-lg font-bold text-blue-900">{currentProfile.matricNo}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
