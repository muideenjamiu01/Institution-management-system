'use client';

import { useDashboardActivities } from '@/lib/hooks/useStudentQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/api-student';

export default function ActivitiesPage() {
  const { data: activitiesData, refetch, isRefetching } = useDashboardActivities();
  const activities = activitiesData?.data || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return <ClipboardList className="h-5 w-5 text-blue-500" />;
      case 'RESULT':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'PAYMENT':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'REGISTRATION':
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Activities
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View your recent academic activities
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          title="Refresh activities"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{activity.message}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                        {activity.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activities found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your recent activities will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
