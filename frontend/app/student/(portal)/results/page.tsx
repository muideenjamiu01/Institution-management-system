'use client';

import { useEffect, useState } from 'react';
import { resultsApi, downloadFile } from '@/lib/api-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Result {
  id: number;
  score: number;
  grade: string;
  gradePoint: number;
  remarks: string | null;
  course: {
    code: string;
    title: string;
    credits: number;
  };
  session: {
    name: string;
  };
  semester: number;
}

interface GPAData {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
  sessionName?: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [currentGPA, setCurrentGPA] = useState<GPAData | null>(null);
  const [cgpa, setCGPA] = useState<GPAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const [resultsRes, gpaRes, cgpaRes] = await Promise.all([
        resultsApi.getResults(),
        resultsApi.getGPA(),
        resultsApi.getCGPA(),
      ]);
      setResults(resultsRes.data);
      setCurrentGPA(gpaRes.data);
      setCGPA(cgpaRes.data);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: 'Error',
        description: 'Failed to load results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTranscript = async () => {
    try {
      setDownloading(true);
      const blob = await resultsApi.downloadTranscript();
      downloadFile(blob, 'transcript.pdf');
      toast({
        title: 'Success',
        description: 'Transcript downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download transcript',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      A: 'bg-green-500',
      B: 'bg-blue-500',
      C: 'bg-yellow-500',
      D: 'bg-orange-500',
      E: 'bg-red-500',
      F: 'bg-red-700',
    };
    return gradeColors[grade] || 'bg-gray-500';
  };

  const groupResultsBySemester = () => {
    const grouped: Record<string, Result[]> = {};
    results.forEach((result) => {
      const key = `${result.session.name} - Semester ${result.semester}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(result);
    });
    return grouped;
  };

  const calculateSemesterGPA = (semesterResults: Result[]) => {
    const totalCredits = semesterResults.reduce((sum, r) => sum + r.course.credits, 0);
    const totalGradePoints = semesterResults.reduce(
      (sum, r) => sum + r.gradePoint * r.course.credits,
      0
    );
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedResults = groupResultsBySemester();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Results</h1>
          <p className="text-muted-foreground mt-1">
            View your course results and GPA
          </p>
        </div>
        <Button onClick={handleDownloadTranscript} disabled={downloading}>
          <Download className="h-4 w-4 mr-2" />
          {downloading ? 'Downloading...' : 'Download Transcript'}
        </Button>
      </div>

      {/* GPA Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Semester GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentGPA?.gpa.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentGPA?.totalCredits || 0} credits earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cumulative GPA (CGPA)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cgpa?.gpa.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cgpa?.totalCredits || 0} total credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grade Classification</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cgpa && cgpa.gpa >= 4.5
                ? 'First Class'
                : cgpa && cgpa.gpa >= 3.5
                ? 'Second Class Upper'
                : cgpa && cgpa.gpa >= 2.5
                ? 'Second Class Lower'
                : cgpa && cgpa.gpa >= 1.5
                ? 'Third Class'
                : 'Pass'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cgpa && cgpa.gpa >= 3.5 ? 'Excellent' : cgpa && cgpa.gpa >= 2.5 ? 'Good' : 'Fair'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results by Semester */}
      <Tabs defaultValue={Object.keys(groupedResults)[0]} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          {Object.keys(groupedResults).map((semester) => (
            <TabsTrigger key={semester} value={semester}>
              {semester}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedResults).map(([semester, semesterResults]) => (
          <TabsContent key={semester} value={semester}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{semester}</CardTitle>
                    <CardDescription>
                      GPA: {calculateSemesterGPA(semesterResults)} | {semesterResults.length} courses
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Grade Point</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesterResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.course.code}</TableCell>
                        <TableCell>{result.course.title}</TableCell>
                        <TableCell className="text-center">{result.course.credits}</TableCell>
                        <TableCell className="text-center">{result.score}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={getGradeColor(result.grade)}>
                            {result.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{result.gradePoint.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {semesterResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No results available for this semester
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
