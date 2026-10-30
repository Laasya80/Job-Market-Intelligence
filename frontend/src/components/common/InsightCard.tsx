import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Info } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  category?: 'growth' | 'salary' | 'role' | 'alert';
  impact?: 'positive' | 'neutral' | 'negative';
  metric?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  category = 'growth',
  impact = 'positive',
  metric
}) => {
  const getIcon = () => {
    switch (category) {
      case 'growth':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'salary':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBorderColor = () => {
    switch (impact) {
      case 'positive':
        return 'border-l-4 border-l-emerald-500 bg-emerald-50/20';
      case 'negative':
        return 'border-l-4 border-l-rose-500 bg-rose-50/20';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50/20';
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-slate-200/80 shadow-xs ${getBorderColor()}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white shadow-xs border border-slate-100">
            {getIcon()}
          </div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        </div>
        {metric && (
          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
            {metric}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{description}</p>
    </div>
  );
};
