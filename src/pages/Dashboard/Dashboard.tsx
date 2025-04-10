
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { 
  Cpu, 
  Users, 
  DollarSign, 
  CheckSquare,
  FileDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  calculateTotalOperability, 
  getPersonnelAbsences, 
  getInstances,
  getTotalPersonnel
} from '@/utils/localStorageService';
import { 
  checkPersonnelReturnNotifications, 
  checkTaskNotifications,
  notifyLowTotalOperability,
  requestNotificationPermission 
} from '@/utils/notificationUtils';
import { useAuth } from '@/hooks/useAuth';
import { getStorage } from '@/utils/sqliteStorage';

const storage = getStorage();

// Fonction pour récupérer les données financières du stockage local
const getFinanceData = () => {
  try {
    // Récupérer les données du stockage local
    const consumptionsData = storage.getItem('consumptions');
    const consumptions = consumptionsData ? JSON.parse(consumptionsData) : [];
    
    // Si aucune donnée de facturation n'existe, utiliser des données simulées
    if (!consumptions || consumptions.length === 0) {
      return {
        totalAmount: 0,
        currentMonthAmount: 0
      };
    }
    
    // Calculer le montant total
    const totalAmount = consumptions.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
    
    // Calculer le montant du mois en cours
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthAmount = consumptions.reduce((sum: number, item: any) => {
      const itemDate = new Date(item.date);
      if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
        return sum + (parseFloat(item.amount) || 0);
      }
      return sum;
    }, 0);
    
    return {
      totalAmount,
      currentMonthAmount
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données financières:", error);
    return {
      totalAmount: 0,
      currentMonthAmount: 0
    };
  }
};

const Dashboard = () => {
  const [operabilityPercentage, setOperabilityPercentage] = useState(0);
  const [presentPersonnel, setPresentPersonnel] = useState(0);
  const [absentPersonnel, setAbsentPersonnel] = useState(0);
  const [pendingInstances, setPendingInstances] = useState(0);
  const [lateInstances, setLateInstances] = useState(0);
  const [financeData, setFinanceData] = useState({ totalAmount: 0, currentMonthAmount: 0 });
  const { user } = useAuth();
  
  useEffect(() => {
    // Demander la permission pour les notifications
    requestNotificationPermission();
    
    // Charger les données
    loadDashboardData();
    
    // Vérifier les notifications
    checkPersonnelReturnNotifications();
    checkTaskNotifications();
    
    // Mettre à jour les données toutes les 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadDashboardData = () => {
    // Calculer l'opérabilité totale
    const operability = calculateTotalOperability();
    setOperabilityPercentage(operability);
    
    // Vérifier si l'opérabilité est inférieure à 50%
    if (operability < 50) {
      notifyLowTotalOperability(operability);
    }
    
    // Calculer le personnel présent/absent
    const absences = getPersonnelAbsences();
    const totalPersonnel = getTotalPersonnel();
    setAbsentPersonnel(absences.length);
    setPresentPersonnel(totalPersonnel - absences.length);
    
    // Calculer les instances
    const instances = getInstances();
    const today = new Date();
    
    // Instances en cours
    const pending = instances.filter(instance => instance.status === 'pending');
    setPendingInstances(pending.length);
    
    // Instances en retard
    const late = pending.filter(instance => {
      const dueDate = new Date(instance.dueDate);
      return dueDate < today;
    });
    setLateInstances(late.length);
    
    // Récupérer les données financières à jour
    const finance = getFinanceData();
    setFinanceData(finance);
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {user?.username || 'Utilisateur'}, Bienvenue sur votre espace de gestion SmartM
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/equipment">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Opérabilité</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operabilityPercentage}%</div>
              <p className="text-xs text-muted-foreground">des équipements sont opérationnels</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/personnel">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Personnel</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className="text-green-500">{presentPersonnel}</span> présents, 
                <span className="text-red-500 ml-1">{absentPersonnel}</span> absents
              </div>
              <p className="text-xs text-muted-foreground">statut du personnel</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/consumption">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Finance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financeData.currentMonthAmount.toLocaleString('fr-FR')} DHS</div>
              <p className="text-xs text-muted-foreground">pour le mois courant</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/tasks">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Instances</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className="text-orange-500">{pendingInstances}</span> en cours, 
                <span className="text-red-500 ml-1">{lateInstances}</span> en retard
              </div>
              <p className="text-xs text-muted-foreground">suivi des instances</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 flex justify-end">
        <Link to="/report">
          <Button className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Télécharger le rapport
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
