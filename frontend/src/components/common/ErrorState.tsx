import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while loading data.',
  onRetry
}) => {
  return (
    <div className="p-8 bg-red-50/70 border border-red-200 rounded-2xl flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-red-900 mb-1">Failed to Load Insights</h4>
      <p className="text-sm text-red-600 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
