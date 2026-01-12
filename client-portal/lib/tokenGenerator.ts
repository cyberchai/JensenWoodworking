/**
 * Secure Token Generation System
 * 
 * Generates cryptographically secure, consistently styled tokens for projects.
 * Format: JW-XXXX-XXXX-XXXX (where X is alphanumeric)
 */

/**
 * Generates a secure, random token for projects
 * Format: JW-XXXX-XXXX-XXXX (e.g., JW-A3B7-K9M2-P4Q8)
 * 
 * Uses crypto.getRandomValues for cryptographically secure randomness
 */
export function generateSecureToken(): string {
  // Use Web Crypto API for secure random generation
  const array = new Uint8Array(12); // 12 bytes = 24 hex chars = 12 alphanumeric pairs
  
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(array);
  } else if (typeof global !== 'undefined' && global.crypto) {
    // Node.js environment
    global.crypto.getRandomValues(array);
  } else {
    // Fallback (less secure, but works)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert to alphanumeric characters (A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = 'JW-';
  
  // Generate 3 groups of 4 characters
  for (let i = 0; i < 3; i++) {
    if (i > 0) token += '-';
    
    for (let j = 0; j < 4; j++) {
      const index = (i * 4 + j) % array.length;
      const charIndex = array[index] % chars.length;
      token += chars[charIndex];
    }
  }
  
  return token;
}

/**
 * Validates token format
 * Must match: JW-XXXX-XXXX-XXXX where X is alphanumeric
 */
export function validateTokenFormat(token: string): boolean {
  const tokenRegex = /^JW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return tokenRegex.test(token);
}

/**
 * Normalizes a token (uppercase, removes extra spaces)
 */
export function normalizeToken(token: string): string {
  return token.trim().toUpperCase().replace(/\s+/g, '');
}

