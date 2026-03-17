/**
 * Input Validation and Sanitization Service
 * Prevents malicious data from reaching the database
 */

export class InputValidator {
  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  // Validate password strength
  static isValidPassword(password: string): boolean {
    return password.length >= 6 && password.length <= 128;
  }

  // Sanitize text input (remove potential XSS)
  static sanitizeText(text: string): string {
    if (!text) return "";
    
    return text
      .trim()
      .slice(0, 500) // Max 500 chars
      .replace(/[<>]/g, "") // Remove HTML tags
      .replace(/javascript:/gi, "") // Remove javascript protocol
      .replace(/on\w+\s*=/gi, ""); // Remove event handlers
  }

  // Sanitize number input
  static sanitizeNumber(num: any): number {
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return 0;
    return Math.min(Math.max(parsed, -999999999), 999999999); // Limit range
  }

  // Validate product name
  static isValidProductName(name: string): boolean {
    const sanitized = this.sanitizeText(name);
    return sanitized.length > 0 && sanitized.length <= 200;
  }

  // Validate category
  static isValidCategory(category: string): boolean {
    const sanitized = this.sanitizeText(category);
    return sanitized.length > 0 && sanitized.length <= 100;
  }

  // Validate phone number (basic check)
  static isValidPhone(phone: string): boolean {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
    return phoneRegex.test(phone);
  }

  // Validate price
  static isValidPrice(price: any): boolean {
    const num = this.sanitizeNumber(price);
    return num >= 0 && num <= 999999;
  }

  // Validate stock quantity
  static isValidStock(stock: any): boolean {
    const num = Math.floor(this.sanitizeNumber(stock));
    return num >= 0 && num <= 999999;
  }

  // Validate store name
  static isValidStoreName(name: string): boolean {
    const sanitized = this.sanitizeText(name);
    return sanitized.length > 0 && sanitized.length <= 150;
  }

  // Validate customer name
  static isValidCustomerName(name: string): boolean {
    const sanitized = this.sanitizeText(name);
    return sanitized.length > 0 && sanitized.length <= 150;
  }

  // Sanitize entire object (recursive)
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === "number") {
        sanitized[key] = this.sanitizeNumber(value);
      } else if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (typeof value === "object") {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as T;
  }
}

// Export for easy access
export const validator = InputValidator;
