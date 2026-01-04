'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  CreditCard,
  Calendar,
  XCircle
} from 'lucide-react';
import { useStudentAuth } from '@/lib/student-auth-context';
import { apiStudentRequest } from '@/lib/api-student';

interface PaymentStatus {
  type: string;
  required: boolean;
  paid: boolean;
  partiallyPaid: boolean;
  amount: number;
  amountPaid: number;
  balance: number;
  invoiceNo?: string;
}

interface RegistrationStatus {
  canRegister: boolean;
  message: string;
  session: string;
  semester: string;
  registrationWindow?: {
    startDate: string;
    endDate: string;
  };
  paymentStatus?: {
    eligible: boolean;
    payments: PaymentStatus[];
    unpaidPayments: PaymentStatus[];
  };
}

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  semester: number;
  isElective: boolean;
  description?: string;
  prerequisites?: string;
  department: {
    name: string;
    code: string;
  };
  _count: {
    courseRegistrations: number;
  };
}

interface CoursesData {
  coreCourses: Course[];
  electiveCourses: Course[];
  registeredCourses: Course[];
  summary: {
    totalCoreUnits: number;
    totalElectiveUnits: number;
    registeredUnits: number;
    availableCoreCourses: number;
    availableElectiveCourses: number;
    registeredCourses: number;
  };
  studentInfo: {
    level: number;
    department: string;
    session: string;
  };
}

export default function ModernCourseRegistration() {
  const { student } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('registration');

  useEffect(() => {
    fetchRegistrationStatus();
  }, []);

  const fetchRegistrationStatus = async () => {
    try {
      setLoading(true);
      const response = await apiStudentRequest('/modern-course-registration/status', {
        method: 'GET'
      });

      if (response.success) {
        setStatus(response);
        if (response.canRegister) {
          await fetchAvailableCourses();
        }
      }
    } catch (error: any) {
      console.error('Fetch status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await apiStudentRequest('/modern-course-registration/available-courses', {
        method: 'GET'
      });

      if (response.success) {
        setCoursesData(response.data);
      }
    } catch (error: any) {
      console.error('Fetch courses error:', error);
    }
  };

  const toggleCourseSelection = (courseId: number) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(courseId)) {
      newSelection.delete(courseId);
    } else {
      newSelection.add(courseId);
    }
    setSelectedCourses(newSelection);
  };

  const calculateSelectedUnits = () => {
    if (!coursesData) return 0;
    const allCourses = [...coursesData.coreCourses, ...coursesData.electiveCourses];
    return allCourses
      .filter(c => selectedCourses.has(c.id))
      .reduce((sum, c) => sum + c.credits, 0);
  };

  const handleRegister = async () => {
    if (selectedCourses.size === 0) {
      alert('Please select at least one course');
      return;
    }

    if (!status?.registrationWindow) {
      alert('No active registration window');
      return;
    }

    try {
      setRegistering(true);
      // Get semester ID from the status
      const semesterResponse = await apiStudentRequest('/profile/me', {
        method: 'GET'
      });

      const activeSemester = semesterResponse.currentSession?.semesters?.find((s: any) => s.isActive);
      if (!activeSemester) {
        alert('No active semester found');
        return;
      }

      const response = await apiStudentRequest('/modern-course-registration/register', {
        method: 'POST',
        body: JSON.stringify({
          courseIds: Array.from(selectedCourses),
          semesterId: activeSemester.id
        })
      });

      if (response.success) {
        alert(response.message);
        setSelectedCourses(new Set());
        await fetchAvailableCourses();
        setActiveTab('registered');
      } else {
        alert(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register courses');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading registration status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load registration status</AlertDescription>
      </Alert>
    );
  }

  // Payment Required View
  if (!status.canRegister && status.paymentStatus && !status.paymentStatus.eligible) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Required for Course Registration
            </CardTitle>
            <CardDescription>
              Complete all required payments to register courses for {status.session} - {status.semester}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="font-semibold">Payment Status:</h3>
              {status.paymentStatus.payments.map((payment) => (
                <Card key={payment.type} className={payment.paid ? 'border-green-200' : 'border-red-200'}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {payment.paid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {payment.type.replace(/_/g, ' ')}
                          </p>
                          {payment.invoiceNo && (
                            <p className="text-sm text-muted-foreground">
                              Invoice: {payment.invoiceNo}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                        {payment.partiallyPaid && (
                          <div className="text-sm">
                            <p className="text-yellow-600">
                              Paid: ₦{payment.amountPaid.toLocaleString()}
                            </p>
                            <p className="text-red-600">
                              Balance: ₦{payment.balance.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <Badge variant={payment.paid ? 'default' : 'destructive'} className="mt-1">
                          {payment.paid ? 'Paid' : payment.partiallyPaid ? 'Partial' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => (window.location.href = '/student/payments')}
              className="w-full"
            >
              Go to Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration Closed View
  if (!status.canRegister) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Course Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
            {status.registrationWindow && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Session:</strong> {status.session}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Semester:</strong> {status.semester}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Registration View
  const selectedUnits = calculateSelectedUnits();
  const totalUnits = selectedUnits + (coursesData?.summary.registeredUnits || 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Registration
          </CardTitle>
          <CardDescription>
            {coursesData?.studentInfo.department} - Level {coursesData?.studentInfo.level} - {status.session}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>

          {status.registrationWindow && (
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Registration Window: {new Date(status.registrationWindow.startDate).toLocaleDateString()} - {new Date(status.registrationWindow.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {coursesData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{selectedUnits}</p>
              <p className="text-sm text-muted-foreground">Units Selected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{coursesData.summary.registeredUnits}</p>
              <p className="text-sm text-muted-foreground">Units Registered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{totalUnits}</p>
              <p className="text-sm text-muted-foreground">Total Units</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{24 - totalUnits}</p>
              <p className="text-sm text-muted-foreground">Units Remaining</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Selection */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registration">Register Courses</TabsTrigger>
          <TabsTrigger value="registered">Registered Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-4">
          {coursesData && (
            <>
              {/* Core Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Courses ({coursesData.coreCourses.length})</CardTitle>
                  <CardDescription>
                    {coursesData.summary.totalCoreUnits} units available
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coursesData.coreCourses.map((course) => (
                    <Card key={course.id} className="hover:border-primary transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedCourses.has(course.id)}
                            onCheckedChange={() => toggleCourseSelection(course.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{course.code} - {course.title}</h4>
                                {course.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {course.description}
                                  </p>
                                )}
                                {course.prerequisites && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Prerequisites: {course.prerequisites}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">{course.credits} Units</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Semester {course.semester}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Elective Courses */}
              {coursesData.electiveCourses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Elective Courses ({coursesData.electiveCourses.length})</CardTitle>
                    <CardDescription>
                      {coursesData.summary.totalElectiveUnits} units available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {coursesData.electiveCourses.map((course) => (
                      <Card key={course.id} className="hover:border-primary transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedCourses.has(course.id)}
                              onCheckedChange={() => toggleCourseSelection(course.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{course.code} - {course.title}</h4>
                                  {course.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {course.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary">{course.credits} Units</Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Semester {course.semester}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Register Button */}
              {selectedCourses.size > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {selectedCourses.size} course(s) selected
                        </p>
                        <p className="font-semibold">
                          Total Units: {selectedUnits}
                        </p>
                      </div>
                      <Button
                        onClick={handleRegister}
                        disabled={registering || totalUnits > 24}
                        size="lg"
                      >
                        {registering ? 'Registering...' : 'Register Selected Courses'}
                      </Button>
                    </div>
                    {totalUnits > 24 && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Total units ({totalUnits}) exceeds maximum allowed (24)
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="registered">
          {coursesData && coursesData.registeredCourses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Registered Courses ({coursesData.registeredCourses.length})</CardTitle>
                <CardDescription>
                  {coursesData.summary.registeredUnits} units registered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {coursesData.registeredCourses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{course.code} - {course.title}</h4>
                          {course.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge>{course.credits} Units</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Semester {course.semester}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No courses registered yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
