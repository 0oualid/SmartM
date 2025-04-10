
import { jsPDF } from "jspdf";
import { truncateText, addSectionTitle, translateEquipmentStatus } from "../helpers";
import { Equipment } from "../../types";

/**
 * Génère la section des équipements dans le rapport PDF
 * 
 * @param doc - Le document PDF en cours de génération
 * @param y - La position verticale actuelle dans le document
 * @param equipmentList - La liste des équipements à inclure dans le rapport
 * @returns La nouvelle position verticale après avoir ajouté cette section
 */
export const addEquipmentSection = (doc: jsPDF, y: number, equipmentList: Equipment[]): number => {
  y = addSectionTitle(doc, "Équipements", y);

  if (equipmentList.length > 0) {
    // En-tête du tableau
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 40, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Nom", 15, y + 7);
    doc.rect(54, y, 40, 10, "F");
    doc.text("Service", 55, y + 7);
    doc.rect(94, y, 30, 10, "F");
    doc.text("Statut", 95, y + 7);
    y += 10;

    // Contenu du tableau
    doc.setFont("helvetica", "normal");
    equipmentList.forEach((equipment, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y, 40, 8, "F");
        doc.rect(54, y, 40, 8, "F");
        doc.rect(94, y, 30, 8, "F");
      }
      doc.text(truncateText(equipment.name, 15), 15, y + 6);
      doc.text(truncateText(equipment.service, 15), 55, y + 6);
      
      // Traduire le statut
      const statusText = translateEquipmentStatus(equipment.status);
      
      doc.text(statusText, 95, y + 6);
      y += 8;
    });
  } else {
    doc.text("Aucun équipement enregistré", 14, y + 6);
    y += 10;
  }

  return y;
};
