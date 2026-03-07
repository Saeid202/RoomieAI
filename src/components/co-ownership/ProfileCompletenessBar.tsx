// Profile Completeness Bar Component
// Part of Co-Ownership Profile feature

import { CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletenessBarProps {
  percentage: number;
  className?: string;
}

export function ProfileCompletenessBar({ 
  percentage, 
  className = '' 
}: ProfileCompletenessBarProps) {
  const getStatusColor = () => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (percentage === 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getStatusIcon = () => {
    if (percentage === 100) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-600" />;
  };

  const getStatusMessage = () => {
    if (percentage === 100) return 'Profile Complete!';
    if (percentage >= 75) return 'Almost there!';
    if (percentage >= 50) return 'Good progress';
    if (percentage >= 25) return 'Getting started';
    return 'Just beginning';
  };

  return (
    <div className={`bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="text-sm font-bold text-slate-900">
            Profile Completeness
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${getStatusColor()}`}>
            {percentage}%
          </span>
        </div>
      </div>

      <Progress 
        value={percentage} 
        className="h-3 mb-2"
        indicatorClassName={getProgressColor()}
      />

      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-600">
          {getStatusMessage()}
        </p>
        {percentage < 100 && (
          <p className="text-xs text-slate-500">
            Fill in more fields to increase your match potential
          </p>
        )}
      </div>
    </div>
  );
}
