'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function ExamsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/exams?page=${page}`);
      setExams(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch exams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Examinations</h1>
        <p className="text-muted-foreground mt-2">View and manage exam schedules and scores</p>
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
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Scores Recorded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.course?.code} - {exam.course?.title}</TableCell>
                  <TableCell>{format(new Date(exam.examDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{exam.maxScore}</TableCell>
                  <TableCell>{exam.academicYear}</TableCell>
                  <TableCell>{exam.semester}</TableCell>
                  <TableCell>{exam._count?.scores || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {exams.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No exams found
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
