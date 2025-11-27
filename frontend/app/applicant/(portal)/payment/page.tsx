'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApplicantAuth } from '@/lib/applicant-auth-context';
import { paymentApi } from '@/lib/api-applicant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PaymentPage() {
  const { applicant } = useApplicantAuth();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const hasApplicationFeePaid = applicant?.applicationFeePaid || false;
  const hasAcceptanceFeePaid = applicant?.acceptanceFeePaid || false;
  const isAdmissionApproved = applicant?.applicationStatus === 'APPROVED';

  const handlePayment = async (feeType: 'APPLICATION' | 'ACCEPTANCE') => {
    try {
      setIsLoading(true);
      setError('');

      let response;
      if (feeType === 'APPLICATION') {
        response = await paymentApi.initializeApplicationFee(paymentMethod);
      } else {
        response = await paymentApi.initializeAcceptanceFee(paymentMethod);
      }

      if (response.data?.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment</h1>
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

      <div className="grid md:grid-cols-2 gap-6">
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
            <CardDescription>Required before filling application form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">₦20,000</div>
            {!hasApplicationFeePaid ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'PAYSTACK' | 'FLUTTERWAVE')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PAYSTACK" id="paystack-app" />
                      <Label htmlFor="paystack-app">Paystack</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="FLUTTERWAVE" id="flutterwave-app" />
                      <Label htmlFor="flutterwave-app">Flutterwave</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={() => handlePayment('APPLICATION')} disabled={isLoading} className="w-full">
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : ('Pay Now')}
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
            <div className="text-3xl font-bold">₦50,000</div>
            {!isAdmissionApproved ? (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">Available after admission approval</AlertDescription>
              </Alert>
            ) : !hasAcceptanceFeePaid ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'PAYSTACK' | 'FLUTTERWAVE')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PAYSTACK" id="paystack-acc" />
                      <Label htmlFor="paystack-acc">Paystack</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="FLUTTERWAVE" id="flutterwave-acc" />
                      <Label htmlFor="flutterwave-acc">Flutterwave</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={() => handlePayment('ACCEPTANCE')} disabled={isLoading} className="w-full">
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : ('Pay Now')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Acceptance fee paid successfully</AlertDescription>
                </Alert>
                {applicant?.matricNo && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Your Matric Number:</p>
                    <p className="text-lg font-bold text-blue-900">{applicant.matricNo}</p>
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
