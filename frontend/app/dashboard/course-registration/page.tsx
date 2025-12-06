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
  DialogFooter,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Settings, 
  Plus, 
  Edit, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Session {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Semester {
  id: number;
  type: string;
  sessionId: number;
  isActive: boolean;
}

interface RegistrationWindow {
  id: number;
  sessionId: number;
  semesterId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  session: {
    name: string;
  };
  semester: {
    type: string;
  };
  createdAt: string;
}

interface StudentRegistration {
  student: {
    id: number;
    matricNo: string;
    firstName: string;
    lastName: string;
    department: {
      name: string;
      code: string;
    };
  };
  registrations: Array<{
    id: number;
    course: {
      code: string;
      title: string;
      credits: number;
    };
    registrationDate: string;
    status: string;
  }>;
  totalUnits: number;
}

const AdminRegistrationManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registrationWindows, setRegistrationWindows] = useState<RegistrationWindow[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistration[]>([]);
  
  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWindow, setEditingWindow] = useState<RegistrationWindow | null>(null);
  const [formData, setFormData] = useState({
    sessionId: '',
    semesterId: '',
    startDate: '',
    endDate: '',
  });

  // Filters
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('');

  useEffect(() => {
    fetchRegistrationWindows();
    fetchSessions();
    fetchSemesters();
  }, []);

  const fetchRegistrationWindows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/course-registration/registration-windows', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setRegistrationWindows(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch registration windows',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching registration windows',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSessions: Session[] = [
        {
          id: 1,
          name: '2024/2025',
          startDate: '2024-09-01T00:00:00Z',
          endDate: '2025-08-31T23:59:59Z',
          isActive: true,
        },
        {
          id: 2,
          name: '2025/2026',
          startDate: '2025-09-01T00:00:00Z',
          endDate: '2026-08-31T23:59:59Z',
          isActive: false,
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchSemesters = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSemesters: Semester[] = [
        {
          id: 1,
          type: 'FIRST',
          sessionId: 1,
          isActive: true,
        },
        {
          id: 2,
          type: 'SECOND',
          sessionId: 1,
          isActive: false,
        },
      ];
      setSemesters(mockSemesters);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchStudentRegistrations = async () => {
    if (!selectedSessionFilter || !selectedSemesterFilter) {
      toast({
        title: 'Error',
        description: 'Please select session and semester',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/course-registration/student-registrations?sessionId=${selectedSessionFilter}&semesterId=${selectedSemesterFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setStudentRegistrations(data.data);
      } else {
        toast({
          title: 'Error', 
          description: 'Failed to fetch student registrations',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching student registrations', 
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWindow = async () => {
    if (!formData.sessionId || !formData.semesterId || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/course-registration/registration-windows', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: parseInt(formData.sessionId),
          semesterId: parseInt(formData.semesterId),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: editingWindow ? 'Registration window updated successfully' : 'Registration window created successfully',
        });
        setShowCreateDialog(false);
        setEditingWindow(null);
        setFormData({ sessionId: '', semesterId: '', startDate: '', endDate: '' });
        fetchRegistrationWindows();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to save registration window',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error saving registration window',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWindow = (window: RegistrationWindow) => {
    setEditingWindow(window);
    setFormData({
      sessionId: window.sessionId.toString(),
      semesterId: window.semesterId.toString(),
      startDate: new Date(window.startDate).toISOString().slice(0, 16),
      endDate: new Date(window.endDate).toISOString().slice(0, 16),
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({ sessionId: '', semesterId: '', startDate: '', endDate: '' });
    setEditingWindow(null);
    setShowCreateDialog(false);
  };

  const isWindowActive = (window: RegistrationWindow) => {
    const now = new Date();
    const startDate = new Date(window.startDate);
    const endDate = new Date(window.endDate);
    return window.isActive && now >= startDate && now <= endDate;
  };

  const getWindowStatus = (window: RegistrationWindow) => {
    const now = new Date();
    const startDate = new Date(window.startDate);
    const endDate = new Date(window.endDate);

    if (!window.isActive) {
      return { label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle };
    }

    if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800', icon: Clock };
    }

    if (now >= startDate && now <= endDate) {
      return { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }

    return { label: 'Expired', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  };

  const filteredWindows = registrationWindows.filter((window) => {
    if (selectedSessionFilter && window.sessionId.toString() !== selectedSessionFilter) return false;
    if (selectedSemesterFilter && window.semesterId.toString() !== selectedSemesterFilter) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Registration Management</h1>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Registration Window
        </Button>
      </div>

      {/* Registration Windows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Registration Windows
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="session-filter">Filter by Session</Label>
              <Select value={selectedSessionFilter} onValueChange={setSelectedSessionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sessions</SelectItem>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semester-filter">Filter by Semester</Label>
              <Select value={selectedSemesterFilter} onValueChange={setSelectedSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All semesters</SelectItem>
                  {semesters.map(semester => (
                    <SelectItem key={semester.id} value={semester.id.toString()}>
                      {semester.type} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWindows.map((window) => {
                const status = getWindowStatus(window);
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={window.id}>
                    <TableCell className="font-medium">
                      {window.session.name}
                    </TableCell>
                    <TableCell>
                      {window.semester.type} Semester
                    </TableCell>
                    <TableCell>
                      {new Date(window.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(window.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditWindow(window)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredWindows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No registration windows found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Registrations
            </span>
            <Button 
              onClick={fetchStudentRegistrations}
              disabled={!selectedSessionFilter || !selectedSemesterFilter || loading}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Registrations
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentRegistrations.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {studentRegistrations.length}
                    </div>
                    <p className="text-sm text-blue-600">Total Students</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {studentRegistrations.reduce((sum, sr) => sum + sr.registrations.length, 0)}
                    </div>
                    <p className="text-sm text-green-600">Total Registrations</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {studentRegistrations.reduce((sum, sr) => sum + sr.totalUnits, 0)}
                    </div>
                    <p className="text-sm text-purple-600">Total Units</p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric No</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Total Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentRegistrations.map((sr) => (
                    <TableRow key={sr.student.id}>
                      <TableCell>
                        {sr.student.firstName} {sr.student.lastName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sr.student.matricNo}
                      </TableCell>
                      <TableCell>
                        {sr.student.department.name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {sr.registrations.slice(0, 3).map((reg) => (
                            <div key={reg.id} className="text-sm">
                              {reg.course.code} ({reg.course.credits} units)
                            </div>
                          ))}
                          {sr.registrations.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{sr.registrations.length - 3} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {sr.totalUnits}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No student registrations found</p>
              <p className="text-sm">Select session and semester to view registrations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Registration Window Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingWindow ? 'Edit Registration Window' : 'Create Registration Window'}
            </DialogTitle>
            <DialogDescription>
              Set up the registration period for students to register for courses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="session">Academic Session</Label>
              <Select value={formData.sessionId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, sessionId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={formData.semesterId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, semesterId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters
                    .filter(sem => !formData.sessionId || sem.sessionId.toString() === formData.sessionId)
                    .map(semester => (
                      <SelectItem key={semester.id} value={semester.id.toString()}>
                        {semester.type} Semester
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleCreateWindow} disabled={loading}>
              {loading ? 'Saving...' : editingWindow ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRegistrationManager;