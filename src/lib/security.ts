/**
 * Security Middleware and Utilities
 * Implements CSP, headers, and protection mechanisms
 */

// Content Security Policy Headers
export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.supabase.co https://mail.google.com wss://*.supabase.co",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": [
    "camera=*",
    "microphone=()",
    "geolocation=()",
    "payment=()",
  ].join(", "),
};

// CORS Policy
export const corsPolicy = {
  allowedOrigins: [
    "https://bizflow.app",
    "https://api.supabase.co",
    "https://*.supabase.co",
    "http://localhost:8080", // Dev only
  ],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "apikey",
  ],
  credentials: true,
  maxAge: 3600,
};

// Certificate Pinning Config
export const certificatePinning = {
  "api.supabase.co": {
    pins: [
      // Primary pin (RSA 2048)
      "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      // Backup pin
      "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=",
    ],
    expiration: new Date("2027-01-01"),
  },
};

// Secure Storage Handler
export class SecureStorage {
  private static readonly PREFIX = "bizflow_";

  static set(key: string, value: any, encrypt: boolean = false): void {
    try {
      const prefixedKey = `${SecureStorage.PREFIX}${key}`;
      const serialized = JSON.stringify(value);

      if (encrypt && window.crypto) {
        // Future: Implement AES-256 encryption
        // For now, store securely in sessionStorage for sensitive data
        sessionStorage.setItem(prefixedKey, serialized);
      } else {
        localStorage.setItem(prefixedKey, serialized);
      }
    } catch (error) {
      console.error("Storage error:", error);
    }
  }

  static get(key: string): any {
    try {
      const prefixedKey = `${SecureStorage.PREFIX}${key}`;
      
      // Check sessionStorage first (encrypted data)
      let value = sessionStorage.getItem(prefixedKey);
      
      // Fall back to localStorage
      if (!value) {
        value = localStorage.getItem(prefixedKey);
      }

      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Storage retrieval error:", error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      const prefixedKey = `${SecureStorage.PREFIX}${key}`;
      localStorage.removeItem(prefixedKey);
      sessionStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error("Storage removal error:", error);
    }
  }

  static clear(): void {
    try {
      // Clear only app-specific storage
      const keys = [...Array(localStorage.length)].map((_, i) =>
        localStorage.key(i)
      );
      keys.forEach((key) => {
        if (key?.startsWith(SecureStorage.PREFIX)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      const sessionKeys = [...Array(sessionStorage.length)].map((_, i) =>
        sessionStorage.key(i)
      );
      sessionKeys.forEach((key) => {
        if (key?.startsWith(SecureStorage.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  }
}

// CSRF Token Handler
export class CSRFTokenManager {
  private static token: string = "";

  static generate(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    return this.token;
  }

  static getToken(): string {
    if (!this.token) {
      this.generate();
    }
    return this.token;
  }

  static validateToken(token: string): boolean {
    return token === this.token;
  }

  static refreshToken(): string {
    return this.generate();
  }
}

// Request Signing
export class RequestSigner {
  static signRequest(method: string, url: string, body?: any): string {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(7);
    const message = `${method}${url}${timestamp}${nonce}${body ? JSON.stringify(body) : ""}`;

    // Create signature (in production, use HMAC-SHA256)
    return btoa(message);
  }

  static createHeaders(): Record<string, string> {
    return {
      "X-Request-ID": this.generateRequestID(),
      "X-CSRF-Token": CSRFTokenManager.getToken(),
      "X-Client-Version": "1.0.0",
      "X-Platform": this.getPlatform(),
    };
  }

  private static generateRequestID(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private static getPlatform(): string {
    if (navigator.userAgent.includes("Android")) return "android";
    if (navigator.userAgent.includes("iPhone")) return "ios";
    return "web";
  }
}

// Secure HTTP Client
export class SecureHttpClient {
  static async request<T>(
    method: string,
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const headers = {
      "Content-Type": "application/json",
      ...RequestSigner.createHeaders(),
      ...options?.headers,
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  static get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }

  static post<T>(url: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>("POST", url, data, options);
  }

  static put<T>(url: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>("PUT", url, data, options);
  }

  static delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  }
}

// Export all security utilities
export default {
  securityHeaders,
  corsPolicy,
  certificatePinning,
  SecureStorage,
  CSRFTokenManager,
  RequestSigner,
  SecureHttpClient,
};
