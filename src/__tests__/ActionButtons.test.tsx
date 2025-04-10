
/**
 * Tests unitaires pour le composant ActionButtons
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButtons from '../pages/Report/components/ActionButtons';

describe('ActionButtons Component', () => {
  const defaultProps = {
    generateReport: () => {},
    isGenerating: false,
    areDomainsSelected: true
  };

  test('devrait afficher correctement les boutons', () => {
    render(<ActionButtons {...defaultProps} />);
    
    expect(screen.getByText('Télécharger le rapport')).toBeInTheDocument();
    expect(screen.getByText('Imprimer le rapport')).toBeInTheDocument();
  });

  test('devrait afficher "Génération en cours..." quand isGenerating est true', () => {
    render(<ActionButtons {...defaultProps} isGenerating={true} />);
    
    expect(screen.getByText('Génération en cours...')).toBeInTheDocument();
    expect(screen.queryByText('Télécharger le rapport')).not.toBeInTheDocument();
  });

  test('les boutons devraient être désactivés quand isGenerating est true', () => {
    render(<ActionButtons {...defaultProps} isGenerating={true} />);
    
    const downloadButton = screen.getByText('Génération en cours...').closest('button');
    const printButton = screen.getByText('Imprimer le rapport').closest('button');
    
    expect(downloadButton).toBeDisabled();
    expect(printButton).toBeDisabled();
  });

  test('les boutons devraient être désactivés quand areDomainsSelected est false', () => {
    render(<ActionButtons {...defaultProps} areDomainsSelected={false} />);
    
    const downloadButton = screen.getByText('Télécharger le rapport').closest('button');
    const printButton = screen.getByText('Imprimer le rapport').closest('button');
    
    expect(downloadButton).toBeDisabled();
    expect(printButton).toBeDisabled();
  });

  test('devrait appeler generateReport quand on clique sur le bouton de téléchargement', () => {
    const mockGenerateReport = jest.fn();
    render(<ActionButtons {...defaultProps} generateReport={mockGenerateReport} />);
    
    fireEvent.click(screen.getByText('Télécharger le rapport'));
    expect(mockGenerateReport).toHaveBeenCalledTimes(1);
  });

  test('devrait appeler generateReport quand on clique sur le bouton d\'impression', () => {
    const mockGenerateReport = jest.fn();
    render(<ActionButtons {...defaultProps} generateReport={mockGenerateReport} />);
    
    fireEvent.click(screen.getByText('Imprimer le rapport'));
    expect(mockGenerateReport).toHaveBeenCalledTimes(1);
  });
});
