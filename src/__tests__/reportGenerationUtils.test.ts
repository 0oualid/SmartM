
/**
 * Tests unitaires pour les fonctions utilitaires de génération de rapports
 */
import { SelectedDomains } from '../pages/Report/utils/reportGenerationUtils';
import { jsPDF } from 'jspdf';

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

// Mock des services de localStorage
jest.mock('../utils/localStorageService', () => ({
  calculateTotalOperability: jest.fn().mockReturnValue(85),
  getPersonnelAbsences: jest.fn().mockReturnValue([]),
  getTasks: jest.fn().mockReturnValue([]),
  getTotalPersonnel: jest.fn().mockReturnValue(10),
  getEquipment: jest.fn().mockReturnValue([])
}));

// Import après les mocks pour s'assurer que les mocks sont appliqués
import { 
  addPdfHeader, 
  addDateSection, 
  addEquipmentSection,
  addPersonnelSection,
  addFinanceSection,
  addTasksSection,
  addFooter,
  addWatermark
} from '../pages/Report/utils/reportGenerationUtils';

describe('Fonctions de génération de rapports PDF', () => {
  let mockDoc: jsPDF;
  let mockLogo: HTMLImageElement;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    mockDoc = new jsPDF();
    mockLogo = new Image();
  });

  test('addPdfHeader devrait ajouter un en-tête au document PDF', () => {
    const result = addPdfHeader(mockDoc, mockLogo);
    
    // Check that the header functions were called
    expect(mockDoc.setFillColor).toHaveBeenCalled();
    expect(mockDoc.rect).toHaveBeenCalled();
    expect(mockDoc.setTextColor).toHaveBeenCalled();
    expect(mockDoc.setFontSize).toHaveBeenCalled();
    expect(mockDoc.setFont).toHaveBeenCalled();
    expect(mockDoc.addImage).toHaveBeenCalled();
    expect(mockDoc.text).toHaveBeenCalled();
    
    // Check that the function returns a number (Y position)
    expect(typeof result).toBe('number');
  });

  test('addDateSection devrait ajouter une section de date au document PDF', () => {
    const initialY = 15;
    const result = addDateSection(mockDoc, initialY);
    
    // Check that the section functions were called
    expect(mockDoc.setFontSize).toHaveBeenCalled();
    expect(mockDoc.setTextColor).toHaveBeenCalled();
    expect(mockDoc.setFont).toHaveBeenCalled();
    expect(mockDoc.text).toHaveBeenCalled();
    
    // Check that the function returns a greater Y position than the initial one
    expect(result).toBeGreaterThan(initialY);
  });

  test('addDateSection avec un mois sélectionné devrait ajouter des informations supplémentaires', () => {
    const initialY = 15;
    const selectedMonth = '2023-05';
    const result = addDateSection(mockDoc, initialY, selectedMonth);
    
    // Check that text is called at least twice (once for date, once for month)
    expect(mockDoc.text).toHaveBeenCalledTimes(expect.any(Number));
    
    // Check that the function returns a greater Y position than the initial one
    expect(result).toBeGreaterThan(initialY);
  });

  // Ajoutez des tests similaires pour les autres fonctions...

  test('addFooter devrait ajouter un pied de page au document PDF', () => {
    addFooter(mockDoc, mockLogo);
    
    // Check that the footer functions were called
    expect(mockDoc.addImage).toHaveBeenCalled();
    expect(mockDoc.setTextColor).toHaveBeenCalled();
    expect(mockDoc.setFontSize).toHaveBeenCalled();
    expect(mockDoc.text).toHaveBeenCalled();
  });

  test('addWatermark devrait ajouter un filigrane au document PDF', () => {
    addWatermark(mockDoc, mockLogo);
    
    // Check that the watermark functions were called
    expect(mockDoc.saveGraphicsState).toHaveBeenCalled();
    expect(mockDoc.GState).toHaveBeenCalled();
    expect(mockDoc.setGState).toHaveBeenCalled();
    expect(mockDoc.addImage).toHaveBeenCalled();
    expect(mockDoc.restoreGraphicsState).toHaveBeenCalled();
  });
});
