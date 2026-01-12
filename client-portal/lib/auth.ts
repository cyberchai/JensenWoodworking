import { User } from 'firebase/auth';

// Allowed admin emails
const ALLOWED_ADMIN_EMAILS = [
  'kpnjensen@gmail.com',
  'chairachananharder@gmail.com'
];

/**
 * Check if a user is an authorized admin
 */
export function isAdminUser(user: User | null): boolean {
  if (!user || !user.email) {
    return false;
  }
  
  return ALLOWED_ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/**
 * Get the user's email (normalized to lowercase)
 */
export function getUserEmail(user: User | null): string | null {
  return user?.email?.toLowerCase() || null;
}
