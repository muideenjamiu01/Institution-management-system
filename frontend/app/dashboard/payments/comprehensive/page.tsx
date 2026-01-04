'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Plus,
  Download,
  Filter,
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Invoice {
  id: number;
  invoiceNo: string;
  student: {
    matricNo: string;
    firstName: string;
    lastName: string;
    department: { name: string };
  };
  type: string;
  amount: number;
  balance: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  session: { name: string };
}

interface PaymentStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
}

export default function ComprehensivePaymentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    level: '',
    departmentId: '',
    sessionId: '',
    dueDate: '',
  });

  // Fetch sessions
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get('/admin/payments/sessions');
      return response.data.data || [];
    },
  });

  // Fetch departments
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data.data || [];
    },
  });

  // Fetch invoices
  const { data: invoicesData, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices', selectedSession, selectedStatus, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSession) params.append('sessionId', selectedSession);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/admin/payments/invoices?${params}`);
      return response.data.data || [];
    },
  });

  // Fetch payment statistics
  const { data: statsData } = useQuery({
    queryKey: ['payment-stats', selectedSession, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSession) params.append('sessionId', selectedSession);
      if (dateRange.from) params.append('startDate', dateRange.from);
      if (dateRange.to) params.append('endDate', dateRange.to);
      
      const response = await api.get(`/admin/payments/statistics/enhanced?${params}`);
      return response.data.data || {
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalOutstanding: 0,
      };
    },
  });

  const sessions = sessionsData || [];
  const departments = departmentsData || [];
  const invoices: Invoice[] = invoicesData || [];
  const stats: PaymentStats = statsData || {
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalOutstanding: 0,
  };

  const handleCreateInvoice = async () => {
    try {
      if (!formData.type || !formData.amount || !formData.sessionId) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const invoiceData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || `${formData.type.replace(/_/g, ' ')} payment`,
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        sessionId: parseInt(formData.sessionId),
        level: (formData.level && formData.level !== 'all') ? parseInt(formData.level) : undefined,
        departmentId: (formData.departmentId && formData.departmentId !== 'all') ? parseInt(formData.departmentId) : undefined,
      };

      const response = await api.post('/admin/payments/invoices', invoiceData);
      
      toast({
        title: 'Success',
        description: `${response.data.data.created} invoices created successfully`,
      });
      
      setIsCreateDialogOpen(false);
      setFormData({
        type: '',
        amount: '',
        description: '',
        level: '',
        departmentId: '',
        sessionId: '',
        dueDate: '',
      });
      refetchInvoices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create invoices',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSession) params.append('sessionId', selectedSession);
      if (selectedStatus) params.append('status', selectedStatus);
      if (dateRange.from) params.append('startDate', dateRange.from);
      if (dateRange.to) params.append('endDate', dateRange.to);
      
      const response = await api.get(`/admin/payments/export?${params}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Success',
        description: 'Payment data exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export payment data',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PAID: 'default',
      PENDING: 'secondary',
      PARTIALLY_PAID: 'outline',
      FAILED: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive payment tracking and invoice management
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Student Invoice</DialogTitle>
              <DialogDescription>
                Generate invoices for students. Leave level and department empty to create for all students.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Payment Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHOOL_FEE">School Fee</SelectItem>
                      <SelectItem value="EXAMINATION_FEE">Examination Fee</SelectItem>
                      <SelectItem value="TECHNOLOGY_FEE">Technology Fee</SelectItem>
                      <SelectItem value="DEVELOPMENT_FEE">Development Fee</SelectItem>
                      <SelectItem value="LABORATORY_FEE">Laboratory Fee</SelectItem>
                      <SelectItem value="LIBRARY_FEE">Library Fee</SelectItem>
                      <SelectItem value="OTHER">Other (Convocation, ICT, Accreditation, etc.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session">Academic Session *</Label>
                  <Select
                    value={formData.sessionId}
                    onValueChange={(value) => setFormData({ ...formData, sessionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session: any) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="150000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level (Optional)</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                      <SelectItem value="600">600 Level</SelectItem>
                      <SelectItem value="700">700 Level</SelectItem>
                      <SelectItem value="800">800 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Convocation Fee for Graduating Students, ICT Lab Materials, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice}>
                Create Invoices
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sessions</SelectItem>
                  {sessions.map((session: any) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Input
              placeholder="Search by student name or matric no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetchInvoices()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidInvoices} paid, {stats.pendingInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalInvoices > 0
                ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Showing {invoices.length} invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">
                    {invoice.invoiceNo}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {invoice.student.firstName} {invoice.student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.student.matricNo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {invoice.type.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(invoice.amountPaid)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(invoice.balance)}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{invoice.session.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {invoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}