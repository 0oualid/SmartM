import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Users, 
  UserCheck, 
  UserX, 
  LayoutList, 
  LayoutDashboard, 
  UserPlus, 
  CalendarDays 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { isWithinHours, notifyPersonnelReturn } from "@/utils/notificationUtils";
import { 
  PersonnelAbsence, 
  Personnel,
  getPersonnelAbsences,
  getActivePersonnelAbsences, 
  savePersonnelAbsences,
  getTotalPersonnel,
  saveTotalPersonnel,
  markPersonnelAsRejoined
} from "@/utils/localStorageService";
import { 
  getAllPersonnel,
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
  calculateAbsenceDays,
  calculateAnnualLeaveDays
} from "@/services/personnelService";

const ABSENCE_REASONS = ["Congé", "Formation", "Maladie", "Mission"];

const PersonnelList = () => {
  const [absences, setAbsences] = useState<PersonnelAbsence[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [personnelDialogOpen, setPersonnelDialogOpen] = useState(false);
  const [personnelFormOpen, setPersonnelFormOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<PersonnelAbsence | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [newAbsence, setNewAbsence] = useState<Omit<PersonnelAbsence, 'id'>>({
    personnelId: 0,
    personnelName: '',
    label: '',
    reason: '',
    startDate: '',
    endDate: '',
  });
  const [newPersonnel, setNewPersonnel] = useState<Omit<Personnel, 'id' | 'createdAt' | 'absenceDays'>>({
    name: '',
  });
  const [totalPersonnel, setTotalPersonnel] = useState<number>(50);
  const [activeTab, setActiveTab] = useState("summary");
  const [personnelTab, setPersonnelTab] = useState("absences");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const { toast } = useToast();

  const yearOptions = Array.from({ length: 31 }, (_, i) => (2020 + i).toString());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAbsences(getPersonnelAbsences());
    setTotalPersonnel(getTotalPersonnel());
    setPersonnel(getAllPersonnel());
  };

  useEffect(() => {
    absences.forEach(absence => {
      if (!absence.rejoined && isWithinHours(absence.endDate, 48)) {
        notifyPersonnelReturn(absence.reason, absence.endDate);
      }
    });
  }, [absences]);

  const filteredAbsences = absences
    .filter(absence => 
      (showArchived ? absence.rejoined : !absence.rejoined) &&
      ((absence.personnelName && absence.personnelName.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (absence.reason && absence.reason.toLowerCase().includes(searchQuery.toLowerCase())))
    );

  const filteredPersonnel = personnel
    .filter(person => 
      person && person.name && person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSaveAbsence = () => {
    if (!newAbsence.personnelId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé",
        variant: "destructive",
      });
      return;
    }

    if (!newAbsence.reason) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un motif",
        variant: "destructive",
      });
      return;
    }

    const selectedPerson = personnel.find(p => p.id === newAbsence.personnelId);
    if (!selectedPerson) {
      toast({
        title: "Erreur",
        description: "Employé non trouvé",
        variant: "destructive",
      });
      return;
    }

    if (editingAbsence) {
      const updatedAbsences = absences.map(abs => 
        abs.id === editingAbsence.id 
          ? { 
              ...abs, 
              ...newAbsence, 
              id: abs.id,
              personnelName: selectedPerson.name
            } 
          : abs
      );
      setAbsences(updatedAbsences);
      savePersonnelAbsences(updatedAbsences);
      
      toast({
        title: "Indisponibilité modifiée",
        description: `L'indisponibilité de "${selectedPerson.name}" a été mise à jour avec succès.`,
      });
    } else {
      const id = absences.length ? Math.max(...absences.map(abs => abs.id)) + 1 : 1;
      const updatedAbsences = [...absences, { 
        id, 
        ...newAbsence,
        personnelName: selectedPerson.name,
        rejoined: false,
        notified: false
      }];
      setAbsences(updatedAbsences);
      savePersonnelAbsences(updatedAbsences);
      
      toast({
        title: "Indisponibilité ajoutée",
        description: `L'indisponibilité pour "${selectedPerson.name}" a été ajoutée avec succès.`,
      });
    }
    
    setDialogOpen(false);
    setEditingAbsence(null);
    setNewAbsence({ 
      personnelId: 0, 
      personnelName: '', 
      label: '', 
      reason: '', 
      startDate: '', 
      endDate: '' 
    });
    
    loadData();
  };

  const handleSavePersonnel = () => {
    try {
      if (editingPersonnel) {
        updatePersonnel({
          ...editingPersonnel,
          name: newPersonnel.name
        });
        
        const updatedPersonnel = personnel.map(p => 
          p.id === editingPersonnel.id 
            ? { ...p, ...newPersonnel } 
            : p
        );
        
        setPersonnel(updatedPersonnel);
        
        toast({
          title: "Personnel modifié",
          description: `Les informations de "${newPersonnel.name}" ont été mises à jour avec succès.`,
        });
      } else {
        const personnelToAdd = {
          ...newPersonnel,
          absenceDays: 0
        };
        
        const newId = addPersonnel(personnelToAdd);
        
        if (newId > 0) {
          const newPersonnelWithId: Personnel = {
            id: newId,
            name: newPersonnel.name,
            absenceDays: 0,
            createdAt: new Date().toISOString()
          };
          
          setPersonnel([...personnel, newPersonnelWithId]);
          
          toast({
            title: "Personnel ajouté",
            description: `"${newPersonnel.name}" a été ajouté à la liste du personnel avec succès.`,
          });
        } else {
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'ajout du personnel.",
            variant: "destructive",
          });
        }
      }
      
      setPersonnelFormOpen(false);
      setEditingPersonnel(null);
      setNewPersonnel({ name: '' });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du personnel:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des informations du personnel.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAbsence = (id: number) => {
    const absenceToDelete = absences.find(abs => abs.id === id);
    const updatedAbsences = absences.filter(abs => abs.id !== id);
    setAbsences(updatedAbsences);
    savePersonnelAbsences(updatedAbsences);
    
    toast({
      title: "Indisponibilité supprimée",
      description: `L'indisponibilité pour "${absenceToDelete?.personnelName}" a été supprimée de la liste.`,
    });
    
    loadData();
  };

  const handleDeletePersonnel = (id: number) => {
    try {
      const personToDelete = personnel.find(p => p.id === id);
      deletePersonnel(id);
      
      const updatedPersonnel = personnel.filter(p => p.id !== id);
      setPersonnel(updatedPersonnel);
      
      const updatedAbsences = absences.filter(abs => abs.personnelId !== id);
      setAbsences(updatedAbsences);
      savePersonnelAbsences(updatedAbsences);
      
      toast({
        title: "Personnel supprimé",
        description: `"${personToDelete?.name}" a été supprimé de la liste du personnel.`,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du personnel:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du personnel.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRejoined = (id: number) => {
    const absenceToMark = absences.find(abs => abs.id === id);
    markPersonnelAsRejoined(id);
    
    const updatedAbsences = absences.map(absence => 
      absence.id === id 
        ? { ...absence, rejoined: true, dateRejoined: new Date().toISOString().split('T')[0] } 
        : absence
    );
    
    setAbsences(updatedAbsences);
    
    toast({
      title: "Retour confirmé",
      description: `${absenceToMark?.personnelName} a rejoint son poste et a été archivé.`,
      variant: "success",
    });
    
    loadData();
  };

  const handleUnarchive = (id: number) => {
    const absenceToUnarchive = absences.find(abs => abs.id === id);
    
    const updatedAbsences = absences.map(absence => 
      absence.id === id 
        ? { ...absence, rejoined: false, dateRejoined: undefined } 
        : absence
    );
    
    setAbsences(updatedAbsences);
    savePersonnelAbsences(updatedAbsences);
    
    toast({
      title: "Désarchivage réussi",
      description: `${absenceToUnarchive?.personnelName} a été remis dans la liste des absences actives.`,
      variant: "success",
    });
    
    loadData();
  };

  const openEditDialog = (absence: PersonnelAbsence) => {
    setEditingAbsence(absence);
    setNewAbsence({
      personnelId: absence.personnelId,
      personnelName: absence.personnelName,
      label: absence.label,
      reason: absence.reason,
      startDate: absence.startDate,
      endDate: absence.endDate,
    });
    setDialogOpen(true);
  };

  const openEditPersonnelDialog = (person: Personnel) => {
    setEditingPersonnel(person);
    setNewPersonnel({
      name: person.name,
    });
    setPersonnelFormOpen(true);
  };

  const handleUpdateTotalPersonnel = () => {
    saveTotalPersonnel(totalPersonnel);
    toast({
      title: "Effectif mis à jour",
      description: `L'effectif total a été mis à jour à ${totalPersonnel} personnes.`,
    });
    setPersonnelDialogOpen(false);
  };

  const activeAbsences = absences.filter(absence => !absence.rejoined);
  const archivedAbsences = absences.filter(absence => absence.rejoined);

  const handlePersonnelChange = (value: string) => {
    const personnelId = parseInt(value, 10);
    const selectedPerson = personnel.find(p => p.id === personnelId);
    
    if (selectedPerson) {
      setNewAbsence({
        ...newAbsence,
        personnelId,
        personnelName: selectedPerson.name,
        label: selectedPerson.name
      });
    }
  };

  const calculatePersonnelLeaveForYear = (personnelId: number, year: string): number => {
    return calculateAnnualLeaveDays(personnelId, parseInt(year));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion du Personnel</h1>
          <p className="text-muted-foreground">Gérez votre effectif et les indisponibilités</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Dialog open={personnelDialogOpen} onOpenChange={setPersonnelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Effectif total: {totalPersonnel}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mettre à jour l'effectif total</DialogTitle>
                <DialogDescription>
                  Ajustez le nombre total de personnel dans votre unité.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="totalPersonnel">Nombre total de personnel</label>
                  <Input
                    id="totalPersonnel"
                    type="number"
                    value={totalPersonnel}
                    onChange={(e) => setTotalPersonnel(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPersonnelDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateTotalPersonnel}>
                  Mettre à jour
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingAbsence(null);
                  setNewAbsence({ 
                    personnelId: 0, 
                    personnelName: '', 
                    label: '', 
                    reason: '', 
                    startDate: '', 
                    endDate: '' 
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une indisponibilité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAbsence ? 'Modifier une indisponibilité' : 'Ajouter une nouvelle indisponibilité'}
                </DialogTitle>
                <DialogDescription>
                  Complétez les informations de l'indisponibilité ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="personnel">Employé</label>
                  <Select 
                    onValueChange={handlePersonnelChange}
                    value={newAbsence.personnelId.toString()}
                    disabled={!!editingAbsence}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {personnel.map((person) => (
                        <SelectItem key={person.id} value={person.id.toString()}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="reason">Motif</label>
                  <Select
                    value={newAbsence.reason}
                    onValueChange={(value) => setNewAbsence({ ...newAbsence, reason: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un motif" />
                    </SelectTrigger>
                    <SelectContent>
                      {ABSENCE_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate">Date de début</label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newAbsence.startDate}
                      onChange={(e) => setNewAbsence({ ...newAbsence, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endDate">Date de fin</label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newAbsence.endDate}
                      onChange={(e) => setNewAbsence({ ...newAbsence, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveAbsence}>
                  {editingAbsence ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={personnelFormOpen} onOpenChange={setPersonnelFormOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                onClick={() => {
                  setEditingPersonnel(null);
                  setNewPersonnel({ name: '' });
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un employé
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPersonnel ? 'Modifier un employé' : 'Ajouter un nouvel employé'}
                </DialogTitle>
                <DialogDescription>
                  Complétez les informations de l'employé ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name">Nom</label>
                  <Input
                    id="name"
                    value={newPersonnel.name}
                    onChange={(e) => setNewPersonnel({ ...newPersonnel, name: e.target.value })}
                    placeholder="Nom de l'employé"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPersonnelFormOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSavePersonnel}>
                  {editingPersonnel ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Tabs defaultValue="summary" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="summary" className="flex items-center justify-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Résumé
          </TabsTrigger>
          <TabsTrigger value="absences" className="flex items-center justify-center gap-2">
            <LayoutList className="h-4 w-4" />
            Détails
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Résumé du personnel</CardTitle>
              <CardDescription>
                Vue d'ensemble de l'effectif et des indisponibilités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{totalPersonnel}</span>
                  <span className="text-sm text-muted-foreground">Effectif total</span>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{activeAbsences.length}</span>
                  <span className="text-sm text-muted-foreground">Indisponibilités actuelles</span>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{personnel.length}</span>
                  <span className="text-sm text-muted-foreground">Employés enregistrés</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setActiveTab("absences")} className="flex items-center gap-2">
                  <LayoutList className="h-4 w-4" />
                  Voir les détails
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="absences">
          <Tabs defaultValue="absences" value={personnelTab} onValueChange={setPersonnelTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="absences" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Absences
              </TabsTrigger>
              <TabsTrigger value="personnel" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Liste du personnel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="absences">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle>Liste des indisponibilités</CardTitle>
                      <CardDescription>
                        {filteredAbsences.length} indisponibilités {showArchived ? "archivées" : "actives"} trouvées
                      </CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <div className="relative flex-1 md:w-60">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher une indisponibilité..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex-shrink-0"
                      >
                        {showArchived ? "Voir les absences actives" : "Voir les archives"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>
                      Liste des indisponibilités {showArchived ? "archivées" : "actives"}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Employé</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Date de début</TableHead>
                        <TableHead>Date de fin</TableHead>
                        {showArchived && <TableHead>Date de retour</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAbsences.length > 0 ? (
                        filteredAbsences.map((absence) => (
                          <TableRow key={absence.id}>
                            <TableCell>{absence.id}</TableCell>
                            <TableCell className="font-medium">{absence.personnelName}</TableCell>
                            <TableCell>{absence.reason}</TableCell>
                            <TableCell>{absence.startDate}</TableCell>
                            <TableCell>{absence.endDate}</TableCell>
                            {showArchived && <TableCell>{absence.dateRejoined || '-'}</TableCell>}
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {!showArchived && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
                                    onClick={() => handleMarkAsRejoined(absence.id)}
                                    title="Marquer comme rejoint"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                {showArchived && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
                                    onClick={() => handleUnarchive(absence.id)}
                                    title="Désarchiver"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}
                                {!showArchived && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openEditDialog(absence)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteAbsence(absence.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={showArchived ? 7 : 6} className="text-center">
                            Aucune indisponibilité {showArchived ? "archivée" : "active"} trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personnel">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle>Liste du personnel</CardTitle>
                      <CardDescription>
                        {filteredPersonnel.length} employés enregistrés
                      </CardDescription>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <div className="relative flex-1 md:w-60">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un employé..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>
                      Liste des employés enregistrés
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Jours de congé {selectedYear}</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPersonnel.length > 0 ? (
                        filteredPersonnel.map((person) => (
                          <TableRow key={person.id}>
                            <TableCell>{person.id}</TableCell>
                            <TableCell className="font-medium">{person.name}</TableCell>
                            <TableCell>{calculatePersonnelLeaveForYear(person.id, selectedYear)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditPersonnelDialog(person)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeletePersonnel(person.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Aucun employé trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonnelList;
