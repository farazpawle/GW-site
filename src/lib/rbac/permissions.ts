/**
 * RBAC Permission System
 * 
 * This file defines all permissions, roles, and their default mappings.
 * Use these constants throughout the application for permission checks.
 */

import { UserRole } from '@prisma/client';

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export const RESOURCES = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  PAGES: 'pages',
  MENU: 'menu',
  MEDIA: 'media',
  USERS: 'users',
  SETTINGS: 'settings',
  MESSAGES: 'messages',
  COLLECTIONS: 'collections',
  HOMEPAGE: 'homepage',
  DASHBOARD: 'dashboard',
} as const;

// ============================================================================
// PERMISSION ACTIONS
// ============================================================================

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  PUBLISH: 'publish',
  UPLOAD: 'upload',
  EXPORT: 'export',
  MANAGE_ROLES: 'manage_roles',
  EDIT_PERMISSIONS: 'edit_permissions',
  REPLY: 'reply',
} as const;

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Create a permission string from resource and action
 * @example createPermission('products', 'view') => 'products.view'
 */
export function createPermission(resource: string, action: string): string {
  return `${resource}.${action}`;
}

/**
 * Create a wildcard permission (grants all actions for a resource)
 * @example createWildcard('products') => 'products.*'
 */
export function createWildcard(resource: string): string {
  return `${resource}.*`;
}

// ============================================================================
// ALL PERMISSIONS
// ============================================================================

