/**
 * RBAC System - Central Export
 * 
 * Import all RBAC functions from this file for convenience.
 */

// Permission constants and helpers
export {
  RESOURCES,
  ACTIONS,
  PERMISSIONS,
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  createPermission,
  createWildcard,
  getRoleLevel,
  getDefaultPermissions,
  isHigherRole,
} from './permissions';

// Permission checking functions
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasMinimumRoleLevel,
  canManageUser,
  canAssignRole,
  getEffectivePermissions,
  hasMinimumRole,
  isSuperAdmin,
  isManager,
  isStaff,
  filterManageableUsers,
  type RBACUser,
} from './check-permission';

// API route guards
export {
  getCurrentRBACUser,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireCanManageUser,
  requireSuperAdmin,
  requireAuth,
  type AuthenticatedRequest,
} from './guards';
