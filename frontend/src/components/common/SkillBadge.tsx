import React from 'react';
import { getCategoryColor } from '../../utils/formatters';
import { X } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  category?: string;
  count?: number;
  pct?: number;
  onRemove?: () => void;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  category,
  count,
  pct,
  onRemove,
  onClick,
  size = 'md'
}) => {
  const colorClass = getCategoryColor(category);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${sizeClasses[size]} ${colorClass} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
    >
      <span>{name}</span>
      {count !== undefined && (
        <span className="text-[10px] px-1.5 py-0.2 bg-white/70 rounded-full font-semibold">
          {count}
        </span>
      )}
      {pct !== undefined && (
        <span className="text-[10px] font-semibold opacity-75">
          {pct}%
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-red-500 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
