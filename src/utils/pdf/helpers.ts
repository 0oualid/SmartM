
// Utilitaires partagés pour la génération de PDF

/**
 * Tronque le texte pour qu'il tienne dans la largeur du PDF
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + "...";
  }
  return text;
};

/**
 * Formate les dates pour l'affichage dans le PDF
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

/**
 * Traduit les catégories d'instances
 */
export const translateCategory = (category: string): string => {
  switch(category) {
    case 'task': return "Tâche";
    case 'inspection': return "Inspection";
    case 'event': return "Événement";
    case 'reunion': return "Réunion";
    case 'rendezvous': return "Rendez-vous";
    case 'audit': return "Audit";
    case 'other': return "Autre";
    default: return category;
  }
};

/**
 * Traduit le statut d'équipement
 */
export const translateEquipmentStatus = (status: string): string => {
  if (status === "operational" || status === "Opérationnel") return "Opérationnel";
  else if (status === "maintenance" || status === "En maintenance") return "En maintenance";
  else if (status === "outOfService" || status === "Hors service") return "Hors service";
  return status;
};

/**
 * Ajoute un en-tête professionnel au document PDF
 */
export const addHeader = (doc: jsPDF, title: string): void => {
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 105, 8, { align: "center" });
};

/**
 * Ajoute un pied de page au document PDF
 */
export const addFooter = (doc: jsPDF): void => {
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("SmartM © " + new Date().getFullYear() + " - Document généré automatiquement", 105, 285, { align: "center" });
};

/**
 * Ajoute une section avec titre au PDF
 */
export const addSectionTitle = (doc: jsPDF, title: string, y: number): number => {
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.setFillColor(220, 230, 240);
  doc.rect(10, y, 190, 8, 'F');
  doc.text(title, 14, y + 6);
  return y + 15;
};

// Import jsPDF pour le typage
import { jsPDF } from "jspdf";
