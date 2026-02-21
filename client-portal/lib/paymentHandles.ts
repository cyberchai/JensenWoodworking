/**
 * SECURE PAYMENT HANDLES
 * 
 * These handles are hardcoded and cannot be changed through the UI.
 * They are enforced at the store layer to prevent tampering.
 * 
 * DO NOT EXPOSE THESE VALUES IN CLIENT-SIDE CODE IF YOU WANT MAXIMUM SECURITY.
 * For production, consider moving these to environment variables or a secure backend.
 */

// Payment handles - hardcoded for security
export const SECURE_VENMO_HANDLE = 'klaus-jensen';
export const SECURE_PAYPAL_HANDLE = 'klausduxbury';

/**
 * Validates and returns the secure payment handles.
 * This function ensures the handles cannot be overridden.
 */
export function getSecurePaymentHandles(): { venmoHandle: string; paypalHandle: string } {
  return {
    venmoHandle: SECURE_VENMO_HANDLE,
    paypalHandle: SECURE_PAYPAL_HANDLE,
  };
}

/**
 * Validates that payment handles match the secure values.
 * Throws an error if handles are tampered with.
 */
export function validatePaymentHandles(venmoHandle: string, paypalHandle: string): void {
  if (venmoHandle !== SECURE_VENMO_HANDLE) {
    throw new Error('Invalid Venmo handle: Payment handles cannot be modified');
  }
  if (paypalHandle !== SECURE_PAYPAL_HANDLE) {
    throw new Error('Invalid PayPal handle: Payment handles cannot be modified');
  }
}