export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: createPermission(RESOURCES.PRODUCTS, ACTIONS.VIEW),
  PRODUCTS_CREATE: createPermission(RESOURCES.PRODUCTS, ACTIONS.CREATE),
  PRODUCTS_EDIT: createPermission(RESOURCES.PRODUCTS, ACTIONS.EDIT),
  PRODUCTS_DELETE: createPermission(RESOURCES.PRODUCTS, ACTIONS.DELETE),
  PRODUCTS_PUBLISH: createPermission(RESOURCES.PRODUCTS, ACTIONS.PUBLISH),
  PRODUCTS_ALL: createWildcard(RESOURCES.PRODUCTS),

  // Categories
  CATEGORIES_VIEW: createPermission(RESOURCES.CATEGORIES, ACTIONS.VIEW),
  CATEGORIES_CREATE: createPermission(RESOURCES.CATEGORIES, ACTIONS.CREATE),
  CATEGORIES_EDIT: createPermission(RESOURCES.CATEGORIES, ACTIONS.EDIT),
  CATEGORIES_DELETE: createPermission(RESOURCES.CATEGORIES, ACTIONS.DELETE),
  CATEGORIES_ALL: createWildcard(RESOURCES.CATEGORIES),

  // Pages
  PAGES_VIEW: createPermission(RESOURCES.PAGES, ACTIONS.VIEW),
  PAGES_CREATE: createPermission(RESOURCES.PAGES, ACTIONS.CREATE),
  PAGES_EDIT: createPermission(RESOURCES.PAGES, ACTIONS.EDIT),
  PAGES_DELETE: createPermission(RESOURCES.PAGES, ACTIONS.DELETE),
  PAGES_PUBLISH: createPermission(RESOURCES.PAGES, ACTIONS.PUBLISH),
  PAGES_ALL: createWildcard(RESOURCES.PAGES),

  // Menu
  MENU_VIEW: createPermission(RESOURCES.MENU, ACTIONS.VIEW),
  MENU_CREATE: createPermission(RESOURCES.MENU, ACTIONS.CREATE),
  MENU_EDIT: createPermission(RESOURCES.MENU, ACTIONS.EDIT),
  MENU_DELETE: createPermission(RESOURCES.MENU, ACTIONS.DELETE),
  MENU_ALL: createWildcard(RESOURCES.MENU),

  // Media
  MEDIA_VIEW: createPermission(RESOURCES.MEDIA, ACTIONS.VIEW),
  MEDIA_UPLOAD: createPermission(RESOURCES.MEDIA, ACTIONS.UPLOAD),
  MEDIA_DELETE: createPermission(RESOURCES.MEDIA, ACTIONS.DELETE),
  MEDIA_ALL: createWildcard(RESOURCES.MEDIA),

  // Users
  USERS_VIEW: createPermission(RESOURCES.USERS, ACTIONS.VIEW),
  USERS_CREATE: createPermission(RESOURCES.USERS, ACTIONS.CREATE),
  USERS_EDIT: createPermission(RESOURCES.USERS, ACTIONS.EDIT),
  USERS_DELETE: createPermission(RESOURCES.USERS, ACTIONS.DELETE),
  USERS_MANAGE_ROLES: createPermission(RESOURCES.USERS, ACTIONS.MANAGE_ROLES),
  USERS_EDIT_PERMISSIONS: createPermission(RESOURCES.USERS, ACTIONS.EDIT_PERMISSIONS),
  USERS_ALL: createWildcard(RESOURCES.USERS),

  // Settings
  SETTINGS_VIEW: createPermission(RESOURCES.SETTINGS, ACTIONS.VIEW),
  SETTINGS_EDIT: createPermission(RESOURCES.SETTINGS, ACTIONS.EDIT),
  SETTINGS_ALL: createWildcard(RESOURCES.SETTINGS),

  // Messages
  MESSAGES_VIEW: createPermission(RESOURCES.MESSAGES, ACTIONS.VIEW),
  MESSAGES_DELETE: createPermission(RESOURCES.MESSAGES, ACTIONS.DELETE),
  MESSAGES_ALL: createWildcard(RESOURCES.MESSAGES),

  // Collections
  COLLECTIONS_VIEW: createPermission(RESOURCES.COLLECTIONS, ACTIONS.VIEW),
  COLLECTIONS_CREATE: createPermission(RESOURCES.COLLECTIONS, ACTIONS.CREATE),
  COLLECTIONS_EDIT: createPermission(RESOURCES.COLLECTIONS, ACTIONS.EDIT),
  COLLECTIONS_DELETE: createPermission(RESOURCES.COLLECTIONS, ACTIONS.DELETE),
  COLLECTIONS_ALL: createWildcard(RESOURCES.COLLECTIONS),

  // Homepage CMS
  HOMEPAGE_VIEW: createPermission(RESOURCES.HOMEPAGE, ACTIONS.VIEW),
  HOMEPAGE_EDIT: createPermission(RESOURCES.HOMEPAGE, ACTIONS.EDIT),
  HOMEPAGE_ALL: createWildcard(RESOURCES.HOMEPAGE),

  // Dashboard - Granular permissions for each dashboard element
  DASHBOARD_VIEW: createPermission(RESOURCES.DASHBOARD, ACTIONS.VIEW), // Basic dashboard access
  DASHBOARD_MESSAGE_CENTER: createPermission(RESOURCES.DASHBOARD, 'message_center'),
  DASHBOARD_ENGAGEMENT_OVERVIEW: createPermission(RESOURCES.DASHBOARD, 'engagement_overview'),
  DASHBOARD_PRODUCT_INSIGHTS: createPermission(RESOURCES.DASHBOARD, 'product_insights'),
  DASHBOARD_SEARCH_ANALYTICS: createPermission(RESOURCES.DASHBOARD, 'search_analytics'),
  DASHBOARD_STATISTICS: createPermission(RESOURCES.DASHBOARD, 'statistics'),
  DASHBOARD_RECENT_ACTIVITY: createPermission(RESOURCES.DASHBOARD, 'recent_activity'),
  DASHBOARD_ALL: createWildcard(RESOURCES.DASHBOARD),
} as const;

// ============================================================================
// ROLE HIERARCHY LEVELS
// ============================================================================

export const ROLE_LEVELS = {
  SUPER_ADMIN: 100,
  ADMIN: 50,
  STAFF: 20,
  CONTENT_EDITOR: 15,
  VIEWER: 10,
} as const;

