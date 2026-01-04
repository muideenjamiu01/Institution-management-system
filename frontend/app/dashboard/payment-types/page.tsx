'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

interface PaymentType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    invoices: number;
  };
}

export default function PaymentTypesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  // Fetch payment types
  const { data: paymentTypes, isLoading } = useQuery({
    queryKey: ['payment-types'],
    queryFn: async () => {
      const response = await api.get('/admin/payment-types');
      return response.data.data as PaymentType[];
    },
  });

  // Create payment type
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/admin/payment-types', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Payment type created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create payment type',
        variant: 'destructive',
      });
    },
  });

  // Update payment type
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const response = await api.put(`/admin/payment-types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      setIsEditDialogOpen(false);
      setSelectedPaymentType(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Payment type updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update payment type',
        variant: 'destructive',
      });
    },
  });

  // Delete payment type
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/payment-types/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      setIsDeleteDialogOpen(false);
      setSelectedPaymentType(null);
      toast({
        title: 'Success',
        description: 'Payment type deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete payment type',
        variant: 'destructive',
      });
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/admin/payment-types/${id}/toggle-status`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      toast({
        title: 'Success',
        description: 'Payment type status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setFormData({
      name: paymentType.name,
      code: paymentType.code,
      description: paymentType.description || '',
      isActive: paymentType.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaymentType) {
      updateMutation.mutate({ id: selectedPaymentType.id, data: formData });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedPaymentType) {
      deleteMutation.mutate(selectedPaymentType.id);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Types</h1>
          <p className="text-gray-600 mt-1">Manage payment categories for invoices</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Type
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableCaption>List of all payment types in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentTypes?.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{type.code}</code>
                </TableCell>
                <TableCell className="max-w-xs truncate">{type.description || '-'}</TableCell>
                <TableCell>
                  {type.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>{type._count.invoices}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleStatus(type.id)}
                      title={type.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {type.isActive ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(type)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(type)}
                      disabled={type._count.invoices > 0}
                      title={type._count.invoices > 0 ? 'Cannot delete: used in invoices' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paymentTypes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No payment types found. Click &quot;Add Payment Type&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitCreate}>
            <DialogHeader>
              <DialogTitle>Create Payment Type</DialogTitle>
              <DialogDescription>
                Add a new payment category for creating invoices
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., School Fee"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  placeholder="e.g., SCHOOL_FEE"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Unique identifier (uppercase, underscores for spaces)</p>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this payment type"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>Edit Payment Type</DialogTitle>
              <DialogDescription>
                Update payment type information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment type &quot;{selectedPaymentType?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
