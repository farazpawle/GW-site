import { Folder } from 'lucide-react';
import type { BucketInfo } from '@/types/media';

interface FolderFilterProps {
  folders: BucketInfo[];
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  loading?: boolean;
}

// Format folder name for display
function formatFolderName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function FolderFilter({
  folders,
  activeFolder,
  onFolderChange,
  loading = false,
}: FolderFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {folders.map((folder) => {
        const isActive = folder.name === activeFolder;
        return (
          <button
            key={folder.name}
            onClick={() => onFolderChange(folder.name)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-[#6e0000] border-[#6e0000] text-white shadow-lg shadow-[#6e0000]/20'
                : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#6e0000]/50 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>{formatFolderName(folder.name)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              isActive ? 'bg-white/20' : 'bg-[#2a2a2a]'
            }`}>
              {folder.fileCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
