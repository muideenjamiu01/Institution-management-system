import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'REGISTERED' | 'WITHDRAWN' | 'DROPPED';
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Approved',
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <XCircle className="h-3 w-3" />,
          label: 'Rejected',
        };
      case 'RETURNED':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: <RefreshCw className="h-3 w-3" />,
          label: 'Returned',
        };
      case 'PENDING':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Clock className="h-3 w-3" />,
          label: 'Pending',
        };
      case 'REGISTERED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Registered',
        };
      case 'WITHDRAWN':
      case 'DROPPED':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <XCircle className="h-3 w-3" />,
          label: 'Withdrawn',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Clock className="h-3 w-3" />,
          label: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.color} flex items-center gap-1 w-fit ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
