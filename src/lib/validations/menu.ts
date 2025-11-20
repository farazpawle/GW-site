import { z } from "zod";

// Menu Item Schema with XOR validation (either pageId OR externalUrl, not both)
export const menuItemSchema = z
  .object({
    label: z
      .string()
      .min(1, "Label is required")
      .max(50, "Label must be less than 50 characters"),
    position: z.number().min(0, "Position must be 0 or greater"),
    visible: z.boolean(),
    openNewTab: z.boolean(),
    
    // Multi-level menu support
    parentId: z.string().nullable().optional(), // NULL = top-level, ID = submenu item
    
    // Link options (XOR - either page or external URL)
    pageId: z.string().nullable().optional(),
    externalUrl: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Either pageId OR externalUrl must be set, not both, not neither
      const hasPage = !!data.pageId && data.pageId !== null;
      const hasUrl = !!data.externalUrl && data.externalUrl !== null;
      
      // XOR: (hasPage AND NOT hasUrl) OR (hasUrl AND NOT hasPage)
      return (hasPage && !hasUrl) || (hasUrl && !hasPage);
    },
    {
      message: "Menu item must link to either a page OR an external URL, not both and not neither",
      path: ["pageId"], // Error will be associated with pageId field
    }
  );

// Create Menu Item Schema
export const createMenuItemSchema = menuItemSchema;

// Update Menu Item Schema (all fields optional except link validation)
export const updateMenuItemSchema = menuItemSchema.partial().refine(
  (data) => {
    // If either is provided, ensure XOR rule
    if (data.pageId !== undefined || data.externalUrl !== undefined) {
      // Check for actual values, not just null
      const hasPage = !!data.pageId && data.pageId !== null;
      const hasUrl = !!data.externalUrl && data.externalUrl !== null;
      
      // XOR: exactly one must be true
      return (hasPage && !hasUrl) || (hasUrl && !hasPage);
    }
    return true; // If neither field is being updated, allow it
  },
  {
    message: "Menu item must link to either a page OR an external URL, not both",
    path: ["pageId"],
  }
);

// Menu Reorder Schema (for bulk position updates via drag-drop)
export const menuReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      position: z.number().min(0),
    })
  ).min(1, "At least one menu item must be provided"),
});

// Type exports
export type MenuItemFormData = z.infer<typeof menuItemSchema>;
export type MenuReorderData = z.infer<typeof menuReorderSchema>;

/**
 * Validates if menu item links are correctly configured
 * @param pageId - Optional page ID
 * @param externalUrl - Optional external URL
 * @returns True if exactly one is provided
 */
export function validateMenuItemLink(
  pageId?: string | null,
  externalUrl?: string | null
): boolean {
  const hasPage = !!pageId;
  const hasUrl = !!externalUrl;
  return (hasPage && !hasUrl) || (hasUrl && !hasPage);
}

/**
 * Gets the target URL for a menu item
 * @param menuItem - Menu item with pageId or externalUrl
 * @param pageSlug - Optional page slug if linking to a page
 * @returns The URL to navigate to
 */
export function getMenuItemUrl(
  menuItem: { pageId?: string | null; externalUrl?: string | null },
  pageSlug?: string
): string {
  if (menuItem.externalUrl) {
    return menuItem.externalUrl;
  }
  if (menuItem.pageId && pageSlug) {
    return `/pages/${pageSlug}`;
  }
  return "#"; // Fallback
}
