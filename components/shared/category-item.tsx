'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface CategoryProps {
  category: {
    _id: string;
    name: string;
    slug: string;
    children?: CategoryProps['category'][];
  };
}

const CategoryItem = ({ category }: CategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="category-group">
      <div
        className={`category-parent ${isExpanded ? 'expanded' : ''}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
      >
        <span>{category.name}</span>
        {hasChildren && (
          <ChevronRight className={`h-4 w-4 ${isExpanded ? 'rotate-90' : ''}`} />
        )}
      </div>
      
      {hasChildren && (
        <div className={`child-categories ${isExpanded ? 'expanded' : ''}`}>
          {category.children.map((child) => (
            <Link
              key={child._id}
              href={`./search?category=${child.slug}`}
              className="child-link"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
