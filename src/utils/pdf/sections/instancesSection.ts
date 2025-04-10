
import { jsPDF } from "jspdf";
import { truncateText, formatDate, addSectionTitle, translateCategory } from "../helpers";
import { Instance } from "../../types";

/**
 * Génère la section des instances dans le rapport PDF
 * 
 * @param doc - Le document PDF en cours de génération
 * @param y - La position verticale actuelle dans le document
 * @param instances - La liste des instances à inclure dans le rapport
 * @returns La nouvelle position verticale après avoir ajouté cette section
 */
export const addInstancesSection = (doc: jsPDF, y: number, instances: Instance[]): number => {
  y = addSectionTitle(doc, "Instances", y);
  
  if (instances.length > 0) {
    // En-tête du tableau - ajout de la colonne "Catégorie"
    doc.setFillColor(230, 230, 230);
    doc.rect(10, y, 15, 10, "F"); // ID
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ID", 15, y + 7);
    
    doc.rect(25, y, 35, 10, "F"); // Titre
    doc.text("Titre", 30, y + 7);
    
    doc.rect(60, y, 30, 10, "F"); // Catégorie
    doc.text("Catégorie", 65, y + 7);
    
    doc.rect(90, y, 35, 10, "F"); // Assigné à
    doc.text("Assigné à", 95, y + 7);
    
    doc.rect(125, y, 30, 10, "F"); // Échéance
    doc.text("Échéance", 130, y + 7);
    
    doc.rect(155, y, 35, 10, "F"); // Statut
    doc.text("Statut", 160, y + 7);
    
    y += 10;
    
    // Contenu du tableau
    doc.setFont("helvetica", "normal");
    instances.forEach((instance, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        
        // Ajouter l'en-tête sur la nouvelle page
        doc.setFillColor(230, 230, 230);
        doc.rect(10, y, 15, 10, "F"); // ID
        doc.rect(25, y, 35, 10, "F"); // Titre
        doc.rect(60, y, 30, 10, "F"); // Catégorie
        doc.rect(90, y, 35, 10, "F"); // Assigné à
        doc.rect(125, y, 30, 10, "F"); // Échéance
        doc.rect(155, y, 35, 10, "F"); // Statut
        
        doc.setFont("helvetica", "bold");
        doc.text("ID", 15, y + 7);
        doc.text("Titre", 30, y + 7);
        doc.text("Catégorie", 65, y + 7);
        doc.text("Assigné à", 95, y + 7);
        doc.text("Échéance", 130, y + 7);
        doc.text("Statut", 160, y + 7);
        
        y += 10;
        doc.setFont("helvetica", "normal");
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y, 15, 8, "F");
        doc.rect(25, y, 35, 8, "F");
        doc.rect(60, y, 30, 8, "F");
        doc.rect(90, y, 35, 8, "F");
        doc.rect(125, y, 30, 8, "F");
        doc.rect(155, y, 35, 8, "F");
      }
      
      // Format category label
      const categoryLabel = translateCategory(instance.category);
      
      doc.text(instance.id.toString(), 15, y + 6);
      doc.text(truncateText(instance.title, 15), 30, y + 6);
      doc.text(categoryLabel, 65, y + 6);
      doc.text(truncateText(instance.assignee, 15), 95, y + 6);
      doc.text(formatDate(instance.dueDate), 130, y + 6);
      doc.text(instance.status === "completed" ? "Terminée" : "À faire", 160, y + 6);
      
      y += 8;
    });
  } else {
    doc.text("Aucune instance enregistrée", 14, y + 6);
    y += 10;
  }

  return y;
};
