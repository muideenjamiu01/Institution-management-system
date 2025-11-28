'use client';

import { useStudentAuth } from '@/lib/student-auth-context';
import {
  useDashboardStats,
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
  const { student } = useStudentAuth();
  const { data: profileData, refetch: refetchProfile } = useStudentProfile();
  const { data: statsData, refetch: refetchStats, isRefetching: isRefetchingStats } = useDashboardStats();
  const { data: activitiesData, refetch: refetchActivities } = useDashboardActivities();
  const { data: notificationsData, refetch: refetchNotifications } = useDashboardNotifications();

  // Use profile data if available, otherwise fall back to auth context
  const currentStudent = profileData?.data || student;
  const stats = statsData?.data;
  const activities = activitiesData?.data || [];
  const notifications = (notificationsData?.data || []).slice(0, 5);

  const handleRefresh = () => {
    refetchProfile();
    refetchStats();
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
            Here's what's happening with your academics today
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefetchingStats}
          title="Refresh dashboard"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetchingStats ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Registered Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
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
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currentGPA ? stats.currentGPA.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current semester
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
              {stats?.pendingPayments || 0} pending payment(s)
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
    </div>
  );
}
