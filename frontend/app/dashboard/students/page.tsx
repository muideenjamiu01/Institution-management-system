'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import { Search, Eye, Trash2, Filter, X } from 'lucide-react';
import api from '@/lib/api';
import StudentDetailsModal from '@/components/StudentDetailsModal';

interface Student {
  id: number;
  matricNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  currentLevel: number;
  status: string;
  enrollmentDate?: string;
  department: {
    id: number;
    name: string;
    code: string;
  };
  _count?: {
    courseRegistrations: number;
    scores: number;
  };
  courseRegistrations?: Array<{
    course: {
      code: string;
      title: string;
    };
  }>;
  scores?: Array<{
    score: number;
    grade: string;
    exam: {
      course: {
        code: string;
        title: string;
      };
    };
  }>;
}

interface Department {
  id: number;
  name: string;
  code: string;
}

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');
    
    if (search) params.append('search', search);
    if (departmentFilter) params.append('departmentId', departmentFilter);
    if (levelFilter) params.append('level', levelFilter);
    if (statusFilter) params.append('status', statusFilter);

    return params.toString();
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = buildQueryParams();
      const response = await api.get(`/students?${queryParams}`);
      setStudents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments?limit=100');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
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

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/students/${studentToDelete.id}`);
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
      setShowDeleteDialog(false);
      setStudentToDelete(null);
      fetchStudents(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchStudents();
  };

  const clearFilters = () => {
    setSearch('');
    setDepartmentFilter('');
    setLevelFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'graduated':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    fetchStudents();
  }, [page, departmentFilter, levelFilter, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const hasActiveFilters = search || departmentFilter || levelFilter || statusFilter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-2">View and manage enrolled students</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search by name, matric no, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Department" />
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

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Level" />
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="GRADUATED">Graduated</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-muted-foreground">
            Showing {pagination.total || 0} students
            {search && ` matching "${search}"`}
            {departmentFilter && ` in ${departments.find(d => d.id.toString() === departmentFilter)?.name}`}
            {levelFilter && ` at ${levelFilter} level`}
            {statusFilter && ` with ${statusFilter.toLowerCase()} status`}
          </div>
        )}
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
                <TableHead>Matric No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.matricNo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        {student._count && (
                          <div className="text-sm text-muted-foreground">
                            {student._count.courseRegistrations} courses • {student._count.scores} scores
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.department.name}</div>
                        <div className="text-sm text-muted-foreground">{student.department.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.currentLevel}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => fetchStudentDetails(student.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            setStudentToDelete(student);
                            setShowDeleteDialog(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} • {pagination.total} total students
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
      
      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        open={showStudentDetails}
        onClose={() => setShowStudentDetails(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{studentToDelete?.firstName} {studentToDelete?.lastName}</strong> 
              (Matric No: {studentToDelete?.matricNo})?
              <br /><br />
              <span className="text-destructive font-medium">
                This action cannot be undone. All associated records will be permanently deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Student'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
