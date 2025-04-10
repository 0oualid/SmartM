
import { jsPDF } from "jspdf";
import { truncateText, formatDate, addSectionTitle } from "../helpers";
import { EquipmentFailure } from "../../types";

/**
 * Génère la section des avaries d'équipement dans le rapport PDF
 * 
 * @param doc - Le document PDF en cours de génération
 * @param y - La position verticale actuelle dans le document
 * @param equipmentFailures - La liste des avaries d'équipement à inclure dans le rapport
 * @returns La nouvelle position verticale après avoir ajouté cette section
 */
export const addEquipmentFailuresSection = (doc: jsPDF, y: number, equipmentFailures: EquipmentFailure[]): number => {
  y = addSectionTitle(doc, "Avaries d'équipement", y);

  if (equipmentFailures.length > 0) {
    // En-tête du tableau - Ajout de toutes les colonnes pour le tableau complet
    doc.setFillColor(230, 230, 230);
    doc.rect(10, y, 45, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Type", 15, y + 7);
    
    doc.rect(55, y, 40, 10, "F");
    doc.text("Date", 60, y + 7);
    
    doc.rect(95, y, 45, 10, "F");
    doc.text("Composante", 100, y + 7);
    
    doc.rect(140, y, 50, 10, "F");
    doc.text("Référence", 145, y + 7);
    
    y += 10;

    // Contenu du tableau
    doc.setFont("helvetica", "normal");
    equipmentFailures.forEach((failure, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y, 45, 8, "F");
        doc.rect(55, y, 40, 8, "F");
        doc.rect(95, y, 45, 8, "F");
        doc.rect(140, y, 50, 8, "F");
      }
      doc.text(truncateText(failure.failure_type, 20), 15, y + 6);
      doc.text(formatDate(failure.failure_date), 60, y + 6);
      doc.text(truncateText(failure.component, 20), 100, y + 6);
      doc.text(truncateText(failure.reference || 'N/A', 22), 145, y + 6);
      y += 8;
    });
  } else {
    doc.text("Aucune avarie enregistrée", 14, y + 6);
    y += 10;
  }

  return y;
};
