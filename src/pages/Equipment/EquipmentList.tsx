import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
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
import { Plus, Search, Edit, Trash, AlertTriangle, SortAsc, SortDesc, FileDown, BarChart, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { checkOperability, notifyLowTotalOperability } from '@/utils/notificationUtils';
import { Equipment, getEquipment, saveEquipment } from '@/utils/localStorageService';
import { calculateTotalOperability } from '@/utils/localStorageService';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mapping de statut pour l'affichage
const statusMap = {
  operational: { label: 'Opérationnel', color: 'bg-green-100 text-green-800' },
  maintenance: { label: 'En maintenance', color: 'bg-yellow-100 text-yellow-800' },
  outOfService: { label: 'Hors service', color: 'bg-red-100 text-red-800' },
};

const EquipmentList = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [newEquipment, setNewEquipment] = useState<Omit<Equipment, 'id'>>({
    name: '',
    service: '',
    status: 'operational',
    sensitivity: 3
  });
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'details' | 'summary'>('summary');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadedEquipment = getEquipment();
    setEquipments(loadedEquipment);
  }, []);

  const sortEquipments = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const filteredEquipments = equipments
    .filter(equipment => 
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.service.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id - b.id;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'service') {
        comparison = a.service.localeCompare(b.service);
      } else if (sortField === 'sensitivity') {
        comparison = a.sensitivity - b.sensitivity;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  useEffect(() => {
    const checkNotifications = () => {
      const totalOperability = calculateTotalOperability();
      if (totalOperability <= 50) {
        notifyLowTotalOperability(totalOperability);
      }
    };
    
    checkNotifications();
    
    saveEquipment(equipments);
    
    const interval = setInterval(checkNotifications, 4 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [equipments]);

  const handleSaveEquipment = () => {
    if (editingEquipment) {
      setEquipments(equipments.map(eq => 
        eq.id === editingEquipment.id 
          ? { ...eq, ...newEquipment, id: eq.id } 
          : eq
      ));
      toast({
        title: "Équipement modifié",
        description: `${newEquipment.name} a été mis à jour avec succès.`,
      });
    } else {
      const id = equipments.length ? Math.max(...equipments.map(eq => eq.id)) + 1 : 1;
      setEquipments([...equipments, { id, ...newEquipment }]);
      toast({
        title: "Équipement ajouté",
        description: `${newEquipment.name} a été ajouté avec succès.`,
      });
    }
    
    setDialogOpen(false);
    setEditingEquipment(null);
    setNewEquipment({ 
      name: '', 
      service: '', 
      status: 'operational', 
      sensitivity: 3 
    });
  };

  const handleDeleteEquipment = (id: number) => {
    const equipmentToDelete = equipments.find(eq => eq.id === id);
    setEquipments(equipments.filter(eq => eq.id !== id));
    toast({
      title: "Équipement supprimé",
      description: `${equipmentToDelete?.name} a été supprimé de la liste.`,
    });
  };

  const openEditDialog = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setNewEquipment({
      name: equipment.name,
      service: equipment.service,
      status: equipment.status,
      sensitivity: equipment.sensitivity
    });
    setDialogOpen(true);
  };

  const getEquipmentStats = () => {
    const totalCount = equipments.length;
    const operational = equipments.filter(eq => eq.status === 'operational').length;
    const maintenance = equipments.filter(eq => eq.status === 'maintenance').length;
    const outOfService = equipments.filter(eq => eq.status === 'outOfService').length;
    const operabilityPercentage = calculateTotalOperability();
    const averageSensitivity = equipments.length ? 
      equipments.reduce((sum, eq) => sum + eq.sensitivity, 0) / equipments.length : 0;

    return {
      totalCount,
      operational,
      maintenance,
      outOfService,
      operabilityPercentage,
      averageSensitivity: averageSensitivity.toFixed(1)
    };
  };

  const stats = getEquipmentStats();

  const toggleViewMode = (mode: 'details' | 'summary') => {
    setViewMode(mode);
  };

  const navigateToDetail = (id: number) => {
    navigate(`/equipment/${id}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Équipements</h1>
          <p className="text-muted-foreground">Gérez vos équipements et leur état</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'details' ? 'default' : 'outline'}
                onClick={() => toggleViewMode('details')}
                className="px-3"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Détails
              </Button>
              
              <Button
                variant={viewMode === 'summary' ? 'default' : 'outline'}
                onClick={() => toggleViewMode('summary')}
                className="px-3"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Résumé
              </Button>
            </div>
            
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingEquipment(null);
                  setNewEquipment({ 
                    name: '', 
                    service: '', 
                    status: 'operational', 
                    sensitivity: 3
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un équipement
              </Button>
            </DialogTrigger>
          </div>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? 'Modifier un équipement' : 'Ajouter un nouvel équipement'}
              </DialogTitle>
              <DialogDescription>
                Complétez les informations de l'équipement ci-dessous.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name">Nom de l'équipement</label>
                <Input
                  id="name"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  placeholder="Nom de l'équipement"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="service">Service</label>
                <Input
                  id="service"
                  value={newEquipment.service}
                  onChange={(e) => setNewEquipment({ ...newEquipment, service: e.target.value })}
                  placeholder="Service"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="sensitivity">Sensibilité (1-5)</label>
                <Input
                  id="sensitivity"
                  type="number"
                  min={1}
                  max={5}
                  value={newEquipment.sensitivity}
                  onChange={(e) => setNewEquipment({ 
                    ...newEquipment, 
                    sensitivity: Math.min(5, Math.max(1, parseInt(e.target.value) || 1))
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  1 = Peu sensible, 5 = Très sensible (impact sur l'opérabilité)
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="status">État</label>
                <select
                  id="status"
                  value={newEquipment.status}
                  onChange={(e) => setNewEquipment({ 
                    ...newEquipment, 
                    status: e.target.value as 'operational' | 'maintenance' | 'outOfService' 
                  })}
                  className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                >
                  <option value="operational">Opérationnel</option>
                  <option value="maintenance">En maintenance</option>
                  <option value="outOfService">Hors service</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEquipment}>
                {editingEquipment ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {viewMode === 'summary' ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>État des équipements</CardTitle>
              <CardDescription>Répartition des équipements par état</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Opérationnels</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-green-500 rounded-full" style={{ width: `${stats.operational / stats.totalCount * 100}%`, minWidth: '20px' }}></div>
                    <span>{stats.operational} / {stats.totalCount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>En maintenance</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-yellow-500 rounded-full" style={{ width: `${stats.maintenance / stats.totalCount * 100}%`, minWidth: '20px' }}></div>
                    <span>{stats.maintenance} / {stats.totalCount}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hors service</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-red-500 rounded-full" style={{ width: `${stats.outOfService / stats.totalCount * 100}%`, minWidth: '20px' }}></div>
                    <span>{stats.outOfService} / {stats.totalCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Statistiques générales</CardTitle>
              <CardDescription>Vue d'ensemble des équipements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{stats.operabilityPercentage}%</span>
                    <p className="text-sm text-muted-foreground">Opérabilité totale</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                    <span className="text-xl font-bold">{stats.totalCount}</span>
                    <p className="text-xs text-muted-foreground">Équipements</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                    <span className="text-xl font-bold">{stats.averageSensitivity}</span>
                    <p className="text-xs text-muted-foreground">Sensibilité moyenne</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle>Liste des équipements</CardTitle>
                <CardDescription>
                  {filteredEquipments.length} équipements trouvés
                </CardDescription>
              </div>
              <div className="w-full md:w-1/3 mt-4 md:mt-0 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un équipement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Liste des équipements enregistrés</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" 
                         onClick={() => sortEquipments('id', sortField === 'id' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                      ID
                      {sortField === 'id' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" 
                         onClick={() => sortEquipments('name', sortField === 'name' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                      Nom
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" 
                         onClick={() => sortEquipments('service', sortField === 'service' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                      Service
                      {sortField === 'service' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" 
                         onClick={() => sortEquipments('sensitivity', sortField === 'sensitivity' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                      Sensibilité
                      {sortField === 'sensitivity' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1 cursor-pointer" 
                         onClick={() => sortEquipments('status', sortField === 'status' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                      État
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.length > 0 ? (
                  filteredEquipments.map((equipment) => (
                    <TableRow key={equipment.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigateToDetail(equipment.id)}>
                      <TableCell>{equipment.id}</TableCell>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>{equipment.service}</TableCell>
                      <TableCell>{equipment.sensitivity}/5</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${statusMap[equipment.status].color}`}>
                          {statusMap[equipment.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToDetail(equipment.id);
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(equipment);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEquipment(equipment.id);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Aucun équipement trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentList;
