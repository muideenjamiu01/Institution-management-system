'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap,
  BookOpen,
  CreditCard,
  FileCheck,
  Building2
} from 'lucide-react';

interface StudentDetailsModalProps {
  student: any;
  open: boolean;
  onClose: () => void;
}

export default function StudentDetailsModal({
  student,
  open,
  onClose,
}: StudentDetailsModalProps) {
  if (!student) return null;

  // Base URL for file serving
  const fileBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleViewFile = (filePath: string) => {
    if (!filePath) return;
    const fullUrl = `${fileBaseUrl}${filePath}`;
    window.open(fullUrl, '_blank');
  };

  const handleDownloadFile = (filePath: string, fileName: string) => {
    if (!filePath) return;
    const fullUrl = `${fileBaseUrl}${filePath}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Student Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {student.firstName} {student.lastName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Matric Number</p>
                    <p className="font-medium font-mono">{student.matricNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{student.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </p>
                    <p className="font-medium">{student.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </p>
                    <p className="font-medium">
                      {student.dateOfBirth
                        ? format(new Date(student.dateOfBirth), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{student.gender || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{student.address || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Information Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Program Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{student.department.name}</p>
                      <p className="text-xs text-muted-foreground">Code: {student.department.code}</p>
                    </div>
                  )}
                  {student.program && (
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{student.program.name}</p>
                      <p className="text-xs text-muted-foreground">Code: {student.program.code}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="font-medium">{student.currentLevel} Level</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollment Date</p>
                    <p className="font-medium">
                      {student.enrollmentDate
                        ? format(new Date(student.enrollmentDate), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {student.currentSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Current Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Session Name</p>
                      <p className="font-medium">{student.currentSession.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={student.currentSession.isActive ? 'default' : 'secondary'}>
                        {student.currentSession.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {student.currentSession.startDate
                          ? format(new Date(student.currentSession.startDate), 'PPP')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {student.currentSession.endDate
                          ? format(new Date(student.currentSession.endDate), 'PPP')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Academic Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {student._count?.courseRegistrations || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Courses Registered</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {student._count?.scores || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Exams Taken</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {student.cgpa?.toFixed(2) || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">CGPA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Registered Courses
                </CardTitle>
                <CardDescription>
                  All courses registered by this student
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.courseRegistrations && student.courseRegistrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.courseRegistrations.map((registration: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{registration.course?.code || 'N/A'}</TableCell>
                          <TableCell>{registration.course?.title || 'N/A'}</TableCell>
                          <TableCell>{registration.course?.credits || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {registration.semesterRecord?.name || registration.semester || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={registration.status === 'REGISTERED' ? 'default' : 'secondary'}>
                              {registration.status || 'N/A'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No registered courses found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {student.scores && student.scores.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Exam Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.scores.map((score: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{score.exam?.course?.code || 'N/A'}</TableCell>
                          <TableCell>{score.exam?.course?.title || 'N/A'}</TableCell>
                          <TableCell className="font-semibold">{score.score}</TableCell>
                          <TableCell>
                            <Badge variant={score.grade === 'A' || score.grade === 'B' ? 'default' : 'secondary'}>
                              {score.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(student.walletBalance || 0)}
                </div>
              </CardContent>
            </Card>

            {student.invoices && student.invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono text-sm">{invoice.invoiceNo}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {invoice.type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(invoice.amountPaid)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(invoice.balance)}</TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {student.payments && student.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.method}</Badge>
                          </TableCell>
                          <TableCell>
                            {payment.paidAt ? format(new Date(payment.paidAt), 'PPP') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Documents
                </CardTitle>
                <CardDescription>
                  Documents submitted during application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                {student.profilePicture && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Profile Picture</p>
                          <p className="text-sm text-muted-foreground">
                            Student's passport photograph
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFile(student.profilePicture)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadFile(student.profilePicture, 'profile-picture.jpg')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional documents from applicant */}
                {student.applicant && (
                  <>
                    {student.applicant.academicDocument && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Academic Document</p>
                              <p className="text-sm text-muted-foreground">
                                Previous qualification certificate
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFile(student.applicant.academicDocument)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(student.applicant.academicDocument, 'academic-document.pdf')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {student.applicant.additionalDocument && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Additional Document</p>
                              <p className="text-sm text-muted-foreground">
                                Supporting documents
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFile(student.applicant.additionalDocument)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(student.applicant.additionalDocument, 'additional-document.pdf')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!student.profilePicture && !student.applicant?.academicDocument && !student.applicant?.additionalDocument && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
