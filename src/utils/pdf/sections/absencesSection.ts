
import { jsPDF } from "jspdf";
import { truncateText, formatDate, addSectionTitle } from "../helpers";
import { PersonnelAbsence } from "../../types";

/**
 * Génère la section des absences dans le rapport PDF
 * 
 * @param doc - Le document PDF en cours de génération
 * @param y - La position verticale actuelle dans le document
 * @param absences - La liste des absences du personnel à inclure dans le rapport
 * @returns La nouvelle position verticale après avoir ajouté cette section
 */
export const addAbsencesSection = (doc: jsPDF, y: number, absences: PersonnelAbsence[]): number => {
  y = addSectionTitle(doc, "Absences du personnel", y);

  if (absences.length > 0) {
    // En-tête du tableau
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 40, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Nom", 15, y + 7);
    doc.rect(54, y, 40, 10, "F");
    doc.text("Raison", 55, y + 7);
    doc.rect(94, y, 30, 10, "F");
    doc.text("Début", 95, y + 7);
    doc.rect(124, y, 30, 10, "F");
    doc.text("Fin", 125, y + 7);
    y += 10;

    // Contenu du tableau
    doc.setFont("helvetica", "normal");
    absences.forEach((absence, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y, 40, 8, "F");
        doc.rect(54, y, 40, 8, "F");
        doc.rect(94, y, 30, 8, "F");
        doc.rect(124, y, 30, 8, "F");
      }
      doc.text(truncateText(absence.personnelName, 15), 15, y + 6);
      doc.text(truncateText(absence.reason, 15), 55, y + 6);
      doc.text(formatDate(absence.startDate), 95, y + 6);
      doc.text(formatDate(absence.endDate), 125, y + 6);
      y += 8;
    });
  } else {
    doc.text("Aucune absence enregistrée", 14, y + 6);
    y += 10;
  }

  return y;
};
