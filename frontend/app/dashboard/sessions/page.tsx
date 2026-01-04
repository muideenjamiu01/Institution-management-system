'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Calendar, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Semester {
  id: number;
  type: 'FIRST' | 'SECOND';
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

interface Session {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  semesters?: Semester[];
}

interface SemesterFormData {
  type: 'FIRST' | 'SECOND';
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export default function SessionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
    status: 'UPCOMING' as const,
  });

  const [semesters, setSemesters] = useState<SemesterFormData[]>([]);
  const [addFirstSemester, setAddFirstSemester] = useState(false);
  const [addSecondSemester, setAddSecondSemester] = useState(false);

  // Fetch sessions with semesters
  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['sessions-with-semesters'],
    queryFn: async () => {
      const response = await api.get('/admin/sessions?includeSemesters=true');
      return response.data.data || [];
    },
  });

  const sessions: Session[] = sessionsData || [];

  const handleCreateSession = async () => {
    try {
      if (!formData.name || !formData.startDate || !formData.endDate) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      // Prepare semesters data
      const semestersData = semesters.filter(sem => 
        (sem.type === 'FIRST' && addFirstSemester) || 
        (sem.type === 'SECOND' && addSecondSemester)
      );

      await api.post('/admin/sessions', {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        semesters: semestersData.map(sem => ({
          ...sem,
          startDate: new Date(sem.startDate).toISOString(),
          endDate: new Date(sem.endDate).toISOString(),
        })),
      });

      toast({
        title: 'Success',
        description: 'Academic session created successfully',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      refetchSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create session',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isActive: false,
      status: 'UPCOMING',
    });
    setSemesters([]);
    setAddFirstSemester(false);
    setAddSecondSemester(false);
  };

  const handleToggleActive = async (sessionId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/sessions/${sessionId}`, {
        isActive: !currentStatus,
      });

      toast({
        title: 'Success',
        description: `Session ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      refetchSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update session',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/sessions/${sessionId}`);

      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });

      refetchSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const handleAddSemester = (type: 'FIRST' | 'SECOND') => {
    const newSemester: SemesterFormData = {
      type,
      startDate: '',
      endDate: '',
      isActive: false,
      status: 'UPCOMING',
    };

    setSemesters(prev => {
      const filtered = prev.filter(s => s.type !== type);
      return [...filtered, newSemester];
    });

    if (type === 'FIRST') setAddFirstSemester(true);
    if (type === 'SECOND') setAddSecondSemester(true);
  };

  const handleRemoveSemester = (type: 'FIRST' | 'SECOND') => {
    setSemesters(prev => prev.filter(s => s.type !== type));
    if (type === 'FIRST') setAddFirstSemester(false);
    if (type === 'SECOND') setAddSecondSemester(false);
  };

  const updateSemester = (type: 'FIRST' | 'SECOND', field: keyof SemesterFormData, value: any) => {
    setSemesters(prev => prev.map(sem => 
      sem.type === type ? { ...sem, [field]: value } : sem
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generateSessionName = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}/${nextYear}`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      UPCOMING: 'bg-blue-500',
      ACTIVE: 'bg-green-500',
      COMPLETED: 'bg-gray-500',
      ARCHIVED: 'bg-slate-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage academic sessions and semesters for the institution
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Academic Session</DialogTitle>
              <DialogDescription>
                Add a new academic session with optional semesters
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Session Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Session Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Session Name *</Label>
                    <Input
                      id="name"
                      placeholder={generateSessionName()}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: YYYY/YYYY (e.g., {generateSessionName()})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPCOMING">Upcoming</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Set as active session
                    </Label>
                  </div>
                </div>
              </div>

              {/* Semesters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Semesters (Optional)</h3>
                  <div className="space-x-2">
                    {!addFirstSemester && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSemester('FIRST')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        First Semester
                      </Button>
                    )}
                    {!addSecondSemester && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSemester('SECOND')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Second Semester
                      </Button>
                    )}
                  </div>
                </div>

                {/* First Semester */}
                {addFirstSemester && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">First Semester</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSemester('FIRST')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={semesters.find(s => s.type === 'FIRST')?.startDate || ''}
                            onChange={(e) => updateSemester('FIRST', 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date *</Label>
                          <Input
                            type="date"
                            value={semesters.find(s => s.type === 'FIRST')?.endDate || ''}
                            onChange={(e) => updateSemester('FIRST', 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={semesters.find(s => s.type === 'FIRST')?.isActive || false}
                          onCheckedChange={(checked) => updateSemester('FIRST', 'isActive', checked)}
                        />
                        <Label className="cursor-pointer">Set as active semester</Label>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Second Semester */}
                {addSecondSemester && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Second Semester</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSemester('SECOND')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={semesters.find(s => s.type === 'SECOND')?.startDate || ''}
                            onChange={(e) => updateSemester('SECOND', 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date *</Label>
                          <Input
                            type="date"
                            value={semesters.find(s => s.type === 'SECOND')?.endDate || ''}
                            onChange={(e) => updateSemester('SECOND', 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={semesters.find(s => s.type === 'SECOND')?.isActive || false}
                          onCheckedChange={(checked) => updateSemester('SECOND', 'isActive', checked)}
                        />
                        <Label className="cursor-pointer">Set as active semester</Label>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>
                Create Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first academic session to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>
              Showing {sessions.length} academic session{sessions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Semesters</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-semibold">
                      {session.name}
                    </TableCell>
                    <TableCell>{formatDate(session.startDate)}</TableCell>
                    <TableCell>{formatDate(session.endDate)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(session.status)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {session.semesters?.map((sem) => (
                          <Badge key={sem.id} variant="outline" className="text-xs">
                            {sem.type === 'FIRST' ? '1st' : '2nd'}
                          </Badge>
                        ))}
                        {(!session.semesters || session.semesters.length === 0) && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.isActive ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(session.id, session.isActive)}
                      >
                        {session.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Session Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSession?.name}</DialogTitle>
            <DialogDescription>Session and semester details</DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{formatDate(selectedSession.startDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p className="font-medium">{formatDate(selectedSession.endDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadge(selectedSession.status)}>
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Active</Label>
                  <div className="mt-1">
                    <Badge className={selectedSession.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                      {selectedSession.isActive ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedSession.semesters && selectedSession.semesters.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Semesters</h3>
                  <div className="space-y-2">
                    {selectedSession.semesters.map((sem) => (
                      <Card key={sem.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">
                                {sem.type === 'FIRST' ? 'First Semester' : 'Second Semester'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(sem.startDate)} - {formatDate(sem.endDate)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getStatusBadge(sem.status)}>
                                {sem.status}
                              </Badge>
                              {sem.isActive && (
                                <Badge className="bg-green-500">Active</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
