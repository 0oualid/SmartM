
import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from 'lucide-react';
import { InstanceCategory } from '@/utils/types';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <div className="grid gap-1.5">
        <Label htmlFor="category-filter" className="text-xs">Filtrer par catégorie</Label>
        <Select
          value={selectedCategory}
          onValueChange={onChange}
        >
          <SelectTrigger id="category-filter" className="w-[180px]">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="task">Tâche</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="event">Événement</SelectItem>
            <SelectItem value="reunion">Réunion</SelectItem>
            <SelectItem value="rendezvous">Rendez-vous</SelectItem>
            <SelectItem value="audit">Audit</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CategoryFilter;
