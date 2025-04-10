
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteInstanceDialogProps {
  instanceIdToDelete: number | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteInstanceDialog: React.FC<DeleteInstanceDialogProps> = ({
  instanceIdToDelete,
  onOpenChange,
  onConfirmDelete
}) => {
  return (
    <AlertDialog 
      open={instanceIdToDelete !== null} 
      onOpenChange={() => onOpenChange(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette instance?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cette instance sera définitivement supprimée de la base de données.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete} 
            className="bg-destructive text-destructive-foreground"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteInstanceDialog;
