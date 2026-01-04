import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, AlertCircle } from 'lucide-react';
import { Course } from '@/lib/api-course';

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onToggle: (courseId: number) => void;
  disabled?: boolean;
  showPrerequisiteWarning?: boolean;
}

export default function CourseCard({
  course,
  isSelected,
  onToggle,
  disabled = false,
  showPrerequisiteWarning = false,
}: CourseCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : 'hover:border-gray-400 hover:shadow-sm'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onToggle(course.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => !disabled && onToggle(course.id)}
            disabled={disabled}
            className="mt-1"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">{course.code}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {course.credits} {course.credits === 1 ? 'Unit' : 'Units'}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-700">{course.title}</p>
                
                {course.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    Level {course.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.semester === 1 ? 'First' : 'Second'} Semester
                  </Badge>
                  {course.isElective && (
                    <Badge variant="secondary" className="text-xs">
                      Elective
                    </Badge>
                  )}
                </div>

                {course.prerequisite && (
                  <div className={`flex items-start gap-2 mt-3 p-2 rounded ${
                    showPrerequisiteWarning ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                  }`}>
                    {showPrerequisiteWarning && (
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${
                        showPrerequisiteWarning ? 'text-orange-800' : 'text-gray-600'
                      }`}>
                        Prerequisite:
                      </p>
                      <p className={`text-xs ${
                        showPrerequisiteWarning ? 'text-orange-700' : 'text-gray-500'
                      }`}>
                        {course.prerequisite}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
