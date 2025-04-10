
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Instance, InstanceCategory } from '@/utils/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clipboard } from 'lucide-react';

// Define task form schema
const taskSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  category: z.enum(['task', 'inspection', 'event', 'reunion', 'rendezvous', 'audit', 'other'], {
    required_error: "Veuillez sélectionner une catégorie",
  }) as z.ZodType<InstanceCategory>,
  assignee: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  dueDate: z.string().min(1, { message: "La date d'échéance est requise" }),
  reference: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface DialogAddTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: (task: Omit<Instance, 'id'>) => void;
}

export function DialogAddTask({ open, onOpenChange, onTaskAdded }: DialogAddTaskProps) {
  // Initialize form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      category: 'task',
      assignee: '',
      dueDate: new Date().toISOString().split('T')[0],
      reference: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    // Create a new instance object with form data
    const newInstance: Omit<Instance, 'id'> = {
      title: data.title,
      category: data.category,
      assignee: data.assignee,
      dueDate: data.dueDate,
      status: 'pending',
      reference: data.reference,
    };

    // Call the callback with the new instance
    onTaskAdded(newInstance);
    
    // Reset the form and close the dialog
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clipboard className="mr-2 h-5 w-5" />
            Nouvelle instance
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle tâche, inspection ou événement dans le système.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'instance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="task">Tâche</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="reunion">Réunion</SelectItem>
                      <SelectItem value="rendezvous">Rendez-vous</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigné à</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la personne assignée" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'échéance</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro ou code de référence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
