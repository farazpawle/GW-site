'use client';

import { LayoutGrid, List, Grid3x3 } from 'lucide-react';

export type ViewMode = 'grid' | 'list' | 'compact';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

const viewModes = [
  {
    mode: 'grid' as ViewMode,
    icon: LayoutGrid,
    label: 'Grid',
    description: 'Large thumbnails (3-8 per row)',
  },
  {
    mode: 'compact' as ViewMode,
    icon: Grid3x3,
    label: 'Compact',
    description: 'Small thumbnails (more per row)',
  },
  {
    mode: 'list' as ViewMode,
    icon: List,
    label: 'List',
    description: 'Detailed list view',
  },
];

export default function ViewModeSelector({
  viewMode,
  onViewModeChange,
  disabled = false,
}: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
      {viewModes.map((mode) => {
        const Icon = mode.icon;
        const isActive = viewMode === mode.mode;
        
        return (
          <button
            key={mode.mode}
            onClick={() => onViewModeChange(mode.mode)}
            disabled={disabled}
            title={`${mode.label} - ${mode.description}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-[#6e0000] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
