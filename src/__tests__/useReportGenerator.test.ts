
/**
 * Tests unitaires pour le hook useReportGenerator
 */
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { useReportGenerator } from '../pages/Report/hooks/useReportGenerator';
import { useToast } from '@/hooks/use-toast';

// Mock des dépendances
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      text: jest.fn(),
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      setFillColor: jest.fn(),
      rect: jest.fn(),
      setFont: jest.fn(),
      addImage: jest.fn(),
      saveGraphicsState: jest.fn(),
      restoreGraphicsState: jest.fn(),
      GState: jest.fn().mockReturnValue({}),
      setGState: jest.fn(),
      addPage: jest.fn(),
      save: jest.fn()
    }))
  };
});

// Mock des fonctions utilitaires
jest.mock('../pages/Report/utils/reportGenerationUtils', () => ({
  addPdfHeader: jest.fn().mockReturnValue(15),
  addDateSection: jest.fn().mockReturnValue(25),
  addEquipmentSection: jest.fn().mockReturnValue(50),
  addPersonnelSection: jest.fn().mockReturnValue(100),
  addFinanceSection: jest.fn().mockReturnValue(150),
  addTasksSection: jest.fn().mockReturnValue(180),
  addFooter: jest.fn(),
  addWatermark: jest.fn()
}));

describe('useReportGenerator Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useReportGenerator());
    
    expect(result.current.selectedDomains).toEqual({
      equipment: true,
      personnel: true,
      finance: true,
      tasks: true
    });
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.selectedMonth).toBe(expect.any(String)); // Format YYYY-MM
    expect(result.current.areDomainsSelected).toBe(true);
  });

  test('handleCheckboxChange devrait basculer la valeur du domaine sélectionné', () => {
    const { result } = renderHook(() => useReportGenerator());
    
    // Initialement, equipment est true
    expect(result.current.selectedDomains.equipment).toBe(true);
    
    // Basculer equipment à false
    act(() => {
      result.current.handleCheckboxChange('equipment');
    });
    
    expect(result.current.selectedDomains.equipment).toBe(false);
    
    // Basculer equipment à true à nouveau
    act(() => {
      result.current.handleCheckboxChange('equipment');
    });
    
    expect(result.current.selectedDomains.equipment).toBe(true);
  });

  test('setSelectedMonth devrait mettre à jour le mois sélectionné', () => {
    const { result } = renderHook(() => useReportGenerator());
    const newMonth = '2023-12';
    
    act(() => {
      result.current.setSelectedMonth(newMonth);
    });
    
    expect(result.current.selectedMonth).toBe(newMonth);
  });

  test('areDomainsSelected devrait être false si aucun domaine n\'est sélectionné', () => {
    const { result } = renderHook(() => useReportGenerator());
    
    // Désélectionner tous les domaines
    act(() => {
      result.current.handleCheckboxChange('equipment');
      result.current.handleCheckboxChange('personnel');
      result.current.handleCheckboxChange('finance');
      result.current.handleCheckboxChange('tasks');
    });
    
    expect(result.current.areDomainsSelected).toBe(false);
  });

  // Note: Tester generateReport nécessiterait une configuration plus complexe
  // car elle utilise des APIs de navigateur non disponibles dans l'environnement de test
});
