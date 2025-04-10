import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePDF, handlePDFOutput } from '@/utils/pdfUtils';

export const useReportGenerator = () => {
  const [selectedDomains, setSelectedDomains] = useState({
    equipment: true,
    personnel: true,
    finance: true,
    tasks: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleCheckboxChange = (domain: string) => {
    setSelectedDomains(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Générer le PDF
      const doc = generatePDF();
      
      // Utilisation de la nouvelle fonction pour gérer le PDF selon la plateforme
      const fileName = `SmartM_Report_${selectedMonth.replace('-', '_')}.pdf`;
      const success = await handlePDFOutput(doc, fileName);
      
      // Afficher la notification appropriée
      if (success) {
        toast({
          title: t("Rapport généré", "Report Generated"),
          description: t(
            "Le rapport a été généré avec succès",
            "The report has been successfully generated"
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("Problème rencontré", "Issue Encountered"),
          description: t(
            "Un problème est survenu lors de la génération du rapport. Veuillez réessayer.",
            "An issue occurred while generating the report. Please try again."
          ),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: t("Erreur", "Error"),
        description: t(
          "Une erreur s'est produite lors de la génération du rapport",
          "An error occurred while generating the report"
        ),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const areDomainsSelected = Object.values(selectedDomains).some(Boolean);

  return {
    selectedDomains,
    isGenerating,
    selectedMonth,
    setSelectedMonth,
    handleCheckboxChange,
    generateReport,
    areDomainsSelected
  };
};
