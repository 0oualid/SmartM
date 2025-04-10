
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from 'lucide-react';

/**
 * Interface des propriétés pour le composant ActionButtons
 * @property generateReport - Fonction pour déclencher la génération du rapport
 * @property isGenerating - État indiquant si un rapport est en cours de génération
 * @property areDomainsSelected - État indiquant si au moins un domaine est sélectionné
 */
interface ActionButtonsProps {
  generateReport: () => void;
  isGenerating: boolean;
  areDomainsSelected: boolean;
}

/**
 * Composant qui affiche les boutons d'action pour générer et imprimer un rapport
 * Les boutons sont désactivés si aucun domaine n'est sélectionné ou si un rapport est en cours de génération
 */
const ActionButtons = ({ generateReport, isGenerating, areDomainsSelected }: ActionButtonsProps) => {
  return (
    <div className="pt-4 border-t flex flex-col sm:flex-row gap-2 justify-end">
      <Button
        className="flex items-center gap-2"
        onClick={generateReport}
        disabled={isGenerating || !areDomainsSelected}
      >
        {isGenerating ? "Génération en cours..." : (
          <>
            <FileDown className="h-4 w-4" />
            Télécharger le rapport
          </>
        )}
      </Button>
      
      <Button
        className="flex items-center gap-2"
        variant="outline"
        onClick={generateReport}
        disabled={isGenerating || !areDomainsSelected}
      >
        <Printer className="h-4 w-4" />
        Imprimer le rapport
      </Button>
    </div>
  );
};

export default ActionButtons;