// ============================================================================
// DEFAULT ROLE PERMISSIONS
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    PERMISSIONS.PRODUCTS_ALL,
    PERMISSIONS.CATEGORIES_ALL,
    PERMISSIONS.PAGES_ALL,
    PERMISSIONS.MENU_ALL,
    PERMISSIONS.MEDIA_ALL,
    PERMISSIONS.USERS_ALL,
    PERMISSIONS.SETTINGS_ALL,
    PERMISSIONS.MESSAGES_ALL,
    PERMISSIONS.COLLECTIONS_ALL,
    PERMISSIONS.HOMEPAGE_ALL,
    PERMISSIONS.DASHBOARD_ALL, // Full dashboard access including all elements
  ],
  
  ADMIN: [
    PERMISSIONS.PRODUCTS_ALL,
    PERMISSIONS.CATEGORIES_ALL,
    PERMISSIONS.PAGES_ALL,
    PERMISSIONS.MENU_ALL,
    PERMISSIONS.MEDIA_ALL,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    // NOT users.manage_roles - cannot change roles
    PERMISSIONS.MESSAGES_ALL,
    PERMISSIONS.COLLECTIONS_ALL,
    PERMISSIONS.HOMEPAGE_ALL,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_MESSAGE_CENTER,
    PERMISSIONS.DASHBOARD_ENGAGEMENT_OVERVIEW,
    PERMISSIONS.DASHBOARD_PRODUCT_INSIGHTS,
    PERMISSIONS.DASHBOARD_SEARCH_ANALYTICS,
    PERMISSIONS.DASHBOARD_STATISTICS,
    PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,
  ],
  
  STAFF: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.PAGES_EDIT,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT, // Limited to VIEWER only (enforced in code)
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.HOMEPAGE_VIEW,
    PERMISSIONS.HOMEPAGE_EDIT,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_MESSAGE_CENTER,
    PERMISSIONS.DASHBOARD_STATISTICS,
    PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,
  ],
  
  CONTENT_EDITOR: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.PAGES_CREATE,
    PERMISSIONS.PAGES_EDIT,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.HOMEPAGE_VIEW,
    PERMISSIONS.HOMEPAGE_EDIT,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_MESSAGE_CENTER,
    PERMISSIONS.DASHBOARD_RECENT_ACTIVITY,
  ],
  
  VIEWER: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PAGES_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MEDIA_VIEW,
    PERMISSIONS.MESSAGES_VIEW,
    PERMISSIONS.HOMEPAGE_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_STATISTICS,
    PERMISSIONS.COLLECTIONS_VIEW,
  ],
};

// ============================================================================
// PERMISSION DESCRIPTIONS (for UI)
// ============================================================================

