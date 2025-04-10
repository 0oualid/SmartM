
import { jsPDF } from "jspdf";
import { addHeader, addFooter } from "./helpers";
import { 
  Equipment, 
  EquipmentFailure, 
  Personnel, 
  PersonnelAbsence, 
  Instance 
} from "../types";

// Import des sections refactorisées
import { addOperabilitySection } from "./sections/operabilitySection";
import { addPersonnelSection } from "./sections/personnelSection";
import { addAbsencesSection } from "./sections/absencesSection";
import { addEquipmentSection } from "./sections/equipmentSection";
import { addEquipmentFailuresSection } from "./sections/equipmentFailuresSection";
import { addInstancesSection } from "./sections/instancesSection";

/**
 * Génère un rapport PDF complet du système
 * 
 * @param operability - Le pourcentage d'opérabilité du système
 * @param personnelList - La liste du personnel à inclure dans le rapport
 * @param absences - La liste des absences du personnel à inclure dans le rapport
 * @param equipmentList - La liste des équipements à inclure dans le rapport
 * @param equipmentFailures - La liste des avaries d'équipement à inclure dans le rapport
 * @param instances - La liste des instances à inclure dans le rapport
 * @returns Un document PDF contenant toutes les sections du rapport
 */
export const generateSystemReport = (
  operability: number,
  personnelList: Personnel[],
  absences: PersonnelAbsence[],
  equipmentList: Equipment[],
  equipmentFailures: EquipmentFailure[],
  instances: Instance[]
): jsPDF => {
  const doc = new jsPDF();

  // Titre du document
  doc.setFontSize(20);
  doc.text("Rapport SmartM", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: "center" });

  // Ajouter l'en-tête
  addHeader(doc, "Rapport de gestion");

  let y = 50;

  // Section d'opérabilité
  y = addOperabilitySection(doc, y, operability);
  y += 10;

  // Section du personnel
  y = addPersonnelSection(doc, y, personnelList);
  y += 10;

  // Section des absences
  y = addAbsencesSection(doc, y, absences);
  y += 10;

  // Section des équipements
  y = addEquipmentSection(doc, y, equipmentList);
  y += 10;

  // Section des avaries d'équipement
  y = addEquipmentFailuresSection(doc, y, equipmentFailures);
  y += 10;

  // Section des instances
  y = addInstancesSection(doc, y, instances);

  // Ajouter le pied de page
  addFooter(doc);

  return doc;
};
