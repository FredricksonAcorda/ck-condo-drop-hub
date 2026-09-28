/**
 * Utility functions for Philippine mobile phone numbers (+63 9XX XXX XXXX)
 * and Gmail address handling (@gmail.com pre-filled suffix).
 */

/**
 * Formats user input into a strict Philippine mobile format: +63 9XX XXX XXXX
 * Automatically strips non-digits, normalizes leading 0 or 63, and inserts spaces.
 */
export function formatPhilippinePhone(raw: string): string {
  if (!raw) return "";

  // Strip all non-digit characters
  let digits = raw.replace(/\D/g, "");

  // If user pasted or typed 63... at the beginning
  if (digits.startsWith("63")) {
    digits = digits.slice(2);
  }

  // If user typed 09... strip leading 0
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Enforce starting with 9 if any digits are present
  // (Philippine mobile numbers begin with 9)
  if (digits.length > 0 && !digits.startsWith("9")) {
    // If user starts typing another digit, prefix with 9
    digits = "9" + digits;
  }

  // Maximum 10 digits (9XX XXX XXXX)
  digits = digits.slice(0, 10);

  if (digits.length === 0) {
    return "";
  }

  // Format: +63 9XX XXX XXXX
  let formatted = "+63 " + digits.slice(0, 3);
  if (digits.length > 3) {
    formatted += " " + digits.slice(3, 6);
  }
  if (digits.length > 6) {
    formatted += " " + digits.slice(6, 10);
  }

  return formatted;
}

/**
 * Validates whether the formatted string matches +63 9XX XXX XXXX exactly.
 */
export function isValidPhilippinePhone(formatted: string): boolean {
  if (!formatted) return false;
  return /^\+63\s9\d{2}\s\d{3}\s\d{4}$/.test(formatted.trim());
}

/**
 * Extracts the username portion of an email (everything before @).
 */
export function extractGmailUsername(email: string): string {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  return atIndex >= 0 ? email.slice(0, atIndex) : email;
}

/**
 * Builds a standardized @gmail.com address from a username.
 */
export function buildGmailAddress(username: string): string {
  const clean = username.trim().replace(/@.*$/, "").toLowerCase();
  return clean ? `${clean}@gmail.com` : "";
}

/**
 * Validates a Gmail username (alphanumeric, dots, underscores, dashes, 2-30 characters).
 */
export function isValidGmailUsername(username: string): boolean {
  const clean = username.trim().replace(/@.*$/, "");
  return /^[a-zA-Z0-9._-]{2,30}$/.test(clean);
}
