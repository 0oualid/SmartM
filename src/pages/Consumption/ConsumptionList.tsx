
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
import { Plus, Search, Edit, Trash, DollarSign, SortAsc, SortDesc, FileDown, BarChart } from 'lucide-react';
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

// Type pour une facture
interface Consumption {
  id: number;
  invoiceId: string;
  amount: number;
  date: string;
  description?: string;
}

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ConsumptionList = () => {
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<Consumption | null>(null);
  const [newConsumption, setNewConsumption] = useState<Omit<Consumption, 'id'>>({
    invoiceId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'details' | 'summary'>('summary');
  const { toast } = useToast();
  const { t } = useLanguage();

  // Charger les factures depuis le localStorage
  useEffect(() => {
    try {
      const storedConsumptions = localStorage.getItem('consumptions');
      if (storedConsumptions) {
        setConsumptions(JSON.parse(storedConsumptions));
      } else {
        const initialConsumptions: Consumption[] = [
          { id: 1, invoiceId: 'INV-001', amount: 2500, date: '2023-10-01', description: t('Fournitures de bureau', 'Office supplies') },
          { id: 2, invoiceId: 'INV-002', amount: 1800, date: '2023-10-05', description: t('Maintenance équipements', 'Equipment maintenance') },
          { id: 3, invoiceId: 'INV-003', amount: 3200, date: '2023-10-12', description: t('Services externes', 'External services') },
          { id: 4, invoiceId: 'INV-004', amount: 950, date: '2023-10-18', description: t('Petit matériel', 'Small equipment') },
          { id: 5, invoiceId: 'INV-005', amount: 1200, date: '2023-10-25', description: t('Formation personnel', 'Staff training') },
        ];
        setConsumptions(initialConsumptions);
        localStorage.setItem('consumptions', JSON.stringify(initialConsumptions));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
    }
  }, [t]);

  // Sauvegarder les factures dans le localStorage
  useEffect(() => {
    localStorage.setItem('consumptions', JSON.stringify(consumptions));
  }, [consumptions]);

  // Fonction pour trier les factures
  const sortConsumptions = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Filtrer et trier les factures
  const filteredConsumptions = consumptions
    .filter(consumption => 
      (consumption.description?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      consumption.date.includes(searchQuery) ||
      consumption.amount.toString().includes(searchQuery)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id - b.id;
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'description') {
        comparison = (a.description || '').localeCompare(b.description || '');
      } else if (sortField === 'invoiceId') {
        comparison = (a.invoiceId || '').localeCompare(b.invoiceId || '');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Préparer les données pour le graphique linéaire
  const lineChartData = [...consumptions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: formatDate(item.date),
      montant: item.amount
    }));

  // Préparer les données pour le graphique circulaire (regroupement par mois)
  const pieChartData = consumptions.reduce((acc: any[], curr) => {
    const date = new Date(curr.date);
    const month = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    const existingMonth = acc.find(item => item.name === month);
    if (existingMonth) {
      existingMonth.value += curr.amount;
    } else {
      acc.push({ name: month, value: curr.amount });
    }
    
    return acc;
  }, []);

  // Gérer l'ajout ou la modification d'une facture
  const handleSaveConsumption = () => {
    if (editingConsumption) {
      setConsumptions(consumptions.map(cons => 
        cons.id === editingConsumption.id 
          ? { ...cons, ...newConsumption, id: cons.id } 
          : cons
      ));
      toast({
        title: t("Facture modifiée", "Invoice updated"),
        description: t(`La facture du ${formatDate(newConsumption.date)} a été mise à jour avec succès.`, 
                     `The invoice from ${formatDate(newConsumption.date)} has been successfully updated.`),
      });
    } else {
      const id = consumptions.length ? Math.max(...consumptions.map(cons => cons.id)) + 1 : 1;
      setConsumptions([...consumptions, { id, ...newConsumption }]);
      toast({
        title: t("Facture ajoutée", "Invoice added"),
        description: t(`La facture du ${formatDate(newConsumption.date)} a été ajoutée avec succès.`, 
                     `The invoice from ${formatDate(newConsumption.date)} has been successfully added.`),
      });
    }
    
    setDialogOpen(false);
    setEditingConsumption(null);
    setNewConsumption({
      invoiceId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  // Gérer la suppression d'une facture
  const handleDeleteConsumption = (id: number) => {
    const consumptionToDelete = consumptions.find(cons => cons.id === id);
    setConsumptions(consumptions.filter(cons => cons.id !== id));
    toast({
      title: t("Facture supprimée", "Invoice deleted"),
      description: t(`La facture du ${consumptionToDelete ? formatDate(consumptionToDelete.date) : ''} a été supprimée de la liste.`,
                   `The invoice from ${consumptionToDelete ? formatDate(consumptionToDelete.date) : ''} has been removed from the list.`),
    });
  };

  // Ouvrir le dialogue pour éditer une facture
  const openEditDialog = (consumption: Consumption) => {
    setEditingConsumption(consumption);
    setNewConsumption({
      invoiceId: consumption.invoiceId,
      amount: consumption.amount,
      date: consumption.date,
      description: consumption.description || ''
    });
    setDialogOpen(true);
  };

  // Fonction pour basculer entre les vues détails et résumé
  const toggleViewMode = (mode: 'details' | 'summary') => {
    setViewMode(mode);
  };

  // Calculer les dépenses par mois pour l'année en cours
  const getCurrentYearMonthlyConsumption = () => {
    const currentYear = new Date().getFullYear();
    const monthlyData: { [key: number]: number } = {};
    
    // Initialiser tous les mois à 0
    for (let i = 0; i < 12; i++) {
      monthlyData[i] = 0;
    }
    
    // Ajouter les montants pour chaque mois
    consumptions.forEach(consumption => {
      const date = new Date(consumption.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        monthlyData[month] += consumption.amount;
      }
    });
    
    // Convertir en format pour le graphique
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month: new Date(currentYear, parseInt(month)).toLocaleDateString('fr-FR', { month: 'short' }),
      amount
    }));
  };

  // Calculer les statistiques financières pour le résumé
  const getFinanceStats = () => {
    const totalExpense = consumptions.reduce((sum, item) => sum + item.amount, 0);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonthExpense = consumptions.reduce((sum, item) => {
      const itemDate = new Date(item.date);
      if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
        return sum + item.amount;
      }
      return sum;
    }, 0);
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthExpense = consumptions.reduce((sum, item) => {
      const itemDate = new Date(item.date);
      if (itemDate.getMonth() === previousMonth && itemDate.getFullYear() === previousMonthYear) {
        return sum + item.amount;
      }
      return sum;
    }, 0);
    
    const averageExpense = totalExpense / (consumptions.length || 1);
    
    const maxExpense = consumptions.length > 0 ? Math.max(...consumptions.map(c => c.amount)) : 0;
    
    let monthlyTrend = 0;
    if (previousMonthExpense > 0) {
      monthlyTrend = ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100;
    }
    
    return {
      totalExpense,
      currentMonthExpense,
      averageExpense,
      maxExpense,
      monthlyTrend
    };
  };
  
  const stats = getFinanceStats();

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Gestion des Finances", "Finance Management")}</h1>
          <p className="text-muted-foreground">{t("Suivi des dépenses et finances", "Expense and finance tracking")}</p>
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
                {t("Détails", "Details")}
              </Button>
              
              <Button
                variant={viewMode === 'summary' ? 'default' : 'outline'}
                onClick={() => toggleViewMode('summary')}
                className="px-3"
              >
                <BarChart className="h-4 w-4 mr-2" />
                {t("Résumé", "Summary")}
              </Button>
            </div>

            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingConsumption(null);
                  setNewConsumption({
                    invoiceId: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Ajouter une facture", "Add an invoice")}
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingConsumption 
                  ? t('Modifier une facture', 'Edit an invoice') 
                  : t('Ajouter une nouvelle facture', 'Add a new invoice')}
              </DialogTitle>
              <DialogDescription>
                {t("Complétez les informations de la facture ci-dessous.", "Complete the invoice information below.")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="invoiceId">{t("ID Facture", "Invoice ID")}</label>
                <Input
                  id="invoiceId"
                  value={newConsumption.invoiceId}
                  onChange={(e) => setNewConsumption({ ...newConsumption, invoiceId: e.target.value })}
                  placeholder={t("Numéro de facture", "Invoice number")}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="amount">{t("Montant (DHS)", "Amount (DHS)")}</label>
                <Input
                  id="amount"
                  type="number"
                  value={newConsumption.amount}
                  onChange={(e) => setNewConsumption({ 
                    ...newConsumption, 
                    amount: parseFloat(e.target.value) || 0 
                  })}
                  placeholder={t("Montant", "Amount")}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date">{t("Date", "Date")}</label>
                <Input
                  id="date"
                  type="date"
                  value={newConsumption.date}
                  onChange={(e) => setNewConsumption({ ...newConsumption, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description">{t("Description (optionnel)", "Description (optional)")}</label>
                <Input
                  id="description"
                  value={newConsumption.description}
                  onChange={(e) => setNewConsumption({ ...newConsumption, description: e.target.value })}
                  placeholder={t("Description de la facture", "Invoice description")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("Annuler", "Cancel")}
              </Button>
              <Button onClick={handleSaveConsumption}>
                {editingConsumption ? t('Mettre à jour', 'Update') : t('Ajouter', 'Add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {viewMode === 'summary' ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("Total des dépenses", "Total expenses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalExpense.toLocaleString('fr-FR')} DHS</div>
                <p className="text-xs text-muted-foreground">{t("Toutes factures confondues", "All invoices combined")}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("Mois en cours", "Current month")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentMonthExpense.toLocaleString('fr-FR')} DHS</div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyTrend > 0 ? 
                    <span className="text-red-500">↑ +{stats.monthlyTrend.toFixed(1)}%</span> : 
                    <span className="text-green-500">↓ {stats.monthlyTrend.toFixed(1)}%</span>
                  } {t("vs mois précédent", "vs previous month")}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("Moyenne par facture", "Average per invoice")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageExpense.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} DHS</div>
                <p className="text-xs text-muted-foreground">{t("Basé sur", "Based on")} {consumptions.length} {t("factures", "invoices")}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("Facture maximale", "Maximum invoice")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.maxExpense.toLocaleString('fr-FR')} DHS</div>
                <p className="text-xs text-muted-foreground">{t("Plus grande facture enregistrée", "Largest recorded invoice")}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("Évolution mensuelle", "Monthly evolution")}</CardTitle>
                <CardDescription>{t("Dépenses par mois pour l'année en cours", "Expenses by month for the current year")}</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={getCurrentYearMonthlyConsumption()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#33C3F0" name={t("Montant (DHS)", "Amount (DHS)")} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("Répartition par période", "Distribution by period")}</CardTitle>
                <CardDescription>{t("Distribution des dépenses", "Expense distribution")}</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} DHS`, t('Montant', 'Amount')]} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Évolution des finances", "Financial evolution")}</CardTitle>
                <CardDescription>
                  {t("Tendance des dépenses au fil du temps", "Expense trends over time")}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="montant" 
                        stroke="#33C3F0" 
                        activeDot={{ r: 8 }} 
                        name={t("Montant (DHS)", "Amount (DHS)")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("Résumé des finances", "Financial summary")}</CardTitle>
                <CardDescription>
                  {t("Vue d'ensemble des dépenses", "Expense overview")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-secondary/50 p-6 rounded-lg flex flex-col items-center justify-center">
                    <DollarSign className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-3xl font-bold">{stats.totalExpense.toLocaleString('fr-FR')} DHS</span>
                    <span className="text-sm text-muted-foreground">{t("Total des factures", "Total invoices")}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xl font-bold">
                        {consumptions.length > 0 
                          ? Math.max(...consumptions.map(c => c.amount)).toLocaleString('fr-FR') 
                          : 0} DHS
                      </span>
                      <span className="text-xs text-muted-foreground text-center">{t("Facture max", "Max invoice")}</span>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xl font-bold">
                        {(stats.totalExpense / (consumptions.length || 1)).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DHS
                      </span>
                      <span className="text-xs text-muted-foreground text-center">{t("Facture moyenne", "Average invoice")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle>{t("Liste des factures", "Invoice list")}</CardTitle>
                  <CardDescription>
                    {filteredConsumptions.length} {t("factures trouvées", "invoices found")}
                  </CardDescription>
                </div>
                <div className="w-full md:w-1/3 mt-4 md:mt-0 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("Rechercher une facture...", "Search for an invoice...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>{t("Liste des factures enregistrées", "List of registered invoices")}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center space-x-1 cursor-pointer" 
                           onClick={() => sortConsumptions('id', sortField === 'id' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                        {t("NR", "NR")}
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1 cursor-pointer" 
                           onClick={() => sortConsumptions('invoiceId', sortField === 'invoiceId' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                        {t("ID Facture", "Invoice ID")}
                        {sortField === 'invoiceId' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1 cursor-pointer" 
                           onClick={() => sortConsumptions('date', sortField === 'date' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                        {t("Date", "Date")}
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1 cursor-pointer" 
                           onClick={() => sortConsumptions('amount', sortField === 'amount' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                        {t("Montant (DHS)", "Amount (DHS)")}
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1 cursor-pointer" 
                           onClick={() => sortConsumptions('description', sortField === 'description' && sortDirection === 'asc' ? 'desc' : 'asc')}>
                        {t("Description", "Description")}
                        {sortField === 'description' && (
                          sortDirection === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">{t("Actions", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsumptions.length > 0 ? (
                    filteredConsumptions.map((consumption) => (
                      <TableRow key={consumption.id}>
                        <TableCell>{consumption.id}</TableCell>
                        <TableCell>{consumption.invoiceId || '-'}</TableCell>
                        <TableCell>{formatDate(consumption.date)}</TableCell>
                        <TableCell className="font-medium">{consumption.amount.toLocaleString('fr-FR')} DHS</TableCell>
                        <TableCell>{consumption.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditDialog(consumption)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteConsumption(consumption.id)}
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
                        {t("Aucune facture trouvée", "No invoice found")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ConsumptionList;
