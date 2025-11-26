'use client';

import { useEffect, useState } from 'react';
import { courseApi } from '@/lib/api-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  level: number;
  semester: number;
  description: string | null;
  prerequisite: string | null;
  department: {
    name: string;
  };
}

interface Registration {
  id: number;
  course: Course;
  registrationDate: string;
  semester: number;
  academicYear: string;
  isCarryOver: boolean;
}

export default function CoursesPage() {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const [availableRes, registeredRes] = await Promise.all([
        courseApi.getAvailableCourses(),
        courseApi.getRegisteredCourses(),
      ]);
      setAvailableCourses(availableRes.data);
      setRegisteredCourses(registeredRes.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCourse = async (courseId: number) => {
    try {
      setRegistering(courseId);
      // Assuming current session and semester 1
      await courseApi.registerCourse(courseId, 1, 1);
      toast({
        title: 'Success',
        description: 'Course registered successfully',
      });
      await loadCourses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to register course',
        variant: 'destructive',
      });
    } finally {
      setRegistering(null);
    }
  };

  const handleDropCourse = async (registrationId: number) => {
    try {
      await courseApi.dropCourse(registrationId);
      toast({
        title: 'Success',
        description: 'Course dropped successfully',
      });
      await loadCourses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to drop course',
        variant: 'destructive',
      });
    }
  };

  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold tracking-tight">Course Registration</h1>
        <p className="text-muted-foreground mt-1">
          Browse and register for courses
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">
            Available Courses ({availableCourses.length})
          </TabsTrigger>
          <TabsTrigger value="registered">
            My Courses ({registeredCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAvailableCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                      <CardDescription>{course.title}</CardDescription>
                    </div>
                    <Badge variant="secondary">{course.credits} Units</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Level {course.level} - Semester {course.semester}
                    </div>
                    {course.prerequisite && (
                      <div className="flex items-center text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Prerequisites: {course.prerequisite}
                      </div>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleRegisterCourse(course.id)}
                    disabled={registering === course.id}
                  >
                    {registering === course.id ? 'Registering...' : 'Register Course'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAvailableCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="registered" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {registeredCourses.map((registration) => (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{registration.course.code}</CardTitle>
                      <CardDescription>{registration.course.title}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary">{registration.course.credits} Units</Badge>
                      {registration.isCarryOver && (
                        <Badge variant="destructive" className="text-xs">Carry Over</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Level {registration.course.level} - Semester {registration.semester}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {registration.academicYear}
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Registered
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDropCourse(registration.id)}
                  >
                    Drop Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {registeredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't registered any courses yet</p>
              <Button className="mt-4" onClick={() => document.querySelector('[value="available"]')?.click()}>
                Browse Available Courses
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
