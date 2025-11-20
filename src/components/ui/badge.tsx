import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline';
}

const variantStyles = {
  default: 'bg-gray-700 text-gray-100 border-transparent',
  success: 'bg-green-900/40 text-green-400 border-green-800',
  warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  danger: 'bg-red-900/40 text-red-400 border-red-800',
  secondary: 'bg-gray-700 text-gray-300 border-transparent',
  outline: 'text-gray-400 border-gray-600',
};

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variantClass = variantStyles[variant];
  
  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClass} ${className}`} 
      {...props} 
    />
  );
}

export { Badge };
