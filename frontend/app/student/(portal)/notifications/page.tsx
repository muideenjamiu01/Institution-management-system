'use client';

import { useState } from 'react';
import {
  useDashboardNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/lib/hooks/useStudentQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Check,
  CheckCheck,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/api-student';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data: notificationsData, refetch, isRefetching } = useDashboardNotifications({ page, limit: 20 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const { toast } = useToast();

  const notifications = notificationsData?.data || [];
  const pagination = notificationsData?.pagination;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'INFO':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Stay updated with your academic notifications
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.some((n: any) => !n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh notifications"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <>
              <div className="space-y-3">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      notification.isRead
                        ? 'bg-card'
                        : 'bg-blue-50 border-blue-200'
                    } transition-colors`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              notification.type === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : notification.type === 'WARNING'
                                ? 'bg-orange-100 text-orange-800'
                                : notification.type === 'ERROR'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsRead.isPending}
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
