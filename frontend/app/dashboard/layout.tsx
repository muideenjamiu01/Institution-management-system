'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Building2,
  CreditCard,
  Calendar,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Admissions', href: '/dashboard/admissions', icon: ClipboardCheck },
    { name: 'Students', href: '/dashboard/students', icon: Users },
    { name: 'Departments', href: '/dashboard/departments', icon: Building2 },
    // { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    // { name: 'Course Registration', href: '/dashboard/course-registration', icon: Calendar },
    { name: 'Course Management', href: '/dashboard/course-management', icon: BookOpen },
    // { name: 'Exams', href: '/dashboard/exams', icon: GraduationCap },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
  ];

  if (!user) {
    return (
      <div className="admin-portal flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-700 border-r border-blue-800 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-800">
            <h1 className="text-2xl font-bold text-white">IMS Admin</h1>
            <p className="text-sm text-blue-100 mt-1">Management System</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-blue-200">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full text-white hover:bg-blue-800 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex-1 lg:ml-0 ml-4">
              <h2 className="text-xl font-semibold">Welcome, {user?.firstName}!</h2>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
