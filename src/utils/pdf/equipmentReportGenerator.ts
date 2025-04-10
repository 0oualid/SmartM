
import { jsPDF } from "jspdf";
import { 
  truncateText, 
  formatDate, 
  addHeader, 
  addFooter, 
  addSectionTitle, 
  translateEquipmentStatus 
} from "./helpers";
import { Equipment, EquipmentFailure } from "../types";

export interface EquipmentReportData {
  title: string;
  equipmentDetails: {
    id: number;
    name: string;
    service: string;
    status: string;
    sensitivity: number;
  };
  failures: {
    id?: number;
    type: string;
    date: string;
    component: string;
    reference: string;
  }[];
  statistics: any;
}

/**
 * Génère un rapport PDF pour un équipement spécifique
 */
export const generateEquipmentReport = (reportData: EquipmentReportData): jsPDF => {
  const doc = new jsPDF();

  // Titre du document
  doc.setFontSize(20);
  doc.text(reportData.title, 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: "center" });

  // Ajouter l'en-tête
  addHeader(doc, "Rapport d'avaries d'équipement");
  
  let y = 40;

  // Détails de l'équipement
  y = addSectionTitle(doc, "Détails de l'équipement", y);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`ID: ${reportData.equipmentDetails.id}`, 14, y);
  y += 8;
  doc.text(`Nom: ${reportData.equipmentDetails.name}`, 14, y);
  y += 8;
  doc.text(`Service: ${reportData.equipmentDetails.service}`, 14, y);
  y += 8;
  
  // Traduire le statut
  const statusText = translateEquipmentStatus(reportData.equipmentDetails.status);
  
  doc.text(`État: ${statusText}`, 14, y);
  y += 8;
  doc.text(`Sensibilité: ${reportData.equipmentDetails.sensitivity}/5`, 14, y);
  y += 15;

  // Statistiques - Déplacées avant le tableau des pannes
  y = addSectionTitle(doc, "Statistiques", y);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total des avaries: ${reportData.statistics?.total || 0}`, 14, y);
  y += 15;

  // Tableau des pannes
  y = addSectionTitle(doc, "Historique des avaries", y);

  if (reportData.failures && reportData.failures.length > 0) {
    // En-tête du tableau - Définition des dimensions et des positions
    const tableWidth = 160;
    const columnWidths = [40, 30, 50, 40]; // Type, Date, Composante, Référence
    const startX = 25;
    let currentX = startX;
    
    // En-tête du tableau
    doc.setFillColor(230, 230, 230);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Dessiner les cellules d'en-tête
    currentX = startX;
    
    // Dessiner les rectangles d'en-tête AVANT d'écrire le texte
    doc.rect(currentX, y, columnWidths[0], 8, "F");
    doc.text("Type", currentX + 5, y + 5);
    currentX += columnWidths[0];
    
    doc.rect(currentX, y, columnWidths[1], 8, "F");
    doc.text("Date", currentX + 5, y + 5);
    currentX += columnWidths[1];
    
    doc.rect(currentX, y, columnWidths[2], 8, "F");
    doc.text("Composante", currentX + 5, y + 5);
    currentX += columnWidths[2];
    
    doc.rect(currentX, y, columnWidths[3], 8, "F");
    doc.text("Référence", currentX + 5, y + 5);
    
    y += 8;
    
    // Contenu du tableau
    doc.setFont("helvetica", "normal");
    reportData.failures.forEach((failure, index) => {
      // Dessiner l'arrière-plan pour les lignes alternées
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, y, tableWidth, 8, "F");
      }
      
      // Réinitialiser la position X pour chaque nouvelle ligne
      currentX = startX;
      
      // Écrire les données dans chaque cellule
      doc.text(truncateText(failure.type, 15), currentX + 5, y + 5);
      currentX += columnWidths[0];
      
      doc.text(formatDate(failure.date), currentX + 5, y + 5);
      currentX += columnWidths[1];
      
      doc.text(truncateText(failure.component, 20), currentX + 5, y + 5);
      currentX += columnWidths[2];
      
      doc.text(truncateText(failure.reference || 'N/A', 15), currentX + 5, y + 5);
      
      y += 8;
      
      // Vérifier si on atteint la fin de la page et ajouter une nouvelle page si nécessaire
      if (y > 270) {
        doc.addPage();
        y = 20;
        addHeader(doc, "Rapport d'avaries d'équipement (suite)");
      }
    });
  } else {
    doc.text("Aucune avarie enregistrée", 14, y + 6);
    y += 10;
  }

  // Ajouter le pied de page
  addFooter(doc);

  return doc;
};
