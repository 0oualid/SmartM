
import { jsPDF } from "jspdf";
import { addSectionTitle } from "../helpers";

/**
 * Génère la section d'opérabilité dans le rapport PDF
 * 
 * @param doc - Le document PDF en cours de génération
 * @param y - La position verticale actuelle dans le document
 * @param operability - Le pourcentage d'opérabilité du système
 * @returns La nouvelle position verticale après avoir ajouté cette section
 */
export const addOperabilitySection = (doc: jsPDF, y: number, operability: number): number => {
  y = addSectionTitle(doc, "Opérabilité", y);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Opérabilité totale: ${operability}%`, 14, y);
  
  return y + 10;
};
