
import React from 'react';
import { Label } from "@/components/ui/label";
import { Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const MonthSelector = ({ selectedMonth, setSelectedMonth }: MonthSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Filtrer par mois (Finance)</h3>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="month">Sélectionner un mois</Label>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
};

export default MonthSelector;
