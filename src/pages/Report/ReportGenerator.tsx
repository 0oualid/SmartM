
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportGeneratorCard from './components/ReportGeneratorCard';
import { useReportGenerator } from './hooks/useReportGenerator';

const ReportGenerator = () => {
  const {
    selectedDomains,
    isGenerating,
    selectedMonth,
    setSelectedMonth,
    handleCheckboxChange,
    generateReport,
    areDomainsSelected
  } = useReportGenerator();

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link to="/dashboard" className="flex items-center text-muted-foreground mb-2 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Générateur de rapport</h1>
          <p className="text-muted-foreground">Sélectionnez les domaines à inclure dans votre rapport</p>
        </div>
      </header>

      <ReportGeneratorCard
        selectedDomains={selectedDomains}
        handleCheckboxChange={handleCheckboxChange}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        isGenerating={isGenerating}
        generateReport={generateReport}
        areDomainsSelected={areDomainsSelected}
      />
    </div>
  );
};

export default ReportGenerator;
