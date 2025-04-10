
import React from 'react';
import { Check, Clock, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Instance } from '@/utils/types';

interface InstanceActionsProps {
  instance: Instance;
  onStatusChange: (id: number, status: 'pending' | 'completed') => void;
  onEdit: (instance: Instance) => void;
  onDelete: (id: number) => void;
}

const InstanceActions: React.FC<InstanceActionsProps> = ({ 
  instance, 
  onStatusChange, 
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex justify-end items-center gap-2">
      {instance.status === 'pending' ? (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 text-green-600 border-green-600 hover:bg-green-50"
          onClick={() => onStatusChange(instance.id, 'completed')}
        >
          <Check className="mr-1 h-4 w-4" />
          Terminer
        </Button>
      ) : (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8"
          onClick={() => onStatusChange(instance.id, 'pending')}
        >
          <Clock className="mr-1 h-4 w-4" />
          Réouvrir
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(instance)}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(instance.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default InstanceActions;
