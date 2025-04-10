
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface InstanceStatusBadgeProps {
  status: 'pending' | 'completed';
}

const InstanceStatusBadge: React.FC<InstanceStatusBadgeProps> = ({ status }) => {
  if (status === 'completed') {
    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <Check className="mr-1 h-3 w-3" /> Terminée
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-amber-500 border-amber-500">
      <Clock className="mr-1 h-3 w-3" /> En cours
    </Badge>
  );
};

export default InstanceStatusBadge;
