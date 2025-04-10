
import { jsPDF } from "jspdf";
import { truncateText, formatDate, addSectionTitle } from "../helpers";
import { Personnel } from "../../types";

/**
 * Génère la section du personnel dans le rapport PDF
 * 
 * @param doc - Le document PDF en cours de génération
 * @param y - La position verticale actuelle dans le document
 * @param personnelList - La liste du personnel à inclure dans le rapport
 * @returns La nouvelle position verticale après avoir ajouté cette section
 */
export const addPersonnelSection = (doc: jsPDF, y: number, personnelList: Personnel[]): number => {
  y = addSectionTitle(doc, "Personnel", y);

  if (personnelList.length > 0) {
    // En-tête du tableau
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 60, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Nom", 15, y + 7);
    doc.rect(74, y, 40, 10, "F");
    doc.text("Absences", 75, y + 7);
    doc.rect(114, y, 60, 10, "F");
    doc.text("Date de création", 115, y + 7);
    y += 10;

    // Contenu du tableau
    doc.setFont("helvetica", "normal");
    personnelList.forEach((personnel, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y, 60, 8, "F");
        doc.rect(74, y, 40, 8, "F");
        doc.rect(114, y, 60, 8, "F");
      }
      doc.text(truncateText(personnel.name, 25), 15, y + 6);
      doc.text(personnel.absenceDays.toString(), 75, y + 6);
      doc.text(formatDate(personnel.createdAt), 115, y + 6);
      y += 8;
    });
  } else {
    doc.text("Aucun personnel enregistré", 14, y + 6);
    y += 10;
  }

  return y;
};
