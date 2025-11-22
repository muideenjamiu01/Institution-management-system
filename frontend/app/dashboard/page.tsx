'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, ClipboardCheck } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    applicants: 0,
    courses: 0,
    exams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, applicantsRes, coursesRes, examsRes] = await Promise.all([
          api.get('/students?limit=1'),
          api.get('/admissions/applicants?limit=1'),
          api.get('/courses?limit=1'),
          api.get('/exams?limit=1'),
        ]);

        setStats({
          students: studentsRes.data.pagination?.total || 0,
          applicants: applicantsRes.data.pagination?.total || 0,
          courses: coursesRes.data.pagination?.total || 0,
          exams: examsRes.data.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students,
      icon: Users,
      description: 'Enrolled students',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Applicants',
      value: stats.applicants,
      icon: ClipboardCheck,
      description: 'Pending applications',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Courses',
      value: stats.courses,
      icon: BookOpen,
      description: 'Active courses',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Exams',
      value: stats.exams,
      icon: GraduationCap,
      description: 'Scheduled exams',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
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
          <Card key={stat.title}>
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
