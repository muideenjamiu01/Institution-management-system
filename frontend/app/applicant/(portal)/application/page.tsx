'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApplicantAuth } from '@/lib/applicant-auth-context';
import { applicationApi } from '@/lib/api-applicant';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const applicationSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
  address: z.string().min(10, 'Please provide a complete address'),
  previousSchool: z.string().min(3, 'Previous school name is required'),
  gradeAverage: z.number().min(0).max(100, 'Grade must be between 0 and 100'),
  programType: z.enum(['ND', 'HND', 'BSC', 'MSC', 'PHD'], {
    required_error: 'Program type is required',
  }),
  departmentId: z.number({ required_error: 'Department is required' }).min(1),
  programId: z.number({ required_error: 'Program is required' }).min(1),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Program {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  duration: number;
}

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  ND: 'National Diploma (ND)',
  HND: 'Higher National Diploma (HND)',
  BSC: 'Bachelor of Science (BSC)',
  MSC: 'Master of Science (MSC)',
  PHD: 'Doctor of Philosophy (PHD)',
};

export default function ApplicationFormPage() {
  const { applicant, updateApplicant } = useApplicantAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      dateOfBirth: applicant?.dateOfBirth || '',
      gender: (applicant?.gender as 'MALE' | 'FEMALE' | 'OTHER') || undefined,
      address: applicant?.address || '',
      previousSchool: applicant?.previousSchool || '',
      gradeAverage: applicant?.gradeAverage || undefined,
      programType: (applicant as any)?.programType || undefined,
      departmentId: (applicant as any)?.departmentId || undefined,
      programId: (applicant as any)?.programId || undefined,
    },
  });

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await api.get('/departments');
        setDepartments(response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch departments',
          variant: 'destructive',
        });
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [toast]);

  // Fetch programs when department is selected
  useEffect(() => {
    if (selectedDepartmentId) {
      const fetchPrograms = async () => {
        setLoadingPrograms(true);
        try {
          const response = await api.get(`/applicant/programs?departmentId=${selectedDepartmentId}`);
          setPrograms(response.data.data || response.data);
        } catch (error) {
          console.error('Failed to fetch programs:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch programs',
            variant: 'destructive',
          });
        } finally {
          setLoadingPrograms(false);
        }
      };
      fetchPrograms();
    } else {
      setPrograms([]);
    }
  }, [selectedDepartmentId, toast]);

  useEffect(() => {
    if (applicant) {
      setIsSubmitted(!!(applicant.dateOfBirth && applicant.gender && applicant.address));
    }
  }, [applicant]);

  const onSubmit = async (data: ApplicationForm) => {
    try {
      setIsLoading(true);
      
      const response = await applicationApi.submitApplication({
        phone: applicant?.phone || '',
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        previousSchool: data.previousSchool,
        gradeAverage: data.gradeAverage,
        programType: data.programType,
        departmentId: data.departmentId,
        programId: data.programId,
      });

      // Update local state with the returned applicant data
      if (applicant && response.applicant) {
        updateApplicant({
          ...applicant,
          ...response.applicant,
        });
      }

      setIsSubmitted(true);
      
      toast({
        title: 'Application Submitted!',
        description: 'Your application has been submitted successfully and is under review.',
      });
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!applicant) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {isSubmitted && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Application Submitted!</strong> Your application is currently under review by the admissions committee.
            You will be notified once a decision is made.
          </AlertDescription>
        </Alert>
      )}

      {!isSubmitted && (
        <Alert className="border-blue-500 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Please complete all sections of the application form below. All fields are required.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Admission Application Form</CardTitle>
          <CardDescription>
            Provide your personal and academic information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={applicant.firstName} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={applicant.lastName} disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={applicant.email} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={applicant.phone} disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    disabled={isSubmitted}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    onValueChange={(value) => setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER')}
                    defaultValue={applicant.gender || undefined}
                    disabled={isSubmitted}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Residential Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full residential address"
                  rows={3}
                  {...register('address')}
                  disabled={isSubmitted}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School/Institution *</Label>
                <Input
                  id="previousSchool"
                  placeholder="Name of your last attended school"
                  {...register('previousSchool')}
                  disabled={isSubmitted}
                />
                {errors.previousSchool && (
                  <p className="text-sm text-destructive">{errors.previousSchool.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeAverage">Grade Average/CGPA (%) *</Label>
                <Input
                  id="gradeAverage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Enter your grade percentage (0-100)"
                  {...register('gradeAverage', { valueAsNumber: true })}
                  disabled={isSubmitted}
                />
                {errors.gradeAverage && (
                  <p className="text-sm text-destructive">{errors.gradeAverage.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter your average grade as a percentage. For example, if your CGPA is 3.5/4.0, enter 87.5
                </p>
              </div>
            </div>

            {/* Program Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Program Selection</h3>
              
              <div className="space-y-2">
                <Label htmlFor="programType">Program Type *</Label>
                <Select
                  onValueChange={(value) => setValue('programType', value as any)}
                  defaultValue={(applicant as any)?.programType || undefined}
                  disabled={isSubmitted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROGRAM_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programType && (
                  <p className="text-sm text-destructive">{errors.programType.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Select the type of program you are applying for
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  onValueChange={(value) => {
                    const deptId = parseInt(value);
                    setValue('departmentId', deptId);
                    setSelectedDepartmentId(deptId);
                    setValue('programId', 0); // Reset program selection
                  }}
                  defaultValue={(applicant as any)?.departmentId?.toString() || undefined}
                  disabled={isSubmitted || loadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDepartments ? 'Loading departments...' : 'Select department'} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program/Course *</Label>
                <Select
                  onValueChange={(value) => setValue('programId', parseInt(value))}
                  defaultValue={(applicant as any)?.programId?.toString() || undefined}
                  disabled={isSubmitted || !selectedDepartmentId || loadingPrograms}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !selectedDepartmentId 
                          ? 'Select department first' 
                          : loadingPrograms 
                          ? 'Loading programs...' 
                          : 'Select program'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id.toString()}>
                        {prog.name} ({prog.code}) - {prog.duration} years
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programId && (
                  <p className="text-sm text-destructive">{errors.programId.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Select the specific program/course you wish to study
                </p>
              </div>
            </div>

            {!isSubmitted && (
              <div className="flex justify-end space-x-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            )}

            {isSubmitted && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 text-center">
                  Application submitted on {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}. You will be notified of the admission decision via email.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
