/**
 * Admin Configuration
 *
 * This file centralizes the admin configuration for the application.
 * By keeping admin emails in one place, it's easier to manage and update.
 */

/**
 * List of admin email addresses
 * These users will have access to admin features
 *
 * Note: This is a fallback mechanism. The preferred way to manage admin users
 * is through the Admin Settings page, which updates user metadata and the profiles table.
 */
export const ADMIN_EMAILS: string[] = [
  'nakupi@si.si',
  // Add more admin emails here as needed
];

/**
 * Checks if a given email is an admin email
 *
 * @param email The email to check
 * @returns True if the email is an admin email, false otherwise
 *
 * Note: This is a fallback mechanism. The preferred way to check admin status
 * is through the isAdminUser function in userManagement.ts, which checks
 * user metadata and the profiles table.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

/**
 * Admin session timeout in milliseconds (30 minutes)
 */
export const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Regular user session timeout in milliseconds (2 hours)
 */
export const USER_SESSION_TIMEOUT = 2 * 60 * 60 * 1000;
