'use client';

import { useEffect, useState } from 'react';
import { assignmentApi, downloadFile } from '@/lib/api-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardList, Calendar, Download, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/api-student';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  fileUrl: string | null;
  course: {
    code: string;
    title: string;
  };
  submissions?: Array<{
    id: number;
    score: number | null;
    status: string;
    submittedAt: string;
  }>;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes, submittedRes] = await Promise.all([
        assignmentApi.getAssignments(),
        assignmentApi.getPendingAssignments(),
        assignmentApi.getMySubmissions(),
      ]);
      setAssignments(allRes.data);
      setPendingAssignments(pendingRes.data);
      setSubmittedAssignments(submittedRes.data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: number) => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(assignmentId);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await assignmentApi.submitAssignment(assignmentId, formData);
      
      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });
      
      setSelectedFile(null);
      await loadAssignments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit assignment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleDownloadAssignment = async (assignmentId: number, title: string) => {
    try {
      const blob = await assignmentApi.downloadAssignment(assignmentId);
      downloadFile(blob, `${title}.pdf`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download assignment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      const isPastDue = new Date(assignment.dueDate) < new Date();
      return isPastDue ? (
        <Badge variant="destructive">Overdue</Badge>
      ) : (
        <Badge variant="secondary">Not Submitted</Badge>
      );
    }

    const submission = assignment.submissions[0];
    if (submission.status === 'GRADED') {
      return <Badge variant="default">Graded ({submission.score}/{assignment.maxScore})</Badge>;
    }
    if (submission.status === 'SUBMITTED') {
      return <Badge variant="secondary">Submitted</Badge>;
    }
    if (submission.status === 'LATE') {
      return <Badge variant="destructive">Late Submission</Badge>;
    }
    return <Badge>Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground mt-1">
          View and submit your course assignments
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({submittedAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      {getStatusBadge(assignment)}
                    </div>
                    <CardDescription>
                      {assignment.course.code} - {assignment.course.title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{assignment.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <span className="text-muted-foreground">Max Score: {assignment.maxScore}</span>
                </div>

                <div className="flex gap-2">
                  {assignment.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAssignment(assignment.id, assignment.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Brief
                    </Button>
                  )}

                  {(!assignment.submissions || assignment.submissions.length === 0) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Assignment</DialogTitle>
                          <DialogDescription>
                            Upload your assignment file (PDF, DOC, DOCX)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="file">Select File</Label>
                            <Input
                              id="file"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                          </div>
                          <Button
                            onClick={() => handleSubmitAssignment(assignment.id)}
                            disabled={!selectedFile || submitting === assignment.id}
                            className="w-full"
                          >
                            {submitting === assignment.id ? 'Submitting...' : 'Submit'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {assignments.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assignments available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <Badge variant="secondary">Not Submitted</Badge>
                    </div>
                    <CardDescription>
                      {assignment.course.code} - {assignment.course.title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{assignment.description}</p>

                <div className="flex items-center text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Due: {formatDate(assignment.dueDate)}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Assignment</DialogTitle>
                      <DialogDescription>
                        Upload your assignment file (PDF, DOC, DOCX)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">Select File</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button
                        onClick={() => handleSubmitAssignment(assignment.id)}
                        disabled={!selectedFile || submitting === assignment.id}
                        className="w-full"
                      >
                        {submitting === assignment.id ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}

          {pendingAssignments.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">All caught up! No pending assignments</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      {getStatusBadge(assignment)}
                    </div>
                    <CardDescription>
                      {assignment.course.code} - {assignment.course.title}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{assignment.description}</p>

                {assignment.submissions && assignment.submissions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submitted: {formatDate(assignment.submissions[0].submittedAt)}
                    </div>
                    {assignment.submissions[0].score !== null && (
                      <div className="text-sm font-medium">
                        Score: {assignment.submissions[0].score}/{assignment.maxScore}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {submittedAssignments.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No submitted assignments yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
