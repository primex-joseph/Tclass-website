// List of common disposable email domains
const disposableDomains = [
  "tempmail.com",
  "throwaway.com",
  "mailinator.com",
  "guerrillamail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "getairmail.com",
  "10minutemail.com",
  "burnermail.io",
  "temp-mail.org",
  "yopmail.com",
  "mailnesia.com",
  "tempinbox.com",
  "emailondeck.com",
  "throwawaymail.com",
];

/**
 * Validates email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if email is a Gmail address
 */
export function isGmail(email: string): boolean {
  return email.toLowerCase().endsWith("@gmail.com");
}

/**
 * Checks if domain is a disposable email service
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return disposableDomains.includes(domain);
}

/**
 * Extracts domain from email
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

/**
 * Comprehensive email validation
 * Returns { valid: boolean; error?: string }
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  // Check if empty
  if (!email || email.trim() === "") {
    return { valid: false, error: "Email is required" };
  }

  // Check for spaces
  if (email.includes(" ")) {
    return { valid: false, error: "Email cannot contain spaces" };
  }

  // Check format
  if (!isValidEmailFormat(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Check if Gmail (for this project requirement)
  if (!isGmail(email)) {
    return { valid: false, error: "Only Gmail addresses are accepted (@gmail.com)" };
  }

  // Check disposable
  if (isDisposableEmail(email)) {
    return { valid: false, error: "Disposable email addresses are not allowed" };
  }

  return { valid: true };
}

/**
 * Phone validation - only numbers, 11 digits for PH
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim() === "") {
    return { valid: true }; // Phone is optional
  }

  // Check if only numbers
  if (!/^\d+$/.test(phone)) {
    return { valid: false, error: "Phone number must contain only digits" };
  }

  // Check length (Philippine mobile numbers are 11 digits)
  if (phone.length !== 11) {
    return { valid: false, error: "Phone number must be 11 digits" };
  }

  // Check if starts with 09 (Philippine mobile prefix)
  if (!phone.startsWith("09")) {
    return { valid: false, error: "Phone number must start with 09" };
  }

  return { valid: true };
}

/**
 * Full contact form validation
 */
export function validateContactForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // First Name
  if (!data.firstName?.trim()) {
    errors.firstName = "First name is required";
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  // Last Name
  if (!data.lastName?.trim()) {
    errors.lastName = "Last name is required";
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  // Email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || "Invalid email";
  }

  // Phone (optional but validated if provided)
  if (data.phone?.trim()) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error || "Invalid phone number";
    }
  }

  // Message
  if (!data.message?.trim()) {
    errors.message = "Message is required";
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
