'use client';

import { useState, useEffect, useCallback } from 'react';
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
import CarryOverSection from '@/components/CarryOverSection';

const MIN_UNITS = 10;
const MAX_UNITS = 24;

export default function StudentCourseRegistrationPage() {
  const { student } = useStudentAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [carryOverCourses, setCarryOverCourses] = useState<Array<{ courseId: number; retakeType: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [activeTab, setActiveTab] = useState('register');

  // Memoize the callback to prevent infinite loops
  const handleCarryOverSelection = useCallback((courses: Array<{ courseId: number; retakeType: string }>) => {
    setCarryOverCourses(courses);
  }, []);

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
  const normalUnits = selectedCourseDetails.reduce((sum, course) => sum + course.credits, 0);
  
  // Calculate carry over units (need to fetch from API or compute separately)
  const carryOverUnits = 0; // This will be calculated from carry over data
  const totalUnits = normalUnits + carryOverUnits;

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
    if (selectedCourses.length === 0 && carryOverCourses.length === 0) {
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
        description: `Total units must be between ${MIN_UNITS} and ${MAX_UNITS}. Current: ${totalUnits} units`,
        variant: 'destructive',
      });
      return;
    }

    submitMutation.mutate({
      sessionId: parseInt(selectedSession),
      semesterId: parseInt(selectedSemester),
      level: student?.currentLevel || 100,
      courseIds: selectedCourses,
      carryOverCourses: carryOverCourses,
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
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Course Registration</h1>
            <p className="text-green-50 text-lg">
              Select and register your courses for the semester
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-green-100 text-sm mb-1">Student</p>
            <p className="font-bold text-xl">{student.firstName} {student.lastName}</p>
            <div className="mt-3">
              <Badge variant="secondary" className="bg-white text-green-700 font-semibold px-3 py-1">
                Level {student.currentLevel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="register" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Register Courses
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all"
          >
            <FileText className="h-4 w-4 mr-2" />
            My Registrations
          </TabsTrigger>
        </TabsList>

        {/* Register Courses Tab */}
        <TabsContent value="register" className="space-y-6">
          {/* Filters */}
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Filter className="h-5 w-5 text-green-600" />
                Filters
              </CardTitle>
              <CardDescription>Select session, semester and search for courses</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* Carry Over Courses Section - Only for levels 200-500 */}
          {student && student.currentLevel >= 200 && (
            <CarryOverSection
              studentLevel={student.currentLevel}
              onCoursesSelected={handleCarryOverSelection}
            />
          )}

          {/* Available Courses */}
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-800 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Available Courses
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select courses you want to register. {filteredCourses.length} course(s) available
                  </CardDescription>
                </div>
                {totalUnits > 0 && (
                  <Badge className="bg-green-600 text-white px-4 py-2 text-lg font-bold">
                    {totalUnits} / {MAX_UNITS} units
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
          <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b-0">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Selected Courses for Registration
              </CardTitle>
              <CardDescription className="text-green-50">
                Review your selection before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SelectedCoursesTable
                courses={selectedCourseDetails}
                onRemove={(courseId) => setSelectedCourses(prev => prev.filter(id => id !== courseId))}
                totalUnits={totalUnits}
                minUnits={MIN_UNITS}
                maxUnits={MAX_UNITS}
              />

              <div className="mt-6 p-6 bg-white rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Minimum units:</span>
                        <span className="ml-2 font-bold text-gray-900">{MIN_UNITS} units</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Maximum units:</span>
                        <span className="ml-2 font-bold text-gray-900">{MAX_UNITS} units</span>
                      </div>
                    </div>
                    {totalUnits > 0 && (
                      <div className={`text-lg font-bold ${
                        totalUnits < MIN_UNITS ? 'text-red-600' :
                        totalUnits > MAX_UNITS ? 'text-red-600' :
                        'text-green-600'
                      }`}>
                        Total: {totalUnits} units
                        {totalUnits >= MIN_UNITS && totalUnits <= MAX_UNITS && ' ✅'}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      (selectedCourses.length === 0 && carryOverCourses.length === 0) ||
                      totalUnits < MIN_UNITS ||
                      totalUnits > MAX_UNITS ||
                      submitMutation.isPending
                    }
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Submit Registration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Registrations Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-blue-600" />
                Registration History
              </CardTitle>
              <CardDescription>
                View your past and current course registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                    <Card key={registration.id} className="border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900">
                                {registration.session?.name} - {registration.semester?.type === 'FIRST' ? 'First' : 'Second'} Semester
                              </h3>
                              <StatusBadge status={registration.status} />
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <span className="flex items-center gap-2 font-medium">
                                <Calendar className="h-4 w-4 text-green-600" />
                                {new Date(registration.submittedAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                              <Badge variant="outline" className="font-semibold border-green-600 text-green-700">
                                Level {registration.level}
                              </Badge>
                              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-3">
                                {registration.totalUnits} Units
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadForm(registration.id)}
                            className="border-green-600 text-green-700 hover:bg-green-50 font-semibold"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Form
                          </Button>
                        </div>

                        {registration.comments && (
                          <div className={`p-4 rounded-lg mb-4 border-l-4 ${
                            registration.status === 'RETURNED' 
                              ? 'bg-orange-50 border-orange-400'
                              : registration.status === 'REJECTED'
                              ? 'bg-red-50 border-red-400'
                              : 'bg-blue-50 border-blue-400'
                          }`}>
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              {registration.status === 'RETURNED' ? '📝 Advisor Comments' : '💬 Comments'}
                            </p>
                            <p className="text-sm text-gray-700">{registration.comments}</p>
                          </div>
                        )}

                        {/* Regular Courses */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Registered Courses ({registration.courses.length})
                          </h4>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="font-semibold">Course Code</TableHead>
                                  <TableHead className="font-semibold">Course Title</TableHead>
                                  <TableHead className="font-semibold">Credits</TableHead>
                                  <TableHead className="font-semibold">Type</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {registration.courses.map((item) => (
                                  <TableRow key={item.courseId} className="hover:bg-gray-50">
                                    <TableCell className="font-mono font-medium text-green-700">{item.course?.code}</TableCell>
                                    <TableCell className="font-medium">{item.course?.title}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className="font-semibold">{item.course?.credits} units</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={item.course?.isElective ? 'outline' : 'default'} className="font-medium">
                                        {item.course?.isElective ? '📚 Elective' : '⭐ Core'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Carry Over Courses */}
                        {registration.carryOverCourses && registration.carryOverCourses.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Carry Over Courses ({registration.carryOverCourses.length})
                            </h4>
                            <div className="border border-amber-200 rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-amber-50">
                                    <TableHead className="font-semibold text-amber-900">Course Code</TableHead>
                                    <TableHead className="font-semibold text-amber-900">Course Title</TableHead>
                                    <TableHead className="font-semibold text-amber-900">Credits</TableHead>
                                    <TableHead className="font-semibold text-amber-900">Retake Type</TableHead>
                                    <TableHead className="font-semibold text-amber-900">Attempts</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {registration.carryOverCourses.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-amber-50">
                                      <TableCell className="font-mono font-medium text-amber-700">{item.course?.code}</TableCell>
                                      <TableCell className="font-medium">{item.course?.title}</TableCell>
                                      <TableCell>
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-900 font-semibold">
                                          {item.course?.credits} units
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={item.retakeType === 'EXAM_ONLY' ? 'outline' : 'default'}
                                          className={item.retakeType === 'EXAM_ONLY' 
                                            ? 'border-amber-400 text-amber-700' 
                                            : 'bg-amber-600 text-white'}
                                        >
                                          {item.retakeType === 'EXAM_ONLY' ? '📝 Exam Only' : '📖 Full Course'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="destructive" className="font-semibold">
                                          {item.previousAttempts + 1} {item.previousAttempts === 0 ? 'attempt' : 'attempts'}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
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
