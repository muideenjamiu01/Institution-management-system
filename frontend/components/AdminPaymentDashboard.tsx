'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

interface Invoice {
  id: number;
  invoiceNo: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
  status: string;
  dueDate: string;
  level: number;
  student: {
    id: number;
    matricNo: string;
    firstName: string;
    lastName: string;
    department: {
      name: string;
    };
  };
  session: {
    name: string;
  };
  payments: Array<{
    id: number;
    amount: number;
    reference: string;
    method: string;
    paidAt: string;
  }>;
}

interface PaymentFormData {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  paidBy?: string;
}

export default function AdminPaymentDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    invoiceId: 0,
    amount: 0,
    paymentMethod: 'CASH',
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all invoices
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['admin-invoices', selectedStatus, selectedLevel, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedLevel) params.append('level', selectedLevel);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/admin/payments/invoices/all?${params}`);
      return response.data;
    },
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: PaymentFormData) => {
      const response = await api.post('/admin/payments/payments/record', paymentData);
      return response.data;
    },
    onSuccess: () => {
      alert('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
      setShowPaymentDialog(false);
      setSelectedInvoice(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to record payment');
    },
  });

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentFormData({
      invoiceId: invoice.id,
      amount: invoice.balance,
      paymentMethod: 'CASH',
      paidBy: `${invoice.student.firstName} ${invoice.student.lastName}`,
    });
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = () => {
    recordPaymentMutation.mutate(paymentFormData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pending', variant: 'secondary' as const },
      PAID: { label: 'Paid', variant: 'default' as const },
      PARTIALLY_PAID: { label: 'Partial', variant: 'outline' as const },
      FAILED: { label: 'Failed', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, variant: 'secondary' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const invoices = invoicesData?.invoices || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-gray-600">Manage student invoices and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum: number, inv: Invoice) => sum + inv.amount, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum: number, inv: Invoice) => sum + inv.balance, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((inv: Invoice) => inv.status === 'PAID').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
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
            
            <div>
              <Label>Search Student</Label>
              <Input
                placeholder="Search by name or matric no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNo}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invoice.student.firstName} {invoice.student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.student.matricNo}
                        </div>
                        <div className="text-xs text-gray-400">
                          {invoice.student.department.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.type.replace('_', ' ')}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatCurrency(invoice.balance)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{invoice.level}</TableCell>
                    <TableCell>
                      {invoice.balance > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleRecordPayment(invoice)}
                        >
                          Record Payment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <div>
                <Label>Invoice Details</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p><strong>Invoice:</strong> {selectedInvoice.invoiceNo}</p>
                  <p><strong>Student:</strong> {selectedInvoice.student.firstName} {selectedInvoice.student.lastName}</p>
                  <p><strong>Type:</strong> {selectedInvoice.type}</p>
                  <p><strong>Outstanding:</strong> {formatCurrency(selectedInvoice.balance)}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0
                  }))}
                  max={selectedInvoice.balance}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentFormData.paymentMethod}
                  onValueChange={(value) => setPaymentFormData(prev => ({
                    ...prev,
                    paymentMethod: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="referenceNo">Reference Number (Optional)</Label>
                <Input
                  id="referenceNo"
                  value={paymentFormData.referenceNo || ''}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    referenceNo: e.target.value
                  }))}
                  placeholder="Payment reference..."
                />
              </div>

              <div>
                <Label htmlFor="paidBy">Paid By</Label>
                <Input
                  id="paidBy"
                  value={paymentFormData.paidBy || ''}
                  onChange={(e) => setPaymentFormData(prev => ({
                    ...prev,
                    paidBy: e.target.value
                  }))}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={recordPaymentMutation.isPending}
                >
                  {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}