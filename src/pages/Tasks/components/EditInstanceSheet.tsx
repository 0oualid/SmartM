
import React, { useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instance } from '@/utils/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditInstanceSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  instanceToEdit: Instance | null;
  onInstanceChange: (instance: Instance | null) => void;
  onUpdate: () => void;
}

const EditInstanceSheet: React.FC<EditInstanceSheetProps> = ({
  isOpen,
  onOpenChange,
  instanceToEdit,
  onInstanceChange,
  onUpdate
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(isOpen);
  
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange(newOpen);
  };
  
  const FormContent = () => (
    <div className="py-4 space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Titre</label>
        <Input 
          id="title" 
          value={instanceToEdit?.title || ''} 
          onChange={(e) => onInstanceChange(instanceToEdit ? {...instanceToEdit, title: e.target.value} : null)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="assignee" className="text-sm font-medium">Assigné à</label>
        <Input 
          id="assignee" 
          value={instanceToEdit?.assignee || ''} 
          onChange={(e) => onInstanceChange(instanceToEdit ? {...instanceToEdit, assignee: e.target.value} : null)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium">Date d'échéance</label>
        <Input 
          id="dueDate" 
          type="date" 
          value={instanceToEdit?.dueDate || ''} 
          onChange={(e) => onInstanceChange(instanceToEdit ? {...instanceToEdit, dueDate: e.target.value} : null)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="reference" className="text-sm font-medium">Référence (optionnel)</label>
        <Input 
          id="reference" 
          value={instanceToEdit?.reference || ''} 
          onChange={(e) => onInstanceChange(instanceToEdit ? {...instanceToEdit, reference: e.target.value} : null)}
        />
      </div>
    </div>
  );
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Modifier l'instance</DrawerTitle>
            <DrawerDescription>
              Apportez des modifications aux informations de l'instance.
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4">
            <FormContent />
          </div>
          
          <DrawerFooter>
            <Button className="w-full" onClick={onUpdate}>Sauvegarder</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Modifier l'instance</SheetTitle>
          <SheetDescription>
            Apportez des modifications aux informations de l'instance.
          </SheetDescription>
        </SheetHeader>
        
        <FormContent />
        
        <SheetFooter>
          <Button type="submit" onClick={onUpdate}>Sauvegarder les modifications</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditInstanceSheet;
