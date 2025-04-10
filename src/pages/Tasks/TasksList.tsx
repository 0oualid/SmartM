import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DialogAddTask } from '@/components/Dialogs/DialogAddTask';
import { useToast } from "@/hooks/use-toast";
import { Instance } from '@/utils/types';
import { getInstances, addInstance, updateInstanceStatus } from '@/utils/localStorageService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import TasksHeader from './components/TasksHeader';
import SearchAndFilter from './components/SearchAndFilter';
import InstancesTable from './components/InstancesTable';
import EditInstanceSheet from './components/EditInstanceSheet';
import DeleteInstanceDialog from './components/DeleteInstanceDialog';
import InstancesSummary from './components/InstancesSummary';
import { useLanguage } from '@/contexts/LanguageContext';

const TasksList = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [instanceToDelete, setInstanceToDelete] = useState<number | null>(null);
  const [instanceToEdit, setInstanceToEdit] = useState<Instance | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    refreshInstances();
  }, []);

  const refreshInstances = () => {
    const loadedInstances = getInstances();
    setInstances(loadedInstances);
  };

  const handleAddInstance = (newInstance: Omit<Instance, 'id'>) => {
    addInstance(newInstance);
    refreshInstances();
    toast({
      title: t("Instance ajoutée", "Instance added"),
      description: t("L'instance a été ajoutée avec succès.", "The instance has been successfully added."),
    });
  };

  const handleStatusChange = (id: number, newStatus: 'pending' | 'completed') => {
    updateInstanceStatus(id, newStatus);
    refreshInstances();
    toast({
      title: newStatus === 'completed' 
        ? t("Instance terminée", "Instance completed") 
        : t("Instance en cours", "Instance pending"),
      description: t("Le statut de l'instance a été mis à jour.", "The instance status has been updated."),
    });
  };

  const handleEditInstance = (instance: Instance) => {
    setInstanceToEdit(instance);
    setIsEditSheetOpen(true);
  };

  const handleUpdateInstance = () => {
    if (instanceToEdit) {
      const updatedInstances = instances.map(instance => 
        instance.id === instanceToEdit.id ? instanceToEdit : instance
      );
      localStorage.setItem('smartm_instances', JSON.stringify(updatedInstances));
      refreshInstances();
      setIsEditSheetOpen(false);
      setInstanceToEdit(null);
      toast({
        title: t("Instance mise à jour", "Instance updated"),
        description: t("Les informations de l'instance ont été mises à jour.", "The instance information has been updated."),
      });
    }
  };

  const handleDeleteInstance = (id: number) => {
    setInstanceToDelete(id);
  };

  const confirmDeleteInstance = () => {
    if (instanceToDelete) {
      const updatedInstances = instances.filter(instance => instance.id !== instanceToDelete);
      localStorage.setItem('smartm_instances', JSON.stringify(updatedInstances));
      refreshInstances();
      toast({
        title: t("Instance supprimée", "Instance deleted"),
        description: t("L'instance a été supprimée avec succès.", "The instance has been successfully deleted."),
        variant: "destructive",
      });
      setInstanceToDelete(null);
    }
  };

  const toggleView = () => {
    setShowDetails(!showDetails);
  };

  const filteredInstances = instances
    .filter(instance => 
      instance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(instance => 
      selectedCategory === 'all' || instance.category === selectedCategory
    );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <TasksHeader 
        onAddInstance={() => setIsAddDialogOpen(true)} 
        showingDetails={showDetails}
        onToggleView={toggleView}
      />

      {!showDetails ? (
        <InstancesSummary 
          instances={instances} 
          onViewDetails={toggleView} 
        />
      ) : (
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle>{t("Toutes les instances", "All instances")}</CardTitle>
            <CardDescription>
              {t("Liste des tâches, inspections et événements enregistrés", 
                "List of registered tasks, inspections and events")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <SearchAndFilter 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <InstancesTable 
              instances={filteredInstances}
              onStatusChange={handleStatusChange}
              onEdit={handleEditInstance}
              onDelete={handleDeleteInstance}
            />
          </CardContent>
        </Card>
      )}

      <DialogAddTask
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTaskAdded={handleAddInstance}
      />

      <DeleteInstanceDialog 
        instanceIdToDelete={instanceToDelete}
        onOpenChange={() => setInstanceToDelete(null)}
        onConfirmDelete={confirmDeleteInstance}
      />

      <EditInstanceSheet 
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        instanceToEdit={instanceToEdit}
        onInstanceChange={setInstanceToEdit}
        onUpdate={handleUpdateInstance}
      />
    </div>
  );
};

export default TasksList;
