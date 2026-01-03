'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Search, Eye, X, Users, BookOpen, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import StudentDetailsModal from '@/components/StudentDetailsModal';

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Students modal state
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState('');
  
  // Courses modal state
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseLevelFilter, setCourseLevelFilter] = useState('');
  
  // Student details modal
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch departments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStudents = async (departmentId: number) => {
    try {
      setLoadingStudents(true);
      const params = new URLSearchParams();
      params.append('departmentId', departmentId.toString());
      params.append('limit', '100');
      if (studentSearch) params.append('search', studentSearch);
      if (studentLevelFilter) params.append('level', studentLevelFilter);
      
      const response = await api.get(`/students?${params.toString()}`);
      setStudents(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchDepartmentCourses = async (departmentId: number) => {
    try {
      setLoadingCourses(true);
      const params = new URLSearchParams();
      params.append('departmentId', departmentId.toString());
      params.append('limit', '100');
      if (courseSearch) params.append('search', courseSearch);
      if (courseLevelFilter) params.append('level', courseLevelFilter);
      
      const response = await api.get(`/courses?${params.toString()}`);
      setCourses(response.data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive',
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchStudentDetails = async (studentId: number) => {
    try {
      const response = await api.get(`/students/${studentId}`);
      setSelectedStudent(response.data);
      setShowStudentDetails(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch student details',
        variant: 'destructive',
      });
    }
  };

  const handleViewStudents = (department: any) => {
    setSelectedDepartment(department);
    setShowStudentsModal(true);
    setStudentSearch('');
    setStudentLevelFilter('');
    fetchDepartmentStudents(department.id);
  };

  const handleViewCourses = (department: any) => {
    setSelectedDepartment(department);
    setShowCoursesModal(true);
    setCourseSearch('');
    setCourseLevelFilter('');
    fetchDepartmentCourses(department.id);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (showStudentsModal && selectedDepartment) {
      fetchDepartmentStudents(selectedDepartment.id);
    }
  }, [studentSearch, studentLevelFilter]);

  useEffect(() => {
    if (showCoursesModal && selectedDepartment) {
      fetchDepartmentCourses(selectedDepartment.id);
    }
  }, [courseSearch, courseLevelFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground mt-2">View academic departments</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Courses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.code}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewStudents(dept)}
                      className="text-primary hover:underline font-medium text-left"
                    >
                      {dept.name}
                    </button>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{dept.description}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewStudents(dept)}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Users className="h-4 w-4" />
                      {dept._count?.students || 0}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewCourses(dept)}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="h-4 w-4" />
                      {dept._count?.courses || 0}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {departments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No departments found
            </div>
          )}
        </Card>
      )}

      {/* Students Modal */}
      <Dialog open={showStudentsModal} onOpenChange={setShowStudentsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students in {selectedDepartment?.name}
            </DialogTitle>
            <DialogDescription>
              View and manage students in this department
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or matric number..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={studentLevelFilter} onValueChange={setStudentLevelFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
              {(studentSearch || studentLevelFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStudentSearch('');
                    setStudentLevelFilter('');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Students Table */}
            {loadingStudents ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matric No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{student.matricNo}</TableCell>
                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                        <TableCell className="text-sm">{student.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.currentLevel} Level</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchStudentDetails(student.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {students.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No students found in this department</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Courses Modal */}
      <Dialog open={showCoursesModal} onOpenChange={setShowCoursesModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Courses in {selectedDepartment?.name}
            </DialogTitle>
            <DialogDescription>
              View all courses offered in this department
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course code or title..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={courseLevelFilter} onValueChange={setCourseLevelFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
              {(courseSearch || courseLevelFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCourseSearch('');
                    setCourseLevelFilter('');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Courses Table */}
            {loadingCourses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.level} Level</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {course.semester === 1 ? 'First' : 'Second'} Semester
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.isElective ? 'outline' : 'default'}>
                            {course.isElective ? 'Elective' : 'Core'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {courses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found in this department</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        open={showStudentDetails}
        onClose={() => setShowStudentDetails(false)}
      />
    </div>
  );
}
