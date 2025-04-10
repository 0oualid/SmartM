import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Plus, Trash, FilePlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Equipment, getEquipment } from '@/utils/localStorageService';
import { generatePDF } from '@/utils/pdfUtils';
import { 
  EquipmentFailure, 
  getEquipmentFailures, 
  saveEquipmentFailure, 
  updateEquipmentFailure, 
  deleteEquipmentFailure,
  getFailureStatistics
} from '@/services/equipmentFailure/equipmentFailureService';

const statusMap = {
  operational: { label: 'Opérationnel', color: 'bg-green-100 text-green-800' },
  maintenance: { label: 'En maintenance', color: 'bg-yellow-100 text-yellow-800' },
  outOfService: { label: 'Hors service', color: 'bg-red-100 text-red-800' },
};

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const equipmentId = parseInt(id || '0');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [failures, setFailures] = useState<EquipmentFailure[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFailure, setCurrentFailure] = useState<EquipmentFailure>({
    equipment_id: equipmentId,
    failure_type: '',
    failure_date: new Date().toISOString().split('T')[0],
    component: '',
    reference: ''
  });
  
  useEffect(() => {
    const loadData = async () => {
      const equipments = window.localStorage.getItem('smartm_equipment');
      if (equipments) {
        const parsedEquipments: Equipment[] = JSON.parse(equipments);
        const foundEquipment = parsedEquipments.find(e => e.id === equipmentId);
        if (foundEquipment) {
          setEquipment(foundEquipment);
        } else {
          toast({
            title: "Erreur",
            description: "Équipement non trouvé",
            variant: "destructive"
          });
          navigate('/equipment');
        }
      }
      
      const equipmentFailures = getEquipmentFailures(equipmentId);
      setFailures(equipmentFailures);
    };
    
    loadData();
  }, [equipmentId, navigate, toast]);
  
  const handleSaveFailure = () => {
    if (!currentFailure.failure_type || !currentFailure.component) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && currentFailure.id) {
        updateEquipmentFailure(currentFailure);
        setFailures(failures.map(f => f.id === currentFailure.id ? currentFailure : f));
        toast({
          title: "Succès",
          description: "Avarie mise à jour avec succès"
        });
      } else {
        const newId = saveEquipmentFailure(currentFailure);
        if (newId) {
          const newFailure = { ...currentFailure, id: newId };
          setFailures([...failures, newFailure]);
          toast({
            title: "Succès",
            description: "Avarie ajoutée avec succès"
          });
        }
      }
      
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'avarie",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteFailure = (id: number) => {
    try {
      deleteEquipmentFailure(id);
      setFailures(failures.filter(f => f.id !== id));
      toast({
        title: "Succès",
        description: "Avarie supprimée avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avarie",
        variant: "destructive"
      });
    }
  };
  
  const handleEditFailure = (failure: EquipmentFailure) => {
    setCurrentFailure(failure);
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  const resetForm = () => {
    setCurrentFailure({
      equipment_id: equipmentId,
      failure_type: '',
      failure_date: new Date().toISOString().split('T')[0],
      component: '',
      reference: ''
    });
    setIsEditing(false);
    setDialogOpen(false);
  };
  
  const handleGenerateReport = () => {
    if (!equipment) return;
    
    try {
      const stats = getFailureStatistics(equipmentId);
      
      const reportData = {
        title: `Rapport d'avaries - ${equipment.name}`,
        equipmentDetails: {
          id: equipment.id,
          name: equipment.name,
          service: equipment.service,
          status: equipment.status,
          sensitivity: equipment.sensitivity
        },
        failures: failures.map(f => ({
          id: f.id,
          type: f.failure_type,
          date: new Date(f.failure_date).toLocaleDateString('fr-FR'),
          component: f.component,
          reference: f.reference || 'N/A'
        })),
        statistics: stats
      };
      
      const doc = generatePDF(reportData);
      doc.save(`rapport_avaries_${equipment.name.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "Succès",
        description: "Le rapport a été généré avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport PDF",
        variant: "destructive"
      });
    }
  };
  
  if (!equipment) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement des données...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex items-center space-x-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/equipment')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
          <p className="text-muted-foreground">Détails et historique des avaries</p>
        </div>
      </header>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="history">Historique d'avaries</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations sur l'équipement</CardTitle>
              <CardDescription>Détails et spécifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p>{equipment.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p>{equipment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service</p>
                  <p>{equipment.service}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sensibilité</p>
                  <p>{equipment.sensitivity}/5</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">État</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusMap[equipment.status as keyof typeof statusMap]?.color}`}>
                    {statusMap[equipment.status as keyof typeof statusMap]?.label || equipment.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Historique des avaries</CardTitle>
                <CardDescription>Liste des incidents et maintenances</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setIsEditing(false);
                    setCurrentFailure({
                      equipment_id: equipmentId,
                      failure_type: '',
                      failure_date: new Date().toISOString().split('T')[0],
                      component: '',
                      reference: ''
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une avarie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing ? 'Modifier une avarie' : 'Ajouter une nouvelle avarie'}
                    </DialogTitle>
                    <DialogDescription>
                      Complétez les informations de l'avarie ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="failure_type">Type d'avarie *</label>
                      <Input
                        id="failure_type"
                        value={currentFailure.failure_type}
                        onChange={(e) => setCurrentFailure({ ...currentFailure, failure_type: e.target.value })}
                        placeholder="Type d'avarie"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="failure_date">Date de l'avarie *</label>
                      <Input
                        id="failure_date"
                        type="date"
                        value={currentFailure.failure_date}
                        onChange={(e) => setCurrentFailure({ ...currentFailure, failure_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="component">Composante en avarie *</label>
                      <Input
                        id="component"
                        value={currentFailure.component}
                        onChange={(e) => setCurrentFailure({ ...currentFailure, component: e.target.value })}
                        placeholder="Composante"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="reference">Référence</label>
                      <Input
                        id="reference"
                        value={currentFailure.reference || ''}
                        onChange={(e) => setCurrentFailure({ ...currentFailure, reference: e.target.value })}
                        placeholder="Référence (optionnel)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveFailure}>
                      {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {failures.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Composante</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failures.map((failure) => (
                      <TableRow key={failure.id}>
                        <TableCell className="font-medium">{failure.failure_type}</TableCell>
                        <TableCell>{new Date(failure.failure_date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{failure.component}</TableCell>
                        <TableCell>{failure.reference || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditFailure(failure)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => failure.id && handleDeleteFailure(failure.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Aucune avarie enregistrée pour cet équipement.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Génération de rapports</CardTitle>
              <CardDescription>Générer des rapports PDF pour cet équipement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Rapport d'historique d'avaries</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Ce rapport contient toutes les avaries enregistrées pour cet équipement, ainsi que des statistiques sur les types d'avaries et les composantes concernées.
                </p>
                <Button onClick={handleGenerateReport}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Générer un rapport PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentDetail;
