'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';
import { courseApi } from '@/lib/api-student';

interface CarryOverCourse {
  id: number;
  code: string;
  title: string;
  credits: number;
  level: number;
  semester: number;
  department: {
    id: number;
    name: string;
    code: string;
  };
  originalSessionId: number;
  originalSessionName: string;
  originalSemester: number;
  previousAttempts: number;
  lastGrade: string;
  lastScore: number;
}

interface CarryOverSectionProps {
  studentLevel: number;
  onCoursesSelected?: (courses: Array<{ courseId: number; retakeType: string }>) => void;
}

const CarryOverSection: React.FC<CarryOverSectionProps> = ({ studentLevel, onCoursesSelected }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [carryOverCourses, setCarryOverCourses] = useState<CarryOverCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
  const [retakeTypes, setRetakeTypes] = useState<Record<number, string>>({});

  // 100-level students cannot register carry over courses
  if (studentLevel < 200) {
    return null;
  }

  useEffect(() => {
    fetchCarryOverCourses();
  }, []);

  useEffect(() => {
    // Notify parent component of selected courses
    const selectedData = Array.from(selectedCourses).map(courseId => ({
      courseId,
      retakeType: retakeTypes[courseId] || 'FULL_COURSE',
    }));
    onCoursesSelected?.(selectedData);
  }, [selectedCourses, retakeTypes, onCoursesSelected]);

  const fetchCarryOverCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCarryOverCourses();
      
      if (response.success) {
        setCarryOverCourses(response.data || []);
        // Initialize retake types to FULL_COURSE by default
        const initialRetakeTypes: Record<number, string> = {};
        response.data?.forEach((course: CarryOverCourse) => {
          initialRetakeTypes[course.id] = 'FULL_COURSE';
        });
        setRetakeTypes(initialRetakeTypes);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch carry over courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleRetakeTypeChange = (courseId: number, type: string) => {
    setRetakeTypes(prev => ({
      ...prev,
      [courseId]: type,
    }));
  };

  const calculateTotalUnits = () => {
    return carryOverCourses
      .filter(course => selectedCourses.has(course.id))
      .reduce((sum, course) => sum + course.credits, 0);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Carry Over Courses...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (carryOverCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Carry Over Courses
          </CardTitle>
          <CardDescription>
            Previously failed courses available for re-registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have no failed courses. All previous courses have been passed successfully.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              Carry Over Courses
            </CardTitle>
            <CardDescription className="text-amber-700">
              Courses you previously failed - select courses to retake
            </CardDescription>
          </div>
          {selectedCourses.size > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-900">
              {selectedCourses.size} selected ({calculateTotalUnits()} units)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Academic Policy:</strong> Carry over registration is only available for students in levels 200-500.
            Select the courses you want to retake and choose the retake type.
          </AlertDescription>
        </Alert>

        <div className="rounded-md border border-amber-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-100/50">
                <TableHead className="w-12">Select</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-center">Units</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Attempts</TableHead>
                <TableHead className="text-center">Last Grade</TableHead>
                <TableHead>Failed Session</TableHead>
                <TableHead>Retake Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carryOverCourses.map((course) => (
                <TableRow key={course.id} className={selectedCourses.has(course.id) ? 'bg-amber-50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCourses.has(course.id)}
                      onCheckedChange={() => handleCourseToggle(course.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono font-medium">{course.code}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell className="text-center">{course.credits}</TableCell>
                  <TableCell className="text-center">{course.level}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {course.previousAttempts}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">{course.lastGrade}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {course.originalSessionName} (Sem {course.originalSemester})
                  </TableCell>
                  <TableCell>
                    <Select
                      value={retakeTypes[course.id] || 'FULL_COURSE'}
                      onValueChange={(value) => handleRetakeTypeChange(course.id, value)}
                      disabled={!selectedCourses.has(course.id)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_COURSE">Full Course</SelectItem>
                        <SelectItem value="EXAM_ONLY">Exam Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedCourses.size > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="text-sm text-amber-900">
              <strong>Carry Over Summary:</strong> {selectedCourses.size} course(s) selected, {calculateTotalUnits()} total units
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCourses(new Set());
                toast({
                  title: 'Selection cleared',
                  description: 'All carry over courses have been deselected',
                });
              }}
            >
              Clear Selection
            </Button>
          </div>
        )}

        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <p><strong>Retake Type Options:</strong></p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Full Course:</strong> Attend all lectures, complete assignments, and take exams</li>
            <li><strong>Exam Only:</strong> Only take the final examination (must have advisor approval)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarryOverSection;
