import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateTotalOperability, 
  getPersonnelAbsences, 
  getTasks, 
  getTotalPersonnel,
  getEquipment
} from '@/utils/localStorageService';

/**
 * Interface définissant les domaines qui peuvent être sélectionnés pour inclusion dans un rapport
 * @property equipment - Inclusion des données d'équipement
 * @property personnel - Inclusion des données du personnel
 * @property finance - Inclusion des données financières
 * @property tasks - Inclusion des données des tâches
 */
export interface SelectedDomains {
  equipment: boolean;
  personnel: boolean;
  finance: boolean;
  tasks: boolean;
}

/**
 * Ajoute l'en-tête au document PDF avec le logo et le titre
 * @param doc - Document PDF jsPDF
 * @param logo - Image du logo à inclure dans l'en-tête
 * @returns Position Y après l'en-tête
 */
export const addPdfHeader = (doc: jsPDF, logo: HTMLImageElement): number => {
  // Add header with professional styling
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  
  // Add logo to top left corner
  doc.addImage(logo, 'PNG', 10, 2, 10, 8);
  
  // Add header text
  doc.text("Rapport de gestion", 105, 8, { align: "center" });
  
  return 15; // Initial Y position after the header
};

/**
 * Ajoute la section de date au document PDF
 * @param doc - Document PDF jsPDF
 * @param yPos - Position Y de départ
 * @param selectedMonth - Mois sélectionné pour le filtrage (optionnel)
 * @returns Nouvelle position Y après la section
 */
