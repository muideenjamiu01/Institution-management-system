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
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

// Mock data for demonstration
const mockInvoices = [
  {
    id: 1,
    invoiceNo: 'INV-2025-SCHOOL_FEE-001',
    student: {
      matricNo: 'STU/2023/001',
      firstName: 'John',
      lastName: 'Doe',
      department: { name: 'Computer Science' },
    },
    type: 'SCHOOL_FEE',
    amount: 150000,
    balance: 150000,
    status: 'PENDING',
    dueDate: '2025-01-30',
    session: { name: '2024/2025' },
  },
  {
    id: 2,
    invoiceNo: 'INV-2025-EXAMINATION_FEE-002',
    student: {
      matricNo: 'STU/2023/002',
      firstName: 'Jane',
      lastName: 'Smith',
      department: { name: 'Business Administration' },
    },
    type: 'EXAMINATION_FEE',
    amount: 25000,
    balance: 0,
    status: 'PAID',
    dueDate: '2025-01-15',
    session: { name: '2024/2025' },
  },
];

const mockStats = {
  totalInvoices: 250,
  paidInvoices: 180,
  pendingInvoices: 70,
  totalAmount: 37500000,
  totalPaid: 27000000,
  totalOutstanding: 10500000,
};

interface CreateInvoiceFormData {
  type: string;
  amount: string;
  description: string;
  level: string;
  departmentId: string;
  sessionId: string;
  dueDate: string;
}

export default function PaymentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateInvoiceFormData>({
    type: '',
    amount: '',
    description: '',
    level: '',
    departmentId: '',
    sessionId: '',
    dueDate: '',
  });
  const { toast } = useToast();

  // Load departments and sessions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptResponse, sessResponse] = await Promise.all([
          api.get('/departments'),
          api.get('/admin/payments/sessions')
        ]);
        setDepartments(deptResponse.data.data || []);
        setSessions(sessResponse.data.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleCreateInvoice = async () => {
    try {
      // Validate form
      if (!formData.type || !formData.amount || !formData.sessionId) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields (Payment Type, Amount, Session)',
          variant: 'destructive',
        });
        return;
      }

      // Prepare invoice data
      const invoiceData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || `${formData.type.replace(/_/g, ' ')} payment`,
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        sessionId: parseInt(formData.sessionId),
        level: (formData.level && formData.level !== 'all') ? parseInt(formData.level) : undefined,
        departmentId: (formData.departmentId && formData.departmentId !== 'all') ? parseInt(formData.departmentId) : undefined,
      };

      // Call API to create invoices
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
    } catch (error: any) {
      console.error('Error creating invoices:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create invoices',
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
    const variants = {
      PAID: 'default',
      PENDING: 'secondary',
      PARTIALLY_PAID: 'secondary',
      FAILED: 'destructive',
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
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
            Manage student invoices and payment records
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Student Invoice</DialogTitle>
              <DialogDescription>
                Generate invoices for students based on the criteria below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHOOL_FEE">School Fee</SelectItem>
                    <SelectItem value="EXAMINATION_FEE">Examination Fee</SelectItem>
                    <SelectItem value="TECHNOLOGY_FEE">Technology Fee</SelectItem>
                    <SelectItem value="DEVELOPMENT_FEE">Development Fee</SelectItem>
                    <SelectItem value="DEPARTMENTAL_FEE">Departmental Fee</SelectItem>
                    <SelectItem value="ACCREDITATION_FEE">Accreditation Fee</SelectItem>
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
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description for the invoice..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              All time invoices
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
              {((mockStats.paidInvoices / mockStats.totalInvoices) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {mockStats.paidInvoices} of {mockStats.totalInvoices} paid
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
              {formatCurrency(mockStats.totalPaid)}
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
              {formatCurrency(mockStats.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockStats.pendingInvoices} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage all student invoices</CardDescription>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, matric no, or invoice no..."
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
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
                        {invoice.student.matricNo} • {invoice.student.department.name}
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
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}