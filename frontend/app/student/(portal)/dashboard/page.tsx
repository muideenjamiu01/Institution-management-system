'use client';

import { useEffect } from 'react';
import { useStudentAuth } from '@/lib/student-auth-context';
import {
  useDashboardOverview,
  useDashboardActivities,
  useDashboardNotifications,
  useStudentProfile,
} from '@/lib/hooks/useStudentQueries';
import { formatCurrency } from '@/lib/api-student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/api-student';

export default function StudentDashboard() {
  const { student, updateStudent } = useStudentAuth();
  const { data: overviewData, refetch: refetchOverview, isRefetching: isRefetchingOverview } = useDashboardOverview();
  const { data: activitiesData, refetch: refetchActivities } = useDashboardActivities();
  const { data: notificationsData, refetch: refetchNotifications } = useDashboardNotifications();

  // Extract data from overview
  const currentStudent = overviewData?.student || student;
  const stats = overviewData?.stats;
  const currentSession = overviewData?.session;
  const currentSemester = overviewData?.currentSemester;
  const activities = activitiesData?.data || [];
  const notifications = (notificationsData?.data || []).slice(0, 5);

  // Sync student data from overview to auth context
  useEffect(() => {
    if (overviewData?.student && student) {
      const overviewStudent = overviewData.student;
      
      console.log('Overview student data:', overviewStudent);
      console.log('Current auth student:', student);
      console.log('Profile picture from overview:', overviewStudent.profilePicture);
      console.log('Profile picture in auth:', student.profilePicture);
      
      // Always update to ensure we have the latest data from server
      const shouldUpdate = 
        overviewStudent.profilePicture !== student.profilePicture ||
        overviewStudent.firstName !== student.firstName ||
        overviewStudent.lastName !== student.lastName ||
        overviewStudent.level !== student.currentLevel ||
        overviewStudent.status !== student.status;
      
      if (shouldUpdate) {
        console.log('Updating student data in auth context...');
        updateStudent({
          ...student,
          profilePicture: overviewStudent.profilePicture,
          firstName: overviewStudent.firstName,
          lastName: overviewStudent.lastName,
          currentLevel: overviewStudent.level,
          status: overviewStudent.status,
          email: overviewStudent.email,
        });
      }
    }
  }, [overviewData, student, updateStudent]);


  const handleRefresh = () => {
    refetchOverview();
    refetchActivities();
    refetchNotifications();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {currentStudent?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Welcome to your student portal • Matric No: <span className="font-mono font-semibold">{currentStudent?.matricNo}</span>
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetchingOverview}
          title="Refresh dashboard"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetchingOverview ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Welcome Banner for New Students */}
      {notifications.length > 0 && notifications.some((n: any) => n.title.includes('Welcome')) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">Welcome to the Student Portal!</h3>
                <p className="text-sm text-green-800 mt-1">
                  Congratulations on your admission! Your student account has been successfully created. 
                  Your matric number is <span className="font-mono font-bold">{currentStudent?.matricNo}</span>.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button size="sm" asChild variant="default">
                    <Link href="/student/courses">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Register Courses
                    </Link>
                  </Button>
                  <Button size="sm" asChild variant="outline">
                    <Link href="/student/payments">
                      <CreditCard className="h-4 w-4 mr-2" />
                      View Invoices
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session Information */}
      {currentSession && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-blue-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Current Academic Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-700 font-medium mb-1">Session</p>
                <p className="text-sm font-bold text-blue-900">{currentSession.name}</p>
                {currentSession.isActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Active
                  </span>
                )}
              </div>
              {currentSemester && (
                <>
                  <div>
                    <p className="text-xs text-blue-700 font-medium mb-1">Current Semester</p>
                    <p className="text-sm font-bold text-blue-900">{currentSemester.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 font-medium mb-1">Period</p>
                    <p className="text-sm text-blue-900">
                      {new Date(currentSemester.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {new Date(currentSemester.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.registeredCourses || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current semester courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAssignments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Assignments due soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.cgpa ? stats.cgpa.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative GPA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.walletBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.unpaidInvoices || 0} unpaid invoice(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {activity.type === 'ASSIGNMENT' && (
                        <ClipboardList className="h-4 w-4 text-blue-500" />
                      )}
                      {activity.type === 'RESULT' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {activity.type === 'PAYMENT' && (
                        <CreditCard className="h-4 w-4 text-purple-500" />
                      )}
                      {activity.type === 'REGISTRATION' && (
                        <BookOpen className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/student/activities">View All Activities</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="mt-1">
                      {notification.type === 'WARNING' && (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      {notification.type === 'INFO' && (
                        <Bell className="h-4 w-4 text-blue-500" />
                      )}
                      {notification.type === 'SUCCESS' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {notification.type === 'ERROR' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No new notifications
                </p>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/student/notifications">View All Notifications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/student/courses">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-xs sm:text-sm">Register Courses</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/student/assignments">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-xs sm:text-sm">View Assignments</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/student/payments">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-xs sm:text-sm">Make Payment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link href="/student/results">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mb-2" />
                <span className="text-xs sm:text-sm">Check Results</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Matric Number</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono font-semibold">
                {currentStudent?.matricNo}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentStudent?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {typeof currentStudent?.department === 'string' 
                  ? currentStudent.department 
                  : currentStudent?.department?.name || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentStudent?.currentLevel || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Programme</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {typeof currentStudent?.program === 'string'
                  ? currentStudent.program
                  : currentStudent?.program?.name || 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {currentStudent?.status || 'ACTIVE'}
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
