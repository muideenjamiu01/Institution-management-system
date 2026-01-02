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
import { format } from 'date-fns';
import { FileText, Image, Download, Eye } from 'lucide-react';

interface ApplicantDetailsModalProps {
  applicant: any;
  open: boolean;
  onClose: () => void;
}

export default function ApplicantDetailsModal({
  applicant,
  open,
  onClose,
}: ApplicantDetailsModalProps) {
  if (!applicant) return null;

  // Base URL for file serving (without /api suffix)
  const fileBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Applicant Details</DialogTitle>
          <DialogDescription>
            Complete information about the applicant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {applicant.firstName} {applicant.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{applicant.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{applicant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {applicant.dateOfBirth
                    ? format(new Date(applicant.dateOfBirth), 'PPP')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{applicant.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{applicant.username || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Address Information</h3>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{applicant.address || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Previous School</p>
                <p className="font-medium">{applicant.previousSchool || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grade Average</p>
                <p className="font-medium">{applicant.gradeAverage || 'N/A'}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Program Type</p>
                <p className="font-medium">{applicant.programType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application Date</p>
                <p className="font-medium">
                  {applicant.applicationDate
                    ? format(new Date(applicant.applicationDate), 'PPP')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {(applicant.department || applicant.program) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Program Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicant.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{applicant.department.name}</p>
                      <p className="text-xs text-muted-foreground">Code: {applicant.department.code}</p>
                    </div>
                  )}
                  {applicant.program && (
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{applicant.program.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Code: {applicant.program.code} • {applicant.program.duration} years
                      </p>
                    </div>
                  )}
                </div>
                {applicant.program?.description && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Program Description</p>
                    <p className="text-sm mt-1">{applicant.program.description}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Admission Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Admission Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  className={`${getStatusColor(
                    applicant.admissionDecision?.status || 'PENDING'
                  )} mt-1`}
                >
                  {applicant.admissionDecision?.status || 'PENDING'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application Fee</p>
                <Badge className={applicant.applicationFeePaid ? 'bg-green-100 text-green-800 mt-1' : 'bg-red-100 text-red-800 mt-1'}>
                  {applicant.applicationFeePaid ? 'Paid' : 'Not Paid'}
                </Badge>
              </div>
              {applicant.admissionDecision?.decisionDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Decision Date</p>
                  <p className="font-medium">
                    {format(new Date(applicant.admissionDecision.decisionDate), 'PPP')}
                  </p>
                </div>
              )}
              {applicant.admissionDecision?.decidedBy && (
                <div>
                  <p className="text-sm text-muted-foreground">Decided By</p>
                  <p className="font-medium">{applicant.admissionDecision.decidedBy}</p>
                </div>
              )}
              {applicant.admissionDecision?.decisionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Decision Reason</p>
                  <p className="font-medium">{applicant.admissionDecision.decisionReason}</p>
                </div>
              )}
            </div>
          </div>

          {applicant.matricNumber && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Matric Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Matric Number</p>
                    <p className="font-medium">{applicant.matricNumber.matricNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Acceptance Fee Paid</p>
                    <Badge className={applicant.acceptanceFeePaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {applicant.acceptanceFeePaid ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Documents Section */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3">Documents</h3>
            <div className="grid gap-3">
              {/* Passport Photo */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Image className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Passport Photo</p>
                    {applicant.passportPhoto ? (
                      <Badge variant="secondary" className="text-green-600 mt-1">
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 mt-1">
                        Not uploaded
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {applicant.passportPhoto && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `${fileBaseUrl}${applicant.passportPhoto}`;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`${fileBaseUrl}${applicant.passportPhoto}`);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `passport_${applicant.firstName}_${applicant.lastName}.${applicant.passportPhoto.split('.').pop()}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed:', error);
                          }
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Academic Document */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Academic Document</p>
                    <p className="text-xs text-gray-500">ND/HND/BSC Result</p>
                    {applicant.academicDocument ? (
                      <Badge variant="secondary" className="text-green-600 mt-1">
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 mt-1">
                        Not uploaded
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {applicant.academicDocument && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `${fileBaseUrl}${applicant.academicDocument}`;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`${fileBaseUrl}${applicant.academicDocument}`);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `academic_${applicant.firstName}_${applicant.lastName}.${applicant.academicDocument.split('.').pop()}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed:', error);
                          }
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Document */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Additional Document</p>
                    <p className="text-xs text-gray-500">Supporting document</p>
                    {applicant.additionalDocument ? (
                      <Badge variant="secondary" className="text-green-600 mt-1">
                        Uploaded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500 mt-1">
                        Not uploaded
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {applicant.additionalDocument && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `${fileBaseUrl}${applicant.additionalDocument}`;
                          link.target = '_blank';
                          link.rel = 'noopener noreferrer';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`${fileBaseUrl}${applicant.additionalDocument}`);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `additional_${applicant.firstName}_${applicant.lastName}.${applicant.additionalDocument.split('.').pop()}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download failed:', error);
                          }
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}