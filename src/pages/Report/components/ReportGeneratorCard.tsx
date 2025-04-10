
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import DomainCheckboxes from './DomainCheckboxes';
import MonthSelector from './MonthSelector';
import ActionButtons from './ActionButtons';
import { SelectedDomains } from '../utils/reportGenerationUtils';

/**
 * Interface des propriétés pour le composant ReportGeneratorCard
 * @property selectedDomains - Domaines sélectionnés pour inclusion dans le rapport
 * @property handleCheckboxChange - Fonction de gestion du changement des cases à cocher
 * @property selectedMonth - Mois sélectionné pour filtrage des données
 * @property setSelectedMonth - Fonction pour définir le mois sélectionné
 * @property isGenerating - État indiquant si un rapport est en cours de génération
 * @property generateReport - Fonction pour déclencher la génération du rapport
 * @property areDomainsSelected - État indiquant si au moins un domaine est sélectionné
 */
interface ReportGeneratorCardProps {
  selectedDomains: SelectedDomains;
  handleCheckboxChange: (domain: keyof SelectedDomains) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isGenerating: boolean;
  generateReport: () => void;
  areDomainsSelected: boolean;
}

/**
 * Composant qui affiche une carte permettant à l'utilisateur de configurer et générer un rapport
 * Il permet de sélectionner les domaines à inclure et, si les finances sont incluses, 
 * le mois pour lequel les données financières doivent être filtrées
 */
const ReportGeneratorCard = ({
  selectedDomains,
  handleCheckboxChange,
  selectedMonth,
  setSelectedMonth,
  isGenerating,
  generateReport,
  areDomainsSelected
}: ReportGeneratorCardProps) => {
  return (
    <Card className="border-primary/10 shadow-md">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle>Générer un rapport</CardTitle>
        <CardDescription>
          Choisissez les informations à inclure dans votre rapport PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DomainCheckboxes 
              selectedDomains={selectedDomains} 
              handleCheckboxChange={handleCheckboxChange} 
            />
            
            <div className="space-y-4">
              {selectedDomains.finance && (
                <MonthSelector 
                  selectedMonth={selectedMonth} 
                  setSelectedMonth={setSelectedMonth} 
                />
              )}
            </div>
          </div>

          <ActionButtons 
            generateReport={generateReport} 
            isGenerating={isGenerating} 
            areDomainsSelected={areDomainsSelected}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGeneratorCard;
