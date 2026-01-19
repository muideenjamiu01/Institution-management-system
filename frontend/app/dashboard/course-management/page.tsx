'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  FileDown,
  Settings,
  BarChart3,
  Users,
} from 'lucide-react';
import courseApi, { Course, CourseRegistration } from '@/lib/api-course';
import { adminApi } from '@/lib/api-admin';
import StatusBadge from '@/components/course/StatusBadge';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

export default function AdminCourseManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSession, setFilterSession] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modals
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<CourseRegistration | null>(null);
  const [actionComments, setActionComments] = useState('');

  // Course form state
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    departmentId: 0,
    level: 100,
    semester: 1,
    prerequisite: '',
    isElective: false,
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: courseApi.getDepartments,
  });

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: adminApi.getAllSessions,
  });

  // Fetch courses
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['admin-courses', filterDepartment, filterLevel, filterSemester, searchQuery],
    queryFn: () =>
      courseApi.getCourses({
        ...(filterDepartment && { departmentId: parseInt(filterDepartment) }),
        ...(filterLevel && { level: parseInt(filterLevel) }),
        ...(filterSemester && { semester: parseInt(filterSemester) }),
        ...(searchQuery && { search: searchQuery }),
        limit: 500, // Fetch more for client-side pagination
      }),
  });

  // Calculate pagination
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDepartment, filterLevel, filterSemester, searchQuery]);

  // Fetch registrations
  const { data: registrationsData, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['admin-registrations', filterSession, filterDepartment, filterLevel, filterStatus],
    queryFn: () =>
      courseApi.getAllRegistrations({
        ...(filterSession && { sessionId: parseInt(filterSession) }),
        ...(filterDepartment && { departmentId: parseInt(filterDepartment) }),
        ...(filterLevel && { level: parseInt(filterLevel) }),
        ...(filterStatus && { status: filterStatus }),
        limit: 100,
      }),
    enabled: activeTab === 'registrations',
  });

  const registrations = registrationsData?.data || [];

  // Fetch registration stats
  const { data: stats } = useQuery({
    queryKey: ['registration-stats', filterSession],
    queryFn: () => courseApi.getRegistrationStats({ 
      sessionId: parseInt(filterSession)
    }),
    enabled: activeTab === 'registrations' && !!filterSession,
  });

  // Create/Update course mutation
  const courseMutation = useMutation({
    mutationFn: (data: any) =>
      editingCourse
        ? courseApi.updateCourse(editingCourse.id, data)
        : courseApi.createCourse(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Course ${editingCourse ? 'updated' : 'created'} successfully`,
      });
      setShowCourseDialog(false);
      resetCourseForm();
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save course',
        variant: 'destructive',
      });
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete course',
        variant: 'destructive',
      });
    },
  });

  // Approve registration mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) =>
      courseApi.approveRegistration(id, comments),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Registration approved successfully',
      });
      setShowApprovalDialog(false);
      setActionComments('');
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve registration',
        variant: 'destructive',
      });
    },
  });

  // Reject registration mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) =>
      courseApi.rejectRegistration(id, comments),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Registration rejected',
      });
      setShowRejectDialog(false);
      setActionComments('');
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject registration',
        variant: 'destructive',
      });
    },
  });

  // Return registration mutation
  const returnMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) =>
      courseApi.returnRegistration(id, comments),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Registration returned to student',
      });
      setShowReturnDialog(false);
      setActionComments('');
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['registration-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to return registration',
        variant: 'destructive',
      });
    },
  });

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      title: '',
      description: '',
      credits: 3,
      departmentId: 0,
      level: 100,
      semester: 1,
      prerequisite: '',
      isElective: false,
    });
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      title: course.title,
      description: course.description || '',
      credits: course.credits,
      departmentId: course.departmentId,
      level: course.level,
      semester: course.semester,
      prerequisite: course.prerequisite || '',
      isElective: course.isElective || false,
    });
    setShowCourseDialog(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete.id);
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  const handleSaveCourse = () => {
    if (!courseForm.code || !courseForm.title || !courseForm.departmentId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    courseMutation.mutate(courseForm);
  };

  const handleApprove = () => {
    if (!selectedRegistration) return;
    approveMutation.mutate({
      id: selectedRegistration.id,
      comments: actionComments || undefined,
    });
  };

  const handleReject = () => {
    if (!selectedRegistration || !actionComments.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }
    rejectMutation.mutate({
      id: selectedRegistration.id,
      comments: actionComments,
    });
  };

  const handleReturn = () => {
    if (!selectedRegistration || !actionComments.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide comments for the student',
        variant: 'destructive',
      });
      return;
    }
    returnMutation.mutate({
      id: selectedRegistration.id,
      comments: actionComments,
    });
  };

  const exportRegistrations = async () => {
    try {
      const blob = await courseApi.exportRegistrations({
        sessionId: 1,
        format: 'excel',
        ...(filterDepartment && { departmentId: parseInt(filterDepartment) }),
        ...(filterLevel && { level: parseInt(filterLevel) }),
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Registrations exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export registrations',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Course Management System</h1>
          <p className="text-muted-foreground mt-1">
            Manage courses, view registrations, and approve student selections
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="registrations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Registrations
            {stats && stats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500">{stats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-700">Course Catalog</CardTitle>
                <CardDescription>Manage university courses and curriculum</CardDescription>
              </div>
              <Button onClick={() => {
                setEditingCourse(null);
                resetCourseForm();
                setShowCourseDialog(true);
              }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={filterDepartment} onValueChange={(value) => setFilterDepartment(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Semester</Label>
                  <Select value={filterSemester} onValueChange={(value) => setFilterSemester(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="1">First Semester</SelectItem>
                      <SelectItem value="2">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Courses Table */}
              {loadingCourses ? (
                <div className="text-center py-8 text-muted-foreground">Loading courses...</div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No courses found</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono font-semibold">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.credits}</Badge>
                        </TableCell>
                        <TableCell>{course.level}</TableCell>
                        <TableCell>{course.semester === 1 ? 'First' : 'Second'}</TableCell>
                        <TableCell>{course.department?.name}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCourse(course);
                              setCourseForm({
                                code: course.code,
                                title: course.title,
                                description: course.description || '',
                                credits: course.credits,
                                departmentId: course.departmentId,
                                level: course.level,
                                semester: course.semester,
                                prerequisite: course.prerequisite || '',
                                isElective: false,
                              });
                              setShowCourseDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCourse(course)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Rows per page:</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground ml-4">
                      Showing {startIndex + 1} to {Math.min(endIndex, courses.length)} of {courses.length} courses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-600">Returned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.returned}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Student Registrations</CardTitle>
              <CardDescription>Review and approve course registrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Academic Session</Label>
                  <Select value={filterSession} onValueChange={(value) => setFilterSession(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sessions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      {Array.isArray(sessions) && sessions.map((session: any) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name} {session.isActive && '(Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={filterDepartment} onValueChange={(value) => setFilterDepartment(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="RETURNED">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Registrations List */}
              {loadingRegistrations ? (
                <div className="text-center py-8 text-muted-foreground">Loading registrations...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No registrations found</div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <Card key={registration.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {registration.student?.firstName} {registration.student?.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {registration.student?.matricNo} • {registration.student?.department?.name}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge>Level {registration.level}</Badge>
                              <Badge variant="secondary">{registration.totalUnits} Units</Badge>
                              {registration.carryOverCourses && registration.carryOverCourses.length > 0 && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300">
                                  {registration.carryOverCourses.length} Carry Over
                                </Badge>
                              )}
                              <StatusBadge status={registration.status} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {registration.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRegistration(registration);
                                    setShowApprovalDialog(true);
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRegistration(registration);
                                    setShowReturnDialog(true);
                                  }}
                                  className="text-orange-600 border-orange-600"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Return
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRegistration(registration);
                                    setShowRejectDialog(true);
                                  }}
                                  className="text-red-600 border-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRegistration(registration);
                                setShowCourseDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>

                        {registration.comments && (
                          <div className="p-3 bg-muted rounded-lg mb-4">
                            <p className="text-sm font-medium mb-1">Comments:</p>
                            <p className="text-sm">{registration.comments}</p>
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground">
                          Submitted: {new Date(registration.submittedAt).toLocaleDateString()}
                          {registration.approvedAt && (
                            <> • Processed: {new Date(registration.approvedAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Registration Reports</CardTitle>
              <CardDescription>Export and analyze registration data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Export Registrations</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download all registration data as Excel file
                  </p>
                </div>
                <Button onClick={exportRegistrations} className="bg-blue-600 hover:bg-blue-700">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>

              {stats && (
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Registration Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Registrations</p>
                      <p className="text-2xl font-bold mt-1">{stats.total}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Returned</p>
                      <p className="text-2xl font-bold mt-1 text-orange-600">{stats.returned}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course information' : 'Create a new course in the catalog'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Course Code</Label>
                <Input
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  placeholder="e.g., CSC201"
                />
              </div>
              <div>
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Course Title</Label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Department</Label>
                <Select
                  value={courseForm.departmentId.toString()}
                  onValueChange={(value) => setCourseForm({ ...courseForm, departmentId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select
                  value={courseForm.level.toString()}
                  onValueChange={(value) => setCourseForm({ ...courseForm, level: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Semester</Label>
                <Select
                  value={courseForm.semester.toString()}
                  onValueChange={(value) => setCourseForm({ ...courseForm, semester: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First</SelectItem>
                    <SelectItem value="2">Second</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCourse}
              disabled={courseMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {courseMutation.isPending ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Registration</DialogTitle>
            <DialogDescription>
              Approve this student's course registration
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Comments (Optional)</Label>
            <Textarea
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              placeholder="Add any comments for the student..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Reason for Rejection *</Label>
            <Textarea
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              placeholder="Explain why this registration is being rejected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for Revision</DialogTitle>
            <DialogDescription>
              Send this registration back to the student for corrections
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Instructions for Student *</Label>
            <Textarea
              value={actionComments}
              onChange={(e) => setActionComments(e.target.value)}
              placeholder="Explain what needs to be corrected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReturn}
              disabled={returnMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {returnMutation.isPending ? 'Returning...' : 'Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">
                    {selectedRegistration.student?.firstName} {selectedRegistration.student?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matric Number</p>
                  <p className="font-medium">{selectedRegistration.student?.matricNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedRegistration.student?.department?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-medium">{selectedRegistration.level}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="font-medium">{selectedRegistration.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedRegistration.status} />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Registered Courses</h4>
                <div className="text-sm text-muted-foreground mb-2">
                  Normal Courses: {selectedRegistration.courses?.length || 0}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRegistration.courses?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.course?.code}</TableCell>
                        <TableCell>{item.course?.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.course?.credits}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Normal</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Carry Over Courses Section */}
              {selectedRegistration.carryOverCourses && selectedRegistration.carryOverCourses.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-amber-600">Carry Over Courses</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                      {selectedRegistration.carryOverCourses.length}
                    </Badge>
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50">
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Retake Type</TableHead>
                        <TableHead>Attempts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRegistration.carryOverCourses.map((item: any) => (
                        <TableRow key={item.id} className="bg-amber-50/50">
                          <TableCell className="font-mono">{item.course?.code}</TableCell>
                          <TableCell>{item.course?.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.course?.credits}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-amber-500 text-amber-700">
                              {item.retakeType === 'EXAM_ONLY' ? 'Exam Only' : 'Full Course'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.previousAttempts}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setCourseToDelete(null);
        }}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        description={
          courseToDelete
            ? `Are you sure you want to delete ${courseToDelete.code} - ${courseToDelete.title}? This action cannot be undone.`
            : 'Are you sure you want to delete this course?'
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