export const addDateSection = (doc: jsPDF, yPos: number, selectedMonth?: string): number => {
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Généré le: ${currentDate}`, 105, yPos, { align: "center" });
  
  let newYPos = yPos + 5;
  
  // Add filtered month info if provided
  if (selectedMonth) {
    const monthName = new Date(selectedMonth + "-01").toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    doc.text(`Données financières du mois de: ${monthName}`, 105, newYPos, { align: "center" });
    newYPos += 5;
  }
  
  return newYPos + 2;
};

/**
 * Ajoute la section des équipements au document PDF
 * @param doc - Document PDF jsPDF
 * @param yPos - Position Y de départ
 * @returns Nouvelle position Y après la section
 */
export const addEquipmentSection = (doc: jsPDF, yPos: number): number => {
  // Section header
  doc.setFillColor(220, 230, 240);
  doc.rect(10, yPos, 190, 8, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport des équipements", 15, yPos + 6);
  
  yPos += 12;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  const operability = calculateTotalOperability();
  doc.text(`Opérabilité totale: ${operability}%`, 15, yPos);
  
  // Get equipment data
  const equipments = getEquipment();
  
  if (equipments.length > 0) {
    yPos += 5;
    
    // Draw table headers with better styling
    doc.setFillColor(230, 230, 230);
    doc.rect(15, yPos, 180, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ID", 20, yPos + 5);
    doc.text("Nom", 40, yPos + 5);
    doc.text("Service", 90, yPos + 5);
    doc.text("État", 140, yPos + 5);
    doc.text("Sensibilité", 170, yPos + 5);
    
    // Draw table content
    doc.setFont("helvetica", "normal");
    yPos += 7;
    
    // Only show first 6 items to maximize space
    const displayEquipments = equipments.slice(0, 6);
    
    displayEquipments.forEach((equipment, index) => {
      // Alternate row colors for better readability
      if (index % 2 !== 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPos, 180, 6, 'F');
      }
      
      // Map status to more readable text
      let statusText = "Inconnu";
      if (equipment.status === "operational") statusText = "Opérationnel";
      else if (equipment.status === "maintenance") statusText = "En maintenance";
      else if (equipment.status === "outOfService") statusText = "Hors service";
      
      doc.text(equipment.id.toString(), 20, yPos + 4);
      doc.text(equipment.name.substring(0, 30), 40, yPos + 4);
      doc.text(equipment.service || '-', 90, yPos + 4);
      doc.text(statusText, 140, yPos + 4);
      doc.text(equipment.sensitivity.toString(), 170, yPos + 4);
      
      yPos += 6;
    });
    
    if (equipments.length > 6) {
      doc.setTextColor(100, 100, 100);
      doc.text(`... et ${equipments.length - 6} équipements supplémentaires`, 105, yPos + 4, { align: "center" });
      yPos += 7;
    }
  } else {
    doc.text("Aucun équipement n'a été trouvé.", 15, yPos + 4);
    yPos += 7;
  }
  
  return yPos + 5;
};

/**
 * Ajoute la section du personnel au document PDF
 * @param doc - Document PDF jsPDF
 * @param yPos - Position Y de départ
 * @returns Nouvelle position Y après la section
 */
export const addPersonnelSection = (doc: jsPDF, yPos: number): number => {
  // Section header
  doc.setFillColor(220, 230, 240);
  doc.rect(10, yPos, 190, 8, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport du personnel", 15, yPos + 6);
  
  yPos += 12;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  const totalPersonnel = getTotalPersonnel();
  const absences = getPersonnelAbsences().filter(absence => !absence.rejoined);
  
  doc.text(`Effectif total: ${totalPersonnel}`, 15, yPos);
  yPos += 5;
  doc.text(`Personnel absent: ${absences.length}`, 15, yPos);
  yPos += 5;
  doc.text(`Personnel présent: ${totalPersonnel - absences.length}`, 15, yPos);
  
  // Add table for personnel absences
  if (absences.length > 0) {
    yPos += 7;
    
    // Draw table headers with better styling
    doc.setFillColor(230, 230, 230);
    doc.rect(15, yPos, 180, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Nom", 20, yPos + 5);
    doc.text("Motif", 75, yPos + 5);
    doc.text("Date début", 125, yPos + 5);
    doc.text("Date fin", 160, yPos + 5);
    
    // Draw table content
    doc.setFont("helvetica", "normal");
    yPos += 7;
    
    // Only show first 6 items to maximize space
    const displayAbsences = absences.slice(0, 6);
    
    displayAbsences.forEach((absence, index) => {
      // Alternate row colors for better readability
      if (index % 2 !== 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPos, 180, 6, 'F');
      }
      
      doc.text(absence.label.substring(0, 25), 20, yPos + 4);
      doc.text(absence.reason.substring(0, 25), 75, yPos + 4);
      doc.text(absence.startDate, 125, yPos + 4);
      doc.text(absence.endDate, 160, yPos + 4);
      
      yPos += 6;
    });
    
    if (absences.length > 6) {
      doc.setTextColor(100, 100, 100);
      doc.text(`... et ${absences.length - 6} absences supplémentaires`, 105, yPos + 4, { align: "center" });
      yPos += 7;
    }
  } else {
    doc.text("Aucune absence active n'a été trouvée.", 15, yPos + 7);
    yPos += 12;
  }
  
  return yPos + 5;
};

/**
 * Ajoute la section financière au document PDF
 * @param doc - Document PDF jsPDF
 * @param yPos - Position Y de départ
 * @param selectedMonth - Mois sélectionné pour le filtrage
 * @returns Nouvelle position Y après la section
 */
export const addFinanceSection = (doc: jsPDF, yPos: number, selectedMonth: string): number => {
  // Section header
  doc.setFillColor(220, 230, 240);
  doc.rect(10, yPos, 190, 8, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport financier", 15, yPos + 6);
  
  yPos += 12;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  // Get financial data from localStorage filtered by selected month
  const consumptionsData = localStorage.getItem('consumptions');
  const allConsumptions = consumptionsData ? JSON.parse(consumptionsData) : [];
  
  // Filter consumptions for the selected month
  const [year, month] = selectedMonth.split('-');
  const consumptions = allConsumptions.filter((item: any) => {
    if (!item.date) return false;
    return item.date.startsWith(`${year}-${month}`) || item.date.startsWith(`${month}/${year.slice(2)}`);
  });
  
  const totalAmount = consumptions.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.amount) || 0), 0);
  
  doc.text(`Montant total des dépenses pour ${month}/${year}: ${totalAmount.toLocaleString('fr-FR')} DHS`, 15, yPos);
  
  // Add table for finance data with updated columns
  if (consumptions.length > 0) {
    yPos += 7;
    
    // Draw table headers with better styling
    doc.setFillColor(230, 230, 230);
    doc.rect(15, yPos, 180, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ID Facture", 20, yPos + 5);
    doc.text("Description", 60, yPos + 5);
    doc.text("Date", 130, yPos + 5);
    doc.text("Montant (DHS)", 165, yPos + 5);
    
    // Draw table content
    doc.setFont("helvetica", "normal");
    yPos += 7;
    
    // Only show first 6 items to maximize space
    const displayConsumptions = consumptions.slice(0, 6);
    
    displayConsumptions.forEach((item: any, index: number) => {
      // Alternate row colors for better readability
      if (index % 2 !== 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPos, 180, 6, 'F');
      }
      
      doc.text(item.invoiceId || '-', 20, yPos + 4);
      doc.text(item.description?.substring(0, 40) || '-', 60, yPos + 4);
      doc.text(item.date || '-', 130, yPos + 4);
      doc.text(item.amount?.toLocaleString('fr-FR') || '-', 165, yPos + 4);
      
      yPos += 6;
    });
    
    if (consumptions.length > 6) {
      doc.setTextColor(100, 100, 100);
      doc.text(`... et ${consumptions.length - 6} dépenses supplémentaires`, 105, yPos + 4, { align: "center" });
      yPos += 7;
    }
  } else {
    doc.text(`Aucune dépense n'a été trouvée pour le mois de ${month}/${year}.`, 15, yPos + 7);
    yPos += 12;
  }
  
  return yPos + 5;
};

