
import React from 'react';
import { CalendarDays } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Instance } from '@/utils/types';
import InstanceStatusBadge from './InstanceStatusBadge';
import CategoryBadge from './CategoryBadge';
import InstanceActions from './InstanceActions';

interface InstancesTableProps {
  instances: Instance[];
  onStatusChange: (id: number, status: 'pending' | 'completed') => void;
  onEdit: (instance: Instance) => void;
  onDelete: (id: number) => void;
}

const InstancesTable: React.FC<InstancesTableProps> = ({ 
  instances, 
  onStatusChange, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="border-t">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">#</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Assigné à</TableHead>
            <TableHead>Échéance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instances.length > 0 ? (
            instances.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell className="font-medium">{instance.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{instance.title}</div>
                  {instance.reference && (
                    <div className="text-xs text-muted-foreground">
                      Ref: {instance.reference}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={instance.category} />
                </TableCell>
                <TableCell>{instance.assignee}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(instance.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                </TableCell>
                <TableCell>
                  <InstanceStatusBadge status={instance.status} />
                </TableCell>
                <TableCell className="text-right">
                  <InstanceActions 
                    instance={instance}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Aucune instance trouvée avec ces critères.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InstancesTable;
