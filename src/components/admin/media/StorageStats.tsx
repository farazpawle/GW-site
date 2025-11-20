import { FileImage, HardDrive } from 'lucide-react';

interface StorageStatsProps {
  totalFiles: number;
  totalSize: string;
  loading?: boolean;
}

export default function StorageStats({
  totalFiles,
  totalSize,
  loading = false,
}: StorageStatsProps) {
  const stats = [
    {
      label: 'Total Files',
      value: loading ? '...' : totalFiles.toLocaleString(),
      icon: FileImage,
    },
    {
      label: 'Storage Used',
      value: loading ? '...' : totalSize,
      icon: HardDrive,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex items-center gap-3 hover:border-[#6e0000]/50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#6e0000' }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
