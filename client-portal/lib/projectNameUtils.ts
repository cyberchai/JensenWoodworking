/**
 * Project Name Utilities
 * 
 * Functions for normalizing and slugifying project names for use as URL tokens
 */

/**
 * Normalizes a project name for uniqueness checking
 * - Converts to lowercase
 * - Trims whitespace
 * - Used for case-insensitive duplicate detection
 */
export function normalizeProjectName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Slugifies a project name for use as a URL token
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters (keeps alphanumeric and hyphens)
 * - Collapses multiple consecutive hyphens into one
 * - Trims hyphens from start and end
 * 
 * Examples:
 * - "Custom Walnut Table" → "custom-walnut-table"
 * - "Kitchen Island 2024" → "kitchen-island-2024"
 * - "Table & Chairs" → "table-chairs"
 * - "Project   Name" → "project-name"
 */
export function slugifyProjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove all characters except alphanumeric and hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Collapse multiple consecutive hyphens into one
    .replace(/-+/g, '-')
    // Remove hyphens from start and end
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates that a project name can be slugified to a valid token
 * Returns true if the name will produce a non-empty slug
 */
export function isValidProjectName(name: string): boolean {
  const slug = slugifyProjectName(name);
  return slug.length > 0;
}
