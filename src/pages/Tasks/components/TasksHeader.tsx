
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, BarChart2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';

interface TasksHeaderProps {
  onAddInstance: () => void;
  showingDetails?: boolean;
  onToggleView?: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({ 
  onAddInstance, 
  showingDetails = false, 
  onToggleView 
}) => {
  const { t } = useLanguage();
  
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <Link to="/dashboard" className="flex items-center text-muted-foreground mb-2 hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("Retour au tableau de bord", "Back to dashboard")}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("Gestion des instances", "Instance Management")}</h1>
        <p className="text-muted-foreground">{t("Gérez les tâches, inspections et événements", "Manage tasks, inspections and events")}</p>
      </div>
      <div className="flex items-center space-x-2 mt-4 md:mt-0">
        {onToggleView && (
          <Button variant="outline" onClick={onToggleView} className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            {showingDetails 
              ? t("Voir résumé", "Show summary")
              : t("Voir détails", "Show details")
            }
          </Button>
        )}
        <Button className="bg-primary hover:bg-primary/90" onClick={onAddInstance}>
          <Plus className="mr-2 h-4 w-4" />
          {t("Nouvelle instance", "New instance")}
        </Button>
      </div>
    </header>
  );
};

export default TasksHeader;
