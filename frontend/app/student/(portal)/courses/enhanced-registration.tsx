'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Plus,
  Minus
} from 'lucide-react';

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  level: number;
  semester: number;
  department: {
    name: string;
    code: string;
  };
  isRegistered: boolean;
}

interface Student {
  id: number;
  matricNo: string;
  firstName: string;
  lastName: string;
  currentLevel: number;
  department: {
    name: string;
    code: string;
  };
}

interface RegistrationWindow {
  id: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  session: { name: string };
  semester: { type: string };
}

interface CourseRegistrationData {
  courses: Course[];
  registrationWindow: RegistrationWindow;
  student: Student;
}

interface Registration {
  id: number;
  course: Course;
  registrationDate: string;
  status: 'REGISTERED' | 'WITHDRAWN' | 'DROPPED';
  session: { name: string };
  semester: { type: string };
}

const CourseRegistrationPortal: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('100');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<Registration[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [registrationData, setRegistrationData] = useState<CourseRegistrationData | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: number; name: string }>>([]);
  const [semesters, setSemesters] = useState<Array<{ id: number; type: string }>>([]);

  // Mock data for development
  useEffect(() => {
    // Initialize with mock data
    setSessions([
      { id: 1, name: '2024/2025' },
      { id: 2, name: '2025/2026' }
    ]);
    
    setSemesters([
      { id: 1, type: 'FIRST' },
      { id: 2, type: 'SECOND' }
    ]);
    
    setSelectedSession('2024/2025');
    setSelectedSemester('1');
  }, []);

  const fetchAvailableCourses = async () => {
    if (!selectedLevel || !selectedSession || !selectedSemester) {
      toast({
        title: 'Error',
        description: 'Please select level, academic year, and semester',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('student_access_token');
      const response = await fetch(
        `http://localhost:5000/api/course-registration/my-registrations?academicYear=${selectedSession}&semester=${selectedSemester}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setRegistrationData(data.data);
        setAvailableCourses(data.data.courses);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch available courses',
          variant: 'destructive',
        });
        if (response.status === 402) {
          // Payment required
          toast({
            title: 'Payment Required',
            description: data.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching courses',
        variant: 'destructive',
      });
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredCourses = async () => {
    if (!selectedSession || !selectedSemester) return;

    try {
      const token = localStorage.getItem('student_access_token');
      const response = await fetch(
        `http://localhost:5000/api/course-registration/my-registrations?academicYear=${selectedSession}&semester=${selectedSemester}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setRegisteredCourses(data.data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registered courses:', error);
    }
  };

  const handleCourseSelection = (courseId: number, checked: boolean) => {
    const newSelected = new Set(selectedCourses);
    if (checked) {
      newSelected.add(courseId);
    } else {
      newSelected.delete(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const registerForCourses = async () => {
    if (selectedCourses.size === 0) {
      toast({
        title: 'Error', 
        description: 'Please select at least one course',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('student_access_token');
      const response = await fetch('http://localhost:5000/api/course-registration/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseIds: Array.from(selectedCourses),
          academicYear: selectedSession,
          semester: parseInt(selectedSemester),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Successfully registered for ${selectedCourses.size} courses`,
        });
        setSelectedCourses(new Set());
        fetchAvailableCourses();
        fetchRegisteredCourses();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Registration failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error during registration',
        variant: 'destructive',
      });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const dropCourse = async (registrationId: number) => {
    if (!confirm('Are you sure you want to drop this course?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('student_access_token');
      const response = await fetch('http://localhost:5000/api/course-registration/drop-courses', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationIds: [registrationId],
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Course dropped successfully',
        });
        fetchAvailableCourses();
        fetchRegisteredCourses();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to drop course',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error', 
        description: 'Error dropping course',
        variant: 'destructive',
      });
      console.error('Drop course error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCourseForm = async () => {
    if (!selectedSession || !selectedSemester || !selectedLevel) {
      toast({
        title: 'Error',
        description: 'Please select session, semester, and level',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/course-registration/generate-form?sessionId=${selectedSession}&semesterId=${selectedSemester}&level=${selectedLevel}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `course_form_${selectedSession}_${selectedSemester}_L${selectedLevel}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Success',
          description: 'Course form downloaded successfully',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.message || 'Failed to generate course form',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error generating course form',
        variant: 'destructive',
      });
      console.error('Generate form error:', error);
    }
  };

  const calculateTotalUnits = (courses: Course[]) => {
    return courses.reduce((total, course) => total + course.credits, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'bg-green-100 text-green-800';
      case 'WITHDRAWN': return 'bg-yellow-100 text-yellow-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isRegistrationOpen = true; // Simplified - always allow registration

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Registration</h1>
        <Button
          onClick={generateCourseForm}
          disabled={registeredCourses.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Registration Form
        </Button>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Registration Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="session">Academic Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map(session => (
                    <SelectItem key={session.id} value={session.name}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters?.map(semester => (
                    <SelectItem key={semester.id} value={semester.id.toString()}>
                      {semester.type} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={fetchAvailableCourses} 
                disabled={loading || !selectedLevel || !selectedSession || !selectedSemester}
                className="w-full"
              >
                {loading ? 'Loading...' : 'Load Courses'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Status */}
      {registrationData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">
                    {registrationData?.student?.firstName} {registrationData?.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {registrationData?.student?.matricNo} • {registrationData?.student?.department?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  {isRegistrationOpen ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Registration Open
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Registration Closed
                    </Badge>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {registrationData?.registrationWindow?.startDate ? (
                      <>
                        {new Date(registrationData.registrationWindow.startDate).toLocaleDateString()} - {' '}
                        {new Date(registrationData.registrationWindow.endDate).toLocaleDateString()}
                      </>
                    ) : (
                      'Registration window not set'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Courses
              </span>
              {availableCourses?.length > 0 && (
                <span className="text-sm font-normal text-gray-600">
                  {availableCourses?.filter(c => !c.isRegistered).length} courses available
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableCourses?.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {availableCourses?.map((course) => (
                    <div 
                      key={course.id} 
                      className={`p-3 border rounded-lg transition-colors ${
                        course.isRegistered 
                          ? 'bg-green-50 border-green-200' 
                          : selectedCourses.has(course.id)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={course.isRegistered || selectedCourses.has(course.id)}
                          disabled={course.isRegistered || !isRegistrationOpen}
                          onCheckedChange={(checked) => 
                            handleCourseSelection(course.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{course.code}</h4>
                            <Badge variant="outline" className="text-xs">
                              {course.credits} units
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{course.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              L{course.level} • Semester {course.semester}
                            </span>
                            {course.isRegistered && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Registered
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedCourses.size > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        Selected: {selectedCourses.size} courses
                      </span>
                      <span className="text-sm text-gray-600">
                        Total Units: {calculateTotalUnits(
                          availableCourses.filter(c => selectedCourses.has(c.id))
                        )}
                      </span>
                    </div>
                    <Button 
                      onClick={registerForCourses}
                      disabled={loading || !isRegistrationOpen}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? 'Registering...' : 'Register Selected Courses'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No courses available</p>
                <p className="text-sm">Please select parameters and load courses</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registered Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Registered Courses
              </span>
              {registeredCourses.length > 0 && (
                <span className="text-sm font-normal text-gray-600">
                  {registeredCourses.length} courses • {calculateTotalUnits(
                    registeredCourses.map(r => r.course)
                  )} units
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registeredCourses.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {registeredCourses.map((registration) => (
                  <div 
                    key={registration.id}
                    className="p-3 border rounded-lg bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {registration.course.code}
                          </h4>
                          <Badge className={`text-xs ${getStatusColor(registration.status)}`}>
                            {registration.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {registration.course.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {registration.course.credits} units
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(registration.registrationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {registration.status === 'REGISTERED' && isRegistrationOpen && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dropCourse(registration.id)}
                          className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No registered courses</p>
                <p className="text-sm">Register for courses to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Window Alert */}
      {registrationData && !isRegistrationOpen && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Registration Period</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Course registration is currently closed. 
                  {registrationData?.registrationWindow?.startDate ? (
                    <>
                      The registration period was from{' '}
                      {new Date(registrationData.registrationWindow.startDate).toLocaleDateString()} to{' '}
                      {new Date(registrationData.registrationWindow.endDate).toLocaleDateString()}.
                    </>
                  ) : (
                    'Registration window information is not available.'
                  )}
                </p>
                <p className="text-sm text-amber-700">
                  Please contact the academic office if you need to make changes to your registration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseRegistrationPortal;