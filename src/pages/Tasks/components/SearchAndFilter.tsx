
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import CategoryFilter from '@/components/CategoryFilter';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="w-full sm:w-auto relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher..."
          className="pl-8 w-full sm:w-[300px]"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onChange={onCategoryChange} 
      />
    </div>
  );
};

export default SearchAndFilter;