/**
 * Ajoute la section des tâches au document PDF
 * @param doc - Document PDF jsPDF
 * @param yPos - Position Y de départ
 * @returns Nouvelle position Y après la section
 */
export const addTasksSection = (doc: jsPDF, yPos: number): number => {
  // Section header
  doc.setFillColor(220, 230, 240);
  doc.rect(10, yPos, 190, 8, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.setFont("helvetica", "bold");
  doc.text("Rapport des tâches", 15, yPos + 6);
  
  yPos += 12;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  const tasks = getTasks();
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  doc.text(`Tâches totales: ${tasks.length}`, 15, yPos);
  yPos += 5;
  doc.text(`Tâches en cours: ${pendingTasks.length}`, 15, yPos);
  yPos += 5;
  doc.text(`Tâches terminées: ${completedTasks.length}`, 15, yPos);
  
  // Add table for tasks
  if (tasks.length > 0) {
    yPos += 7;
    
    // Draw table headers with better styling
    doc.setFillColor(230, 230, 230);
    doc.rect(15, yPos, 180, 7, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Titre", 20, yPos + 5);
    doc.text("Assigné à", 80, yPos + 5);
    doc.text("Date échéance", 125, yPos + 5);
    doc.text("Statut", 165, yPos + 5);
    
    // Draw table content
    doc.setFont("helvetica", "normal");
    yPos += 7;
    
    // Only show first 6 items to maximize space
    const displayTasks = tasks.slice(0, 6);
    
    displayTasks.forEach((task: any, index: number) => {
      // Alternate row colors for better readability
      if (index % 2 !== 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPos, 180, 6, 'F');
      }
      
      doc.text(task.title?.substring(0, 25) || '-', 20, yPos + 4);
      doc.text(task.assignedTo?.substring(0, 20) || '-', 80, yPos + 4);
      doc.text(task.dueDate || '-', 125, yPos + 4);
      doc.text(task.status === 'pending' ? 'En cours' : 'Terminée', 165, yPos + 4);
      
      yPos += 6;
    });
    
    if (tasks.length > 6) {
      doc.setTextColor(100, 100, 100);
      doc.text(`... et ${tasks.length - 6} tâches supplémentaires`, 105, yPos + 4, { align: "center" });
      yPos += 7;
    }
  } else {
    doc.text("Aucune tâche n'a été trouvée.", 15, yPos + 7);
    yPos += 12;
  }
  
  return yPos;
};

/**
 * Ajoute le pied de page au document PDF
 * @param doc - Document PDF jsPDF
 * @param logo - Image du logo à inclure dans le pied de page
 */
export const addFooter = (doc: jsPDF, logo: HTMLImageElement): void => {
  // Add footer with logo
  doc.addImage(logo, 'PNG', 10, 280, 8, 6);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("SmartM © " + new Date().getFullYear() + " - Document généré automatiquement", 105, 285, { align: "center" });
};

/**
 * Ajoute un filigrane au document PDF
 * @param doc - Document PDF jsPDF
 * @param logo - Image du logo à utiliser comme filigrane
 */
export const addWatermark = (doc: jsPDF, logo: HTMLImageElement): void => {
  // Add watermark with the logo (center of page)
  doc.saveGraphicsState();
  // Create a graphics state for transparency
  const gState = doc.GState({ opacity: 0.15 });
  doc.setGState(gState);
  doc.addImage(logo, 'PNG', 55, 85, 100, 100);
  doc.restoreGraphicsState();
};
