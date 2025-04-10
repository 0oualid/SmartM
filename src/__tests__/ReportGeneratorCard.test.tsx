
/**
 * Tests unitaires pour le composant ReportGeneratorCard
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportGeneratorCard from '../pages/Report/components/ReportGeneratorCard';
import { SelectedDomains } from '../pages/Report/utils/reportGenerationUtils';

// Mock des composants enfants pour isoler les tests
jest.mock('../pages/Report/components/DomainCheckboxes', () => {
  return function MockDomainCheckboxes() {
    return <div data-testid="domain-checkboxes" />;
  };
});

jest.mock('../pages/Report/components/MonthSelector', () => {
  return function MockMonthSelector() {
    return <div data-testid="month-selector" />;
  };
});

jest.mock('../pages/Report/components/ActionButtons', () => {
  return function MockActionButtons() {
    return <div data-testid="action-buttons" />;
  };
});

describe('ReportGeneratorCard Component', () => {
  const defaultProps = {
    selectedDomains: {
      equipment: true,
      personnel: true,
      finance: false,
      tasks: true
    } as SelectedDomains,
    handleCheckboxChange: jest.fn(),
    selectedMonth: '2023-05',
    setSelectedMonth: jest.fn(),
    isGenerating: false,
    generateReport: jest.fn(),
    areDomainsSelected: true
  };

  test('devrait afficher le titre et la description', () => {
    render(<ReportGeneratorCard {...defaultProps} />);
    
    expect(screen.getByText('Générer un rapport')).toBeInTheDocument();
    expect(screen.getByText('Choisissez les informations à inclure dans votre rapport PDF')).toBeInTheDocument();
  });

  test('devrait afficher les composants DomainCheckboxes et ActionButtons', () => {
    render(<ReportGeneratorCard {...defaultProps} />);
    
    expect(screen.getByTestId('domain-checkboxes')).toBeInTheDocument();
    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
  });

  test('ne devrait pas afficher MonthSelector quand finance n\'est pas sélectionné', () => {
    render(<ReportGeneratorCard {...defaultProps} />);
    
    expect(screen.queryByTestId('month-selector')).not.toBeInTheDocument();
  });

  test('devrait afficher MonthSelector quand finance est sélectionné', () => {
    const propsWithFinance = {
      ...defaultProps,
      selectedDomains: {
        ...defaultProps.selectedDomains,
        finance: true
      }
    };
    
    render(<ReportGeneratorCard {...propsWithFinance} />);
    
    expect(screen.getByTestId('month-selector')).toBeInTheDocument();
  });
});
