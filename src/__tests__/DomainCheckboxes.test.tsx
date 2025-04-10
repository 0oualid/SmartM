
/**
 * Tests unitaires pour le composant DomainCheckboxes
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DomainCheckboxes from '../pages/Report/components/DomainCheckboxes';
import { SelectedDomains } from '../pages/Report/utils/reportGenerationUtils';

describe('DomainCheckboxes Component', () => {
  const defaultProps = {
    selectedDomains: {
      equipment: true,
      personnel: false,
      finance: true,
      tasks: false
    } as SelectedDomains,
    handleCheckboxChange: jest.fn()
  };

  test('devrait afficher toutes les cases à cocher avec le bon état', () => {
    render(<DomainCheckboxes {...defaultProps} />);
    
    // Le titre est correctement affiché
    expect(screen.getByText('Domaines à inclure')).toBeInTheDocument();
    
    // Vérifie que toutes les étiquettes sont affichées
    expect(screen.getByText('Équipements')).toBeInTheDocument();
    expect(screen.getByText('Personnel')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Tâches')).toBeInTheDocument();
    
    // Vérifie l'état des cases à cocher
    const equipmentCheckbox = screen.getByLabelText('Équipements');
    const personnelCheckbox = screen.getByLabelText('Personnel');
    const financeCheckbox = screen.getByLabelText('Finance');
    const tasksCheckbox = screen.getByLabelText('Tâches');
    
    expect(equipmentCheckbox).toBeChecked();
    expect(personnelCheckbox).not.toBeChecked();
    expect(financeCheckbox).toBeChecked();
    expect(tasksCheckbox).not.toBeChecked();
  });

  test('devrait appeler handleCheckboxChange avec le bon argument lors du clic', () => {
    const mockHandleCheckboxChange = jest.fn();
    render(<DomainCheckboxes 
      selectedDomains={defaultProps.selectedDomains} 
      handleCheckboxChange={mockHandleCheckboxChange} 
    />);
    
    // Cliquer sur les cases à cocher
    fireEvent.click(screen.getByLabelText('Équipements'));
    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('equipment');
    
    fireEvent.click(screen.getByLabelText('Personnel'));
    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('personnel');
    
    fireEvent.click(screen.getByLabelText('Finance'));
    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('finance');
    
    fireEvent.click(screen.getByLabelText('Tâches'));
    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('tasks');
  });
});
