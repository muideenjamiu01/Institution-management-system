'use client';

import { useEffect, useState } from 'react';
import { paymentsApi, formatCurrency, downloadFile } from '@/lib/api-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreditCard, Wallet, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/api-student';

interface Invoice {
  id: number;
  invoiceNo: string;
  type: string;
  description: string | null;
  amount: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string | null;
  session: {
    name: string;
  };
}

interface Payment {
  id: number;
  amount: number;
  method: string;
  reference: string;
  status: string;
  paidAt: string;
  invoice: {
    invoiceNo: string;
    type: string;
  };
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, paymentsRes, walletRes] = await Promise.all([
        paymentsApi.getInvoices(),
        paymentsApi.getPaymentHistory(),
        paymentsApi.getWalletBalance(),
      ]);
      setInvoices(invoicesRes.data);
      setPayments(paymentsRes.data);
      setWalletBalance(walletRes.data.balance);
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async (invoiceId: number, method: 'PAYSTACK' | 'FLUTTERWAVE') => {
    try {
      setPaying(invoiceId);
      const response = await paymentsApi.initializePayment(invoiceId, method);
      
      // Redirect to payment gateway
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
      setPaying(null);
    }
  };

  const handleWalletPayment = async (invoiceId: number) => {
    try {
      setPaying(invoiceId);
      await paymentsApi.payWithWallet(invoiceId);
      toast({
        title: 'Success',
        description: 'Payment successful',
      });
      await loadPaymentData();
      setSelectedInvoice(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setPaying(null);
    }
  };

  const handleDownloadReceipt = async (paymentId: number, reference: string) => {
    try {
      const blob = await paymentsApi.downloadReceipt(paymentId);
      downloadFile(blob, `receipt_${reference}.pdf`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      PAID: { variant: 'default', icon: CheckCircle2 },
      PENDING: { variant: 'secondary', icon: Clock },
      PARTIALLY_PAID: { variant: 'secondary', icon: Clock },
      FAILED: { variant: 'destructive', icon: XCircle },
    };
    const config = variants[status] || variants.PENDING;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your invoices and payment history
        </p>
      </div>

      {/* Wallet Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(walletBalance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Available for payments
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Payment History ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{invoice.invoiceNo}</CardTitle>
                      <CardDescription>
                        {invoice.type.replace(/_/g, ' ')} - {invoice.session.name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invoice.description && (
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount Paid</p>
                      <p className="font-semibold text-green-600">{formatCurrency(invoice.amountPaid)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p className="font-semibold text-red-600">{formatCurrency(invoice.balance)}</p>
                    </div>
                    {invoice.dueDate && (
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
                      </div>
                    )}
                  </div>

                  {invoice.status !== 'PAID' && invoice.balance > 0 && (
                    <Dialog open={selectedInvoice?.id === invoice.id} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedInvoice(invoice)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Make Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Choose Payment Method</DialogTitle>
                          <DialogDescription>
                            Select a payment method to pay {formatCurrency(invoice.balance)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                          <Button
                            className="w-full"
                            onClick={() => handleInitiatePayment(invoice.id, 'PAYSTACK')}
                            disabled={paying === invoice.id}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {paying === invoice.id ? 'Processing...' : 'Pay with Paystack'}
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleInitiatePayment(invoice.id, 'FLUTTERWAVE')}
                            disabled={paying === invoice.id}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {paying === invoice.id ? 'Processing...' : 'Pay with Flutterwave'}
                          </Button>
                          {walletBalance >= invoice.balance && (
                            <Button
                              className="w-full"
                              variant="secondary"
                              onClick={() => handleWalletPayment(invoice.id)}
                              disabled={paying === invoice.id}
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              {paying === invoice.id ? 'Processing...' : 'Pay from Wallet'}
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all your past transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.invoice.invoiceNo}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.invoice.type.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'PAID' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment.id, payment.reference)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {payments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
