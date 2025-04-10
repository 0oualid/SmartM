
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { SelectedDomains } from '../utils/reportGenerationUtils';

/**
 * Interface des propriétés pour le composant DomainCheckboxes
 * @property selectedDomains - Domaines sélectionnés pour inclusion dans le rapport
 * @property handleCheckboxChange - Fonction de gestion du changement des cases à cocher
 */
interface DomainCheckboxesProps {
  selectedDomains: SelectedDomains;
  handleCheckboxChange: (domain: keyof SelectedDomains) => void;
}

/**
 * Composant qui affiche une liste de cases à cocher pour sélectionner les domaines
 * à inclure dans le rapport généré (équipements, personnel, finances, tâches)
 */
const DomainCheckboxes = ({ selectedDomains, handleCheckboxChange }: DomainCheckboxesProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Domaines à inclure</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="equipment"
            checked={selectedDomains.equipment}
            onCheckedChange={() => handleCheckboxChange('equipment')}
          />
          <label
            htmlFor="equipment"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Équipements
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="personnel"
            checked={selectedDomains.personnel}
            onCheckedChange={() => handleCheckboxChange('personnel')}
          />
          <label
            htmlFor="personnel"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Personnel
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="finance"
            checked={selectedDomains.finance}
            onCheckedChange={() => handleCheckboxChange('finance')}
          />
          <label
            htmlFor="finance"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Finance
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tasks"
            checked={selectedDomains.tasks}
            onCheckedChange={() => handleCheckboxChange('tasks')}
          />
          <label
            htmlFor="tasks"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Tâches
          </label>
        </div>
      </div>
    </div>
  );
};

export default DomainCheckboxes;
