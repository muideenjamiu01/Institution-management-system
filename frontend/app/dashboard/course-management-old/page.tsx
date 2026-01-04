'use client';

import { useState, useEffect } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Filter
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface RegistrationWindow {
  id: number;
  sessionId: number;
  semesterId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  session: {
    id: number;
    name: string;
  };
  semester: {
    id: number;
    type: string;
  };
}

interface Session {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  semesters: Semester[];
}

interface Semester {
  id: number;
  type: string;
  isActive: boolean;
}

interface DepartmentStat {
  department: string;
  registrations: number;
  students: number;
  totalUnits: number;
}

interface Statistics {
  summary: {
    totalRegistrations: number;
    uniqueStudents: number;
    totalUnits: number;
    averageUnitsPerStudent: number;
  };
  byDepartment: DepartmentStat[];
  popularCourses: {
    course: string;
    registrations: number;
  }[];
}

export default function AdminCourseManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [windows, setWindows] = useState<RegistrationWindow[]>([]);

  // Helper function to format semester names
  const formatSemesterName = (type: string) => {
    return type === 'FIRST' ? 'First Semester' : type === 'SECOND' ? 'Second Semester' : type;
  };
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form states
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filter states
  const [filterSessionId, setFilterSessionId] = useState<string>('');
  const [filterSemesterId, setFilterSemesterId] = useState<string>('');

  useEffect(() => {
    fetchSessions();
    fetchWindows();
  }, []);

  useEffect(() => {
    if (filterSessionId) {
      fetchStatistics();
    }
  }, [filterSessionId, filterSemesterId]);

  const fetchSessions = async () => {
    try {
      const response = await apiRequest('admin/sessions?includeSemesters=true', { method: 'GET' });
      if (response.success) {
        setSessions(response.data);
        if (response.data.length > 0) {
          const activeSession = response.data.find((s: Session) => s.isActive) || response.data[0];
          setSelectedSessionId(activeSession.id.toString());
          setFilterSessionId(activeSession.id.toString());
        }
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
    }
  };

  const fetchWindows = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('modern-course-registration/windows', {
        method: 'GET'
      });
      if (response.success) {
        setWindows(response.data);
      }
    } catch (error) {
      console.error('Fetch windows error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams({
        sessionId: filterSessionId,
        ...(filterSemesterId && { semesterId: filterSemesterId })
      });
      
      const response = await apiRequest(
        `modern-course-registration/statistics?${params}`,
        { method: 'GET' }
      );
      
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  const handleCreateWindow = async () => {
    if (!selectedSessionId || !selectedSemesterId || !startDate || !endDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await apiRequest('modern-course-registration/windows', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: parseInt(selectedSessionId),
          semesterId: parseInt(selectedSemesterId),
          startDate,
          endDate
        })
      });

      if (response.success) {
        alert('Registration window created successfully');
        setOpenDialog(false);
        fetchWindows();
        // Reset form
        setStartDate('');
        setEndDate('');
      } else {
        alert(response.message || 'Failed to create window');
      }
    } catch (error: any) {
      console.error('Create window error:', error);
      alert(error.message || 'Failed to create window');
    }
  };

  const selectedSession = sessions.find(s => s.id.toString() === selectedSessionId);
  const filterSession = sessions.find(s => s.id.toString() === filterSessionId);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Registration Management</h1>
          <p className="text-muted-foreground">Manage registration windows and view statistics</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Registration Window
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Registration Window</DialogTitle>
              <DialogDescription>
                Set up a new course registration period for students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Academic Session</Label>
                <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Semester</Label>
                <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSession?.semesters?.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id.toString()}>
                        {formatSemesterName(semester.type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWindow}>Create Window</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="windows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="windows">
            <Clock className="h-4 w-4 mr-2" />
            Registration Windows
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="windows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Windows</CardTitle>
              <CardDescription>View and manage course registration periods</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : windows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {windows.map((window) => {
                      const now = new Date();
                      const start = new Date(window.startDate);
                      const end = new Date(window.endDate);
                      const isActive = now >= start && now <= end && window.isActive;
                      const isPending = now < start;
                      const isEnded = now > end;

                      return (
                        <TableRow key={window.id}>
                          <TableCell>{window.session.name}</TableCell>
                          <TableCell>{formatSemesterName(window.semester.type)}</TableCell>
                          <TableCell>{new Date(window.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(window.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                isActive ? 'default' : isPending ? 'secondary' : 'outline'
                              }
                            >
                              {isActive ? 'Active' : isPending ? 'Pending' : 'Ended'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No registration windows created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Academic Session</Label>
                  <Select value={filterSessionId} onValueChange={setFilterSessionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions?.map((session) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Semester (Optional)</Label>
                  <Select value={filterSemesterId || 'all'} onValueChange={(value) => setFilterSemesterId(value === 'all' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {filterSession?.semesters?.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id.toString()}>
                          {formatSemesterName(semester.type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          {statistics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {statistics.summary.totalRegistrations}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Registrations</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{statistics.summary.uniqueStudents}</p>
                        <p className="text-sm text-muted-foreground">Students Registered</p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{statistics.summary.totalUnits}</p>
                        <p className="text-sm text-muted-foreground">Total Units</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {statistics.summary.averageUnitsPerStudent.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Units/Student</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* By Department */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Registrations</TableHead>
                        <TableHead>Total Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.byDepartment.map((dept, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell>{dept.students}</TableCell>
                          <TableCell>{dept.registrations}</TableCell>
                          <TableCell>{dept.totalUnits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Popular Courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Registered Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Registrations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statistics.popularCourses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{course.course}</TableCell>
                          <TableCell>{course.registrations}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
