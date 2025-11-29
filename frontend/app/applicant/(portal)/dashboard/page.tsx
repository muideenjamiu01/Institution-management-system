"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useApplicantAuth } from "@/lib/applicant-auth-context";
import { useApplicantProfile } from "@/lib/hooks/useApplicantQueries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  ArrowRight,
  AlertCircle,
  CreditCard,
  IdCard,
} from "lucide-react";
import {
  getApplicationStatusColor,
  getApplicationStatusText,
} from "@/lib/api-applicant";

export default function ApplicantDashboardPage() {
  const { applicant, updateApplicant } = useApplicantAuth();
  const { data: profileData, refetch, isRefetching } = useApplicantProfile();

  // Auto-refresh when page becomes visible or window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    const handleFocus = () => {
      refetch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  // Update auth context when profile data changes
  useEffect(() => {
    if (profileData) {
      updateApplicant(profileData);
    }
  }, [profileData, updateApplicant]);

  const handleRefresh = () => {
    refetch();
  };

  if (!applicant) return null;

  // Use profile data if available, otherwise fall back to auth context
  const currentProfile = profileData || applicant;

  const hasCompletedProfile =
    currentProfile.dateOfBirth && currentProfile.gender && currentProfile.address;
  const isApproved = currentProfile.applicationStatus === "APPROVED";
  const isPending = currentProfile.applicationStatus === "PENDING";
  const isRejected = currentProfile.applicationStatus === "REJECTED";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getStepStatus = (step: number) => {
    if (step === 1) return "completed"; // Account created
    if (step === 2) return hasCompletedProfile ? "completed" : "current";
    if (step === 3) {
      if (!hasCompletedProfile) return "pending";
      if (isPending) return "current";
      if (isApproved || isRejected) return "completed";
      return "pending";
    }
    if (step === 4) {
      if (!isApproved) return "pending";
      if (currentProfile.hasMatricNumber) return "completed";
      return "current";
    }
    return "pending";
  };

  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Register and get your credentials",
      status: getStepStatus(1),
    },
    {
      number: 2,
      title: "Complete Application",
      description: "Fill in your personal and academic details",
      status: getStepStatus(2),
      action: !hasCompletedProfile ? "/applicant/application" : null,
    },
    {
      number: 3,
      title: "Wait for Decision",
      description: "Application under review by admissions",
      status: getStepStatus(3),
    },
    {
      number: 4,
      title: "Pay Acceptance Fee",
      description: "Complete payment to secure your admission",
      status: getStepStatus(4),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {getGreeting()}, {currentProfile.firstName}!
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Welcome to your application dashboard. Track your admission progress
          here.
        </p>
      </div>

      {/* Application Status Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-lg sm:text-xl">Application Status</CardTitle>
              <CardDescription>
                Your current admission application status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={getApplicationStatusColor(
                  currentProfile.applicationStatus
                )}
              >
                {getApplicationStatusText(currentProfile.applicationStatus)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefetching}
                title="Refresh status"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPending && hasCompletedProfile && (
            <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">
                  Application Under Review
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your application has been submitted and is currently being
                  reviewed by the admissions committee. You will be notified
                  once a decision is made.
                </p>
              </div>
            </div>
          )}

          {isPending && !hasCompletedProfile && (
            <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Complete Your Application
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  You need to complete your application form with your personal
                  and academic information.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/applicant/application">
                    Complete Application <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">
                  Congratulations! Application Approved
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your application has been approved.
                  {currentProfile.hasMatricNumber
                    ? " You have been assigned a matriculation number."
                    : " Please pay your acceptance fee to secure your admission and receive your matriculation number."}
                </p>
                {currentProfile.hasMatricNumber && currentProfile.matricNo && (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-white border border-green-300 rounded-md">
                      <div className="flex items-center space-x-2">
                        <IdCard className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-xs text-green-700 font-medium">
                            Your Matric Number
                          </p>
                          <p className="text-lg font-bold text-green-900 font-mono">
                            {currentProfile.matricNo}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        <strong>Your Student Portal is Ready!</strong>
                        <br />
                        You can now access the student portal using:
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li><strong>Username:</strong> <span className="font-mono">{currentProfile.matricNo}</span></li>
                          <li><strong>Password:</strong> Same as your applicant portal password</li>
                        </ul>
                        <Button asChild size="sm" className="mt-3">
                          <Link href="/student/login" className="inline-flex items-center">
                            Login to Student Portal
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          )}

          {isRejected && (
            <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-2 sm:space-y-0 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  Application Not Approved
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Unfortunately, your application was not approved at this time.
                  Please contact the admissions office for more information.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>
            Follow these steps to complete your admission process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-10 h-full w-0.5 ${
                      step.status === "completed"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === "completed"
                        ? "bg-green-500 text-white"
                        : step.status === "current"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            step.status === "pending"
                              ? "text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                      {step.action && step.status === "current" && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={step.action}>
                            Start <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Application Form
            </CardTitle>
            <CardDescription>
              View and update your application details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/applicant/application">
                {hasCompletedProfile
                  ? "View Application"
                  : "Complete Application"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Only show payment card when admission is approved */}
        {isApproved && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-purple-600" />
                Payment
              </CardTitle>
              <CardDescription>
                Pay your acceptance fee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/applicant/payment">Make Payment</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {currentProfile.username}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentProfile.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentProfile.phone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Application Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(currentProfile.createdAt || new Date()).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}