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
import { useToast } from '@/components/ui/use-toast';
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { useStudentAuth } from '@/lib/student-auth-context';
import courseApi, { Course, CourseRegistration } from '@/lib/api-course';
import { sessionApi } from '@/lib/api-student';
import CourseCard from '@/components/course/CourseCard';
import SelectedCoursesTable from '@/components/course/SelectedCoursesTable';
import StatusBadge from '@/components/course/StatusBadge';

const MIN_UNITS = 10;
const MAX_UNITS = 24;

export default function StudentCourseRegistrationPage() {
  const { student } = useStudentAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [activeTab, setActiveTab] = useState('register');

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionApi.getAllSessions,
  });

  // Fetch semesters for selected session
  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters', selectedSession],
    queryFn: () => sessionApi.getSessionSemesters(parseInt(selectedSession)),
    enabled: !!selectedSession,
  });

  // Set default session and semester when data loads
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      const activeSession = sessions.find((s: any) => s.isActive) || sessions[0];
      setSelectedSession(activeSession.id.toString());
    }
  }, [sessions, selectedSession]);

  useEffect(() => {
    if (semesters.length > 0 && !selectedSemester) {
      const activeSemester = semesters.find((s: any) => s.isActive) || semesters[0];
      setSelectedSemester(activeSemester.id.toString());
    }
  }, [semesters, selectedSemester]);

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: courseApi.getDepartments,
  });

  // Fetch available courses
  const { data: availableCourses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['available-courses', selectedSession, selectedSemester, student?.currentLevel],
    queryFn: async () => {
      if (!student || !selectedSession || !selectedSemester) {
        return [];
      }
      const result = await courseApi.getAvailableCourses({
        sessionId: parseInt(selectedSession),
        semesterId: parseInt(selectedSemester),
        level: student.currentLevel || 100,
      });
      return Array.isArray(result) ? result : [];
    },
    enabled: !!student && !!selectedSession && !!selectedSemester,
  });

  // Fetch my registrations
  const { data: myRegistrations = [], isLoading: loadingRegistrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => courseApi.getMyRegistrations(),
    enabled: !!student,
  });

  // Submit registration mutation
  const submitMutation = useMutation({
    mutationFn: courseApi.submitRegistration,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course registration submitted successfully',
      });
      setSelectedCourses([]);
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      setActiveTab('history');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit registration',
        variant: 'destructive',
      });
    },
  });

  // Download course form
  const downloadForm = async (registrationId: number) => {
    try {
      const blob = await courseApi.downloadCourseForm(registrationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-form-${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Course form downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download course form',
        variant: 'destructive',
      });
    }
  };

  // Handle course selection
  const toggleCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Calculate total units
  const selectedCourseDetails = (Array.isArray(availableCourses) ? availableCourses : []).filter((course) =>
    selectedCourses.includes(course.id)
  );
  const totalUnits = selectedCourseDetails.reduce((sum, course) => sum + course.credits, 0);

  // Filter courses
  const filteredCourses = (Array.isArray(availableCourses) ? availableCourses : []).filter((course) => {
    const matchesSearch =
      !searchQuery ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Handle submission
  const handleSubmit = () => {
    if (selectedCourses.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one course',
        variant: 'destructive',
      });
      return;
    }

    if (totalUnits < MIN_UNITS || totalUnits > MAX_UNITS) {
      toast({
        title: 'Error',
        description: `Total units must be between ${MIN_UNITS} and ${MAX_UNITS}`,
        variant: 'destructive',
      });
      return;
    }

    submitMutation.mutate({
      sessionId: parseInt(selectedSession),
      semesterId: parseInt(selectedSemester),
      level: student?.currentLevel || 100,
      courseIds: selectedCourses,
    });
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to register courses</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Course Registration</h1>
          <p className="text-muted-foreground mt-1">
            Select and register your courses for the semester
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Student</p>
          <p className="font-semibold">{student.firstName} {student.lastName}</p>
          <Badge variant="outline" className="mt-1">
            Level {student.currentLevel}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="register" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Register Courses
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            My Registrations
          </TabsTrigger>
        </TabsList>

        {/* Register Courses Tab */}
        <TabsContent value="register" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Academic Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(sessions) && sessions.map((session: any) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name} {session.isActive && '(Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select 
                    value={selectedSemester} 
                    onValueChange={setSelectedSemester}
                    disabled={!selectedSession || semesters.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(semesters) && semesters.map((semester: any) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>
                          {semester.type === 'FIRST' ? 'First' : 'Second'} Semester
                          {semester.isActive && ' (Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search Courses</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by code or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Level</Label>
                  <Input
                    value={student.currentLevel}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>
                Select courses you want to register. {filteredCourses.length} course(s) available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCourses ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses available for this level and semester</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isSelected={selectedCourses.includes(course.id)}
                      onToggle={toggleCourse}
                      disabled={totalUnits >= MAX_UNITS && !selectedCourses.includes(course.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Courses for Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <SelectedCoursesTable
                courses={selectedCourseDetails}
                onRemove={(courseId) => setSelectedCourses(prev => prev.filter(id => id !== courseId))}
                totalUnits={totalUnits}
                minUnits={MIN_UNITS}
                maxUnits={MAX_UNITS}
              />

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Minimum units: {MIN_UNITS}</p>
                  <p>Maximum units: {MAX_UNITS}</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    selectedCourses.length === 0 ||
                    totalUnits < MIN_UNITS ||
                    totalUnits > MAX_UNITS ||
                    submitMutation.isPending
                  }
                  className="bg-green-600 hover:bg-green-700 px-8"
                  size="lg"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Registrations Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration History</CardTitle>
              <CardDescription>
                View your past and current course registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRegistrations ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : myRegistrations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No registrations found</p>
                  <p className="text-sm mt-1">Start by registering courses in the Register Courses tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRegistrations.map((registration) => (
                    <Card key={registration.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {registration.session?.name} - {registration.semester?.type === 'FIRST' ? 'First' : 'Second'} Semester
                              </h3>
                              <StatusBadge status={registration.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(registration.submittedAt).toLocaleDateString()}
                              </span>
                              <span>Level {registration.level}</span>
                              <Badge variant="secondary">
                                {registration.totalUnits} Units
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadForm(registration.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Form
                          </Button>
                        </div>

                        {registration.comments && (
                          <div className={`p-3 rounded-lg mb-4 ${
                            registration.status === 'RETURNED' 
                              ? 'bg-orange-50 border border-orange-200'
                              : registration.status === 'REJECTED'
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <p className="text-sm font-medium mb-1">
                              {registration.status === 'RETURNED' ? '📝 Advisor Comments:' : '💬 Comments:'}
                            </p>
                            <p className="text-sm">{registration.comments}</p>
                          </div>
                        )}

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course Code</TableHead>
                              <TableHead>Course Title</TableHead>
                              <TableHead>Credits</TableHead>
                              <TableHead>Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {registration.courses.map((item) => (
                              <TableRow key={item.courseId}>
                                <TableCell className="font-mono">{item.course?.code}</TableCell>
                                <TableCell>{item.course?.title}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{item.course?.credits}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.course?.isElective ? 'outline' : 'default'}>
                                    {item.course?.isElective ? 'Elective' : 'Core'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
