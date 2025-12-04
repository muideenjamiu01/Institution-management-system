'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, ClipboardCheck, CreditCard } from 'lucide-react';
import api from '@/lib/api';

// Dashboard query hook
const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [studentsRes, summaryRes, coursesRes, examsRes, paymentsRes] = await Promise.all([
        api.get('/students?limit=1'),
        api.get('/admissions/summary'),
        api.get('/courses?limit=1'),
        api.get('/exams?limit=1'),
        api.get('/admin/payments/statistics').catch(() => ({ data: { data: { totalStats: { totalInvoices: 0, paidInvoices: 0 } } } })),
      ]);

      return {
        students: studentsRes.data.pagination?.total || 0,
        applicants: summaryRes.data?.totalApplicants || 0,
        approved: summaryRes.data?.approved || 0,
        rejected: summaryRes.data?.rejected || 0,
        pending: summaryRes.data?.pending || 0,
        courses: coursesRes.data.pagination?.total || 0,
        exams: examsRes.data.pagination?.total || 0,
        totalInvoices: paymentsRes.data?.data?.totalStats?.totalInvoices || 0,
        paidInvoices: paymentsRes.data?.data?.totalStats?.paidInvoices || 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export default function DashboardPage() {
  const { data: stats, isLoading, refetch } = useDashboardStats();

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.students || 0,
      icon: Users,
      description: 'Enrolled students',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Applicants',
      value: stats?.applicants || 0,
      icon: ClipboardCheck,
      description: 'All applications',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: ClipboardCheck,
      description: 'Approved applicants',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending',
      value: stats?.pending || 0,
      icon: ClipboardCheck,
      description: 'Awaiting decision',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Rejected',
      value: stats?.rejected || 0,
      icon: ClipboardCheck,
      description: 'Rejected applications',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Courses',
      value: stats?.courses || 0,
      icon: BookOpen,
      description: 'Active courses',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Exams',
      value: stats?.exams || 0,
      icon: GraduationCap,
      description: 'Scheduled exams',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Invoices',
      value: stats?.totalInvoices || 0,
      icon: CreditCard,
      description: 'All invoices',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Paid Invoices',
      value: stats?.paidInvoices || 0,
      icon: CreditCard,
      description: 'Completed payments',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your institutional management system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => refetch()}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/admissions"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Process Admissions</h3>
              <p className="text-sm text-muted-foreground">Review and approve applicants</p>
            </a>
            <a
              href="/dashboard/students"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Manage Students</h3>
              <p className="text-sm text-muted-foreground">View and update student records</p>
            </a>
            <a
              href="/dashboard/exams"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Record Exam Scores</h3>
              <p className="text-sm text-muted-foreground">Enter and manage exam results</p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Platform details and resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Version</h3>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Database</h3>
              <p className="text-sm text-muted-foreground">MySQL with Prisma ORM</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Framework</h3>
              <p className="text-sm text-muted-foreground">Next.js 15 + Express.js</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
