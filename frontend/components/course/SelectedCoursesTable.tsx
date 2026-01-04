import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/lib/api-course';
import { X } from 'lucide-react';

interface SelectedCoursesTableProps {
  courses: Course[];
  onRemove: (courseId: number) => void;
  totalUnits: number;
  minUnits?: number;
  maxUnits?: number;
}

export default function SelectedCoursesTable({
  courses,
  onRemove,
  totalUnits,
  minUnits = 15,
  maxUnits = 24,
}: SelectedCoursesTableProps) {
  const isWithinLimit = totalUnits >= minUnits && totalUnits <= maxUnits;
  const isOverLimit = totalUnits > maxUnits;
  const isUnderLimit = totalUnits < minUnits;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Selected Courses ({courses.length})</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total Units:</span>
          <Badge
            className={`text-base px-3 py-1 ${
              isWithinLimit
                ? 'bg-green-100 text-green-800'
                : isOverLimit
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {totalUnits} / {maxUnits}
          </Badge>
        </div>
      </div>

      {(isUnderLimit || isOverLimit) && (
        <div
          className={`p-3 rounded-lg border ${
            isOverLimit
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}
        >
          <p className="text-sm font-medium">
            {isOverLimit
              ? `⚠️ You have exceeded the maximum of ${maxUnits} units by ${totalUnits - maxUnits} unit(s)`
              : `⚠️ You need at least ${minUnits} units. Add ${minUnits - totalUnits} more unit(s)`}
          </p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No courses selected yet</p>
          <p className="text-sm mt-1">Select courses from the available list above</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-mono font-medium">{course.code}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{course.credits}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={course.isElective ? 'outline' : 'default'}>
                    {course.isElective ? 'Elective' : 'Core'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(course.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
