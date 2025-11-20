import { UserRole } from '@prisma/client';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

/**
 * RoleBadge Component
 * 
 * Displays a color-coded badge for user roles
 * - SUPER_ADMIN: Gold gradient
 * - ADMIN: Blue
 * - STAFF: Green
 * - CONTENT_EDITOR: Cyan
 * - VIEWER: Gray
 */
export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  // SUPER_ADMIN: Gold gradient
  if (role === 'SUPER_ADMIN') {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
          bg-gradient-to-r from-yellow-600 to-amber-600 text-white border-yellow-500/20
          ${className}
        `}
      >
        Super Admin
      </span>
    );
  }

  const styles = {
    ADMIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    STAFF: 'bg-green-500/20 text-green-400 border-green-500/30',
    CONTENT_EDITOR: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    VIEWER: 'bg-gray-800 text-gray-300 border-gray-700'
  };

  const displayText = {
    ADMIN: 'Admin',
    STAFF: 'Staff',
    CONTENT_EDITOR: 'Content Editor',
    VIEWER: 'Viewer'
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
        ${styles[role as keyof typeof styles] || 'bg-gray-800 text-gray-300 border-gray-700'}
        ${className}
      `}
    >
      {displayText[role as keyof typeof displayText] || role}
    </span>
  );
}