export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  // Products
  [PERMISSIONS.PRODUCTS_VIEW]: 'View products list and details',
  [PERMISSIONS.PRODUCTS_CREATE]: 'Create new products',
  [PERMISSIONS.PRODUCTS_EDIT]: 'Edit existing products',
  [PERMISSIONS.PRODUCTS_DELETE]: 'Delete products permanently',
  [PERMISSIONS.PRODUCTS_PUBLISH]: 'Publish or unpublish products',
  [PERMISSIONS.PRODUCTS_ALL]: 'All product permissions',

  // Categories
  [PERMISSIONS.CATEGORIES_VIEW]: 'View product categories',
  [PERMISSIONS.CATEGORIES_CREATE]: 'Create new categories',
  [PERMISSIONS.CATEGORIES_EDIT]: 'Edit existing categories',
  [PERMISSIONS.CATEGORIES_DELETE]: 'Delete categories',
  [PERMISSIONS.CATEGORIES_ALL]: 'All category permissions',

  // Pages
  [PERMISSIONS.PAGES_VIEW]: 'View CMS pages',
  [PERMISSIONS.PAGES_CREATE]: 'Create new pages',
  [PERMISSIONS.PAGES_EDIT]: 'Edit existing pages',
  [PERMISSIONS.PAGES_DELETE]: 'Delete pages',
  [PERMISSIONS.PAGES_PUBLISH]: 'Publish or unpublish pages',
  [PERMISSIONS.PAGES_ALL]: 'All page permissions',

  // Menu
  [PERMISSIONS.MENU_VIEW]: 'View menu items',
  [PERMISSIONS.MENU_CREATE]: 'Create new menu items',
  [PERMISSIONS.MENU_EDIT]: 'Edit menu items',
  [PERMISSIONS.MENU_DELETE]: 'Delete menu items',
  [PERMISSIONS.MENU_ALL]: 'All menu permissions',

  // Media
  [PERMISSIONS.MEDIA_VIEW]: 'View media library',
  [PERMISSIONS.MEDIA_UPLOAD]: 'Upload new media files',
  [PERMISSIONS.MEDIA_DELETE]: 'Delete media files',
  [PERMISSIONS.MEDIA_ALL]: 'All media permissions',

  // Users
  [PERMISSIONS.USERS_VIEW]: 'View user list',
  [PERMISSIONS.USERS_CREATE]: 'Create new users',
  [PERMISSIONS.USERS_EDIT]: 'Edit user accounts',
  [PERMISSIONS.USERS_DELETE]: 'Delete users',
  [PERMISSIONS.USERS_MANAGE_ROLES]: 'Assign and change user roles (Super Admin only)',
  [PERMISSIONS.USERS_EDIT_PERMISSIONS]: 'Edit user permissions (Super Admin only)',
  [PERMISSIONS.USERS_ALL]: 'All user management permissions',

  // Settings
  [PERMISSIONS.SETTINGS_VIEW]: 'View system settings',
  [PERMISSIONS.SETTINGS_EDIT]: 'Modify system settings',
  [PERMISSIONS.SETTINGS_ALL]: 'All settings permissions',

  // Messages
  [PERMISSIONS.MESSAGES_VIEW]: 'View customer messages',
  [PERMISSIONS.MESSAGES_DELETE]: 'Delete messages',
  [PERMISSIONS.MESSAGES_ALL]: 'All message permissions',

  // Collections
  [PERMISSIONS.COLLECTIONS_VIEW]: 'View product collections',
  [PERMISSIONS.COLLECTIONS_CREATE]: 'Create new collections',
  [PERMISSIONS.COLLECTIONS_EDIT]: 'Edit collections',
  [PERMISSIONS.COLLECTIONS_DELETE]: 'Delete collections',
  [PERMISSIONS.COLLECTIONS_ALL]: 'All collection permissions',

  // Homepage CMS
  [PERMISSIONS.HOMEPAGE_VIEW]: 'View homepage content and sections',
  [PERMISSIONS.HOMEPAGE_EDIT]: 'Edit homepage content and layout',
  [PERMISSIONS.HOMEPAGE_ALL]: 'All homepage CMS permissions',

  // Dashboard - Granular access to specific dashboard elements
  [PERMISSIONS.DASHBOARD_VIEW]: 'Access admin dashboard and overview',
  [PERMISSIONS.DASHBOARD_MESSAGE_CENTER]: 'View and manage message center on dashboard',
  [PERMISSIONS.DASHBOARD_ENGAGEMENT_OVERVIEW]: 'View engagement analytics and charts',
  [PERMISSIONS.DASHBOARD_PRODUCT_INSIGHTS]: 'View top products and performance insights',
  [PERMISSIONS.DASHBOARD_SEARCH_ANALYTICS]: 'View search analytics and trends',
  [PERMISSIONS.DASHBOARD_STATISTICS]: 'View statistics cards (users, products, categories)',
  [PERMISSIONS.DASHBOARD_RECENT_ACTIVITY]: 'View recent activity and products',
  [PERMISSIONS.DASHBOARD_ALL]: 'All dashboard permissions',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the role level number for a given role
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_LEVELS[role] || ROLE_LEVELS.VIEWER;
}

/**
 * Get default permissions for a role
 */
export function getDefaultPermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;
}

/**
 * Check if a role is higher than another role
 */
export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}
