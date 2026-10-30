export const formatSalaryLPA = (minLpa?: number, maxLpa?: number): string => {
  if (minLpa === undefined && maxLpa === undefined) return 'Not Disclosed';
  if (minLpa !== undefined && maxLpa !== undefined) {
    if (minLpa === maxLpa) return `₹${minLpa.toFixed(1)} LPA`;
    return `₹${minLpa.toFixed(1)} - ₹${maxLpa.toFixed(1)} LPA`;
  }
  if (maxLpa !== undefined) return `Up to ₹${maxLpa.toFixed(1)} LPA`;
  return `From ₹${minLpa?.toFixed(1)} LPA`;
};

export const formatPercent = (val: number): string => {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
};

export const getCategoryColor = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'programming':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ml/ai':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'data science':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'data engineering':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'bi/analytics':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'cloud/devops':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'database':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'web/frameworks':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
