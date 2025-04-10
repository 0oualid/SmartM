
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { InstanceCategory } from '@/utils/types';

interface CategoryBadgeProps {
  category: InstanceCategory;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getCategoryBadgeVariant = (category: InstanceCategory) => {
    switch(category) {
      case 'task': return 'default';
      case 'inspection': return 'secondary';
      case 'event': return 'outline';
      case 'reunion': return 'destructive';
      case 'rendezvous': return 'outline';
      case 'audit': return 'secondary';
      case 'other': return 'destructive';
      default: return 'default';
    }
  };

  const getCategoryLabel = (category: InstanceCategory) => {
    switch(category) {
      case 'task': return 'Tâche';
      case 'inspection': return 'Inspection';
      case 'event': return 'Événement';
      case 'reunion': return 'Réunion';
      case 'rendezvous': return 'Rendez-vous';
      case 'audit': return 'Audit';
      case 'other': return 'Autre';
      default: return category;
    }
  };

  return (
    <Badge variant={getCategoryBadgeVariant(category)}>
      {getCategoryLabel(category)}
    </Badge>
  );
};

export default CategoryBadge;
