'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
