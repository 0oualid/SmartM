
import React, { useMemo } from 'react';
import { Instance, InstanceCategory } from '@/utils/types';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translateTaskCategory } from '@/utils/taskUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstancesSummaryProps {
  instances: Instance[];
  onViewDetails: () => void;
}

const InstancesSummary: React.FC<InstancesSummaryProps> = ({ instances, onViewDetails }) => {
  const { t, language } = useLanguage();
  
  const stats = useMemo(() => {
    // Calculer les statistiques globales
    const completed = instances.filter(i => i.status === 'completed').length;
    const total = instances.length;
    const completionPercentage = total ? Math.round((completed / total) * 100) : 0;
    
    // Compter par catégorie
    const categoryStats: Record<string, { total: number; completed: number }> = {};
    
    instances.forEach(instance => {
      if (!categoryStats[instance.category]) {
        categoryStats[instance.category] = { total: 0, completed: 0 };
      }
      
      categoryStats[instance.category].total += 1;
      if (instance.status === 'completed') {
        categoryStats[instance.category].completed += 1;
      }
    });
    
    return {
      total,
      completed,
      completionPercentage,
      categoryStats
    };
  }, [instances]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-primary/10 shadow-md">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex justify-between items-center">
            <CardTitle>{t("Aperçu des instances", "Instance Overview")}</CardTitle>
            <Button 
              onClick={onViewDetails} 
              variant="ghost" 
              className="text-sm flex items-center hover:bg-primary/10"
            >
              {t("Voir détails", "View details")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t("Progression globale", "Overall Progress")}</h3>
                <span className="text-sm font-medium">{stats.completionPercentage}%</span>
              </div>
              <Progress 
                value={stats.completionPercentage}
                className="h-3"
                aria-label={t("Progression globale", "Overall Progress")}
              />
              <p className="text-sm text-muted-foreground">
                {t(
                  `${stats.completed} sur ${stats.total} instances complétées`,
                  `${stats.completed} out of ${stats.total} instances completed`
                )}
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("Par catégorie", "By Category")}</h3>
              {Object.entries(stats.categoryStats).map(([category, { total, completed }]) => {
                const percentage = total ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">
                        {translateTaskCategory(category, language)}
                      </h4>
                      <span className="text-xs font-medium">{percentage}%</span>
                    </div>
                    <Progress 
                      value={percentage}
                      className="h-2"
                      aria-label={`${translateTaskCategory(category, language)} progress`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t(
                        `${completed} sur ${total} complétées`,
                        `${completed} out of ${total} completed`
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstancesSummary;
