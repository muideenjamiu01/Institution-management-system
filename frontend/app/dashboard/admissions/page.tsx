'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { CheckCircle, XCircle, Eye, Trash2, MoreVertical, RefreshCw, Users, Clock, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import ApplicantDetailsModal from '@/components/ApplicantDetailsModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';

export default function AdmissionsPage() {
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingApplicant, setDeletingApplicant] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkActioning, setIsBulkActioning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);

      const response = await api.get(`/admissions/applicants?${params.toString()}`);
      setApplicants(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applicants',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/admissions/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    fetchApplicants();
    fetchSummary();
  }, [page, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchApplicants();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleDecision = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/admissions/applicants/${id}/decision`, { status });
      toast({
        title: 'Success',
        description: `Applicant ${status.toLowerCase()} successfully`,
      });
      fetchApplicants();
      fetchSummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update decision',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await api.get(`/admissions/applicants/${id}`);
      setSelectedApplicant(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applicant details',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingApplicant(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApplicant) return;

    try {
      setIsDeleting(true);
      await api.delete(`/admissions/applicants/${deletingApplicant}`);
      toast({
        title: 'Success',
        description: 'Applicant deleted successfully',
      });
      setShowDeleteModal(false);
      setDeletingApplicant(null);
      fetchApplicants();
      fetchSummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete applicant',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplicants(applicants.map((a) => a.id));
    } else {
      setSelectedApplicants([]);
    }
  };

  const handleSelectApplicant = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedApplicants([...selectedApplicants, id]);
    } else {
      setSelectedApplicants(selectedApplicants.filter((aid) => aid !== id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplicants.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one applicant',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsBulkActioning(true);
      await api.post('/admissions/applicants/bulk/approve', {
        applicantIds: selectedApplicants,
      });
      toast({
        title: 'Success',
        description: `${selectedApplicants.length} applicant(s) approved successfully`,
      });
      setSelectedApplicants([]);
      fetchApplicants();
      fetchSummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk approve applicants',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedApplicants.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one applicant',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsBulkActioning(true);
      await api.post('/admissions/applicants/bulk/reject', {
        applicantIds: selectedApplicants,
      });
      toast({
        title: 'Success',
        description: `${selectedApplicants.length} applicant(s) rejected successfully`,
      });
      setSelectedApplicants([]);
      fetchApplicants();
      fetchSummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk reject applicants',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApplicants.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one applicant',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedApplicants.length} applicant(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkActioning(true);
      await api.post('/admissions/applicants/bulk/delete', {
        applicantIds: selectedApplicants,
      });
      toast({
        title: 'Success',
        description: `${selectedApplicants.length} applicant(s) deleted successfully`,
      });
      setSelectedApplicants([]);
      fetchApplicants();
      fetchSummary();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk delete applicants',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActioning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
        <p className="text-muted-foreground mt-2">Manage applicant admissions and decisions</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                <h3 className="text-2xl font-bold mt-1">{summary.totalApplicants}</h3>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{summary.approved}</h3>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{summary.rejected}</h3>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">{summary.pending}</h3>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
        </div>
      )}

      <div className="flex gap-4 items-center flex-wrap">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {selectedApplicants.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <span className="text-sm text-muted-foreground self-center">
              {selectedApplicants.length} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkApprove}
              disabled={isBulkActioning}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Bulk Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkReject}
              disabled={isBulkActioning}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Bulk Reject
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkActioning}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Bulk Delete
            </Button>
          </div>
        )}
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      applicants.length > 0 &&
                      selectedApplicants.length === applicants.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Grade Avg</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedApplicants.includes(applicant.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectApplicant(applicant.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {applicant.firstName} {applicant.lastName}
                  </TableCell>
                  <TableCell>{applicant.email}</TableCell>
                  <TableCell>{applicant.phone}</TableCell>
                  <TableCell>{applicant.gradeAverage}%</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        applicant.admissionDecision?.status
                      )}`}
                    >
                      {applicant.admissionDecision?.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(applicant.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {applicant.admissionDecision?.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleDecision(applicant.id, 'APPROVED')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDecision(applicant.id, 'REJECTED')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {applicant.admissionDecision?.status === 'APPROVED' && (
                            <DropdownMenuItem
                              onClick={() => handleDecision(applicant.id, 'REJECTED')}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Change to Rejected
                            </DropdownMenuItem>
                          )}
                          {applicant.admissionDecision?.status === 'REJECTED' && (
                            <DropdownMenuItem
                              onClick={() => handleDecision(applicant.id, 'APPROVED')}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Change to Approved
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(applicant.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {applicants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No applicants found
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

      <ApplicantDetailsModal
        applicant={selectedApplicant}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplicant(null);
        }}
      />

      <ConfirmDeleteModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingApplicant(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Applicant"
        description="Are you sure you want to delete this applicant? This action cannot be undone and will permanently remove all their data from the database."
      />
    </div>
  );
}
