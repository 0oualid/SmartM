
import { jsPDF } from "jspdf";
import {
  Equipment,
  EquipmentFailure,
  PersonnelAbsence,
  Personnel,
  Instance
} from "./types";
import {
  getEquipment,
  getEquipmentFailures,
  getPersonnelAbsences,
  getInstances,
  getPersonnelFromLocalStorage,
  calculateTotalOperability
} from "./localStorageService";

import { generateEquipmentReport, EquipmentReportData } from "./pdf/equipmentReportGenerator";
import { generateSystemReport } from "./pdf/systemReportGenerator";

/**
 * Point d'entrée principal pour la génération de rapports PDF
 */
export const generatePDF = (reportData?: EquipmentReportData): jsPDF => {
  // Si des données de rapport sont fournies, générer un rapport pour un équipement spécifique
  if (reportData) {
    return generateEquipmentReport(reportData);
  }

  // Sinon, générer le rapport système complet
  const operability = calculateTotalOperability();
  const personnelList = getPersonnelFromLocalStorage();
  const absences = getPersonnelAbsences();
  const equipmentList = getEquipment();
  const equipmentFailures = getEquipmentFailures();
  const instances = getInstances();

  return generateSystemReport(
    operability,
    personnelList,
    absences,
    equipmentList,
    equipmentFailures,
    instances
  );
};

/**
 * Fonction pour gérer le téléchargement ou l'ouverture du PDF selon la plateforme
 */
export const handlePDFOutput = async (doc: jsPDF, fileName: string): Promise<boolean> => {
  try {
    // Essayer de détecter si on est sur mobile (Capacitor)
    const isMobile = await isMobilePlatform();
    
    if (isMobile) {
      // Sur mobile, utiliser le partage de fichier natif
      return await sharePDFOnMobile(doc, fileName);
    } else {
      // Sur le web, ouvrir/télécharger normalement
      doc.save(fileName);
      return true;
    }
  } catch (error) {
    console.error('Erreur lors du traitement du PDF:', error);
    
    // Fallback: essayer la méthode standard
    try {
      doc.save(fileName);
      return true;
    } catch (e) {
      console.error('Échec du fallback pour le PDF:', e);
      return false;
    }
  }
};

/**
 * Vérifie si l'application est exécutée sur une plateforme mobile
 */
const isMobilePlatform = async (): Promise<boolean> => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch (error) {
    console.log('Capacitor non disponible, supposé environnement web');
    return false;
  }
};

/**
 * Partage le PDF sur mobile en utilisant les APIs natives
 */
const sharePDFOnMobile = async (doc: jsPDF, fileName: string): Promise<boolean> => {
  try {
    // Convertir le PDF en base64
    const pdfOutput = doc.output('datauristring');
    
    // Essayer d'utiliser l'API de partage de Capacitor
    const { Share } = await import('@capacitor/share');
    
    await Share.share({
      title: 'Rapport SmartM',
      text: 'Voici votre rapport',
      url: pdfOutput,
      dialogTitle: 'Partager le rapport'
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors du partage du PDF sur mobile:', error);
    
    // Fallback: essayer d'ouvrir en nouvel onglet
    try {
      const pdfOutput = doc.output('bloburl');
      window.open(pdfOutput, '_blank');
      return true;
    } catch (e) {
      console.error('Échec du fallback pour le partage mobile:', e);
      return false;
    }
  }
};
