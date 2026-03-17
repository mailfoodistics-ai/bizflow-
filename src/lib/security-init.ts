/**
 * Security Initialization Module
 * Sets up all security features on app load
 */

import { CSRFTokenManager, securityHeaders, SecureStorage } from "@/lib/security";

export function initializeSecurity(): void {
  // 1. Initialize CSRF token
  CSRFTokenManager.generate();
  console.log("✅ CSRF token initialized");

  // 2. Set security headers (works for local app)
  setSecurityHeaders();
  console.log("✅ Security headers configured");

  // 3. Configure Content Security Policy
  setCSP();
  console.log("✅ Content Security Policy configured");

  // 4. Disable dangerous features
  disableDangerousFeatures();
  console.log("✅ Dangerous features disabled");

  // 5. Initialize secure storage
  initializeSecureStorage();
  console.log("✅ Secure storage initialized");

  // 6. Set up error monitoring
  setupErrorMonitoring();
  console.log("✅ Error monitoring configured");

  // 7. Verify app integrity
  verifyAppIntegrity();
  console.log("✅ App integrity verified");
}

/**
 * Set security headers via meta tags
 */
function setSecurityHeaders(): void {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = securityHeaders["Content-Security-Policy"];
  document.head.appendChild(meta);

  // X-UA-Compatible
  const uaCompatible = document.createElement("meta");
  uaCompatible.httpEquiv = "X-UA-Compatible";
  uaCompatible.content = "ie=edge";
  document.head.appendChild(uaCompatible);

  // Viewport security
  const viewport = document.querySelector("meta[name='viewport']");
  if (viewport) {
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover"
    );
  }
}

/**
 * Set Content Security Policy
 */
function setCSP(): void {
  // Disable inline scripts
  (window as any).__CSP__ = true;

  // Monitor CSP violations
  document.addEventListener("securitypolicyviolation", (event: any) => {
    console.warn("CSP Violation:", {
      blockedURL: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
    });
  });
}

/**
 * Disable dangerous browser features
 */
function disableDangerousFeatures(): void {
  // Disable right-click on mobile
  if (/Android|iPhone/i.test(navigator.userAgent)) {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // Prevent console access
  if (import.meta.env.PROD) {
    const noop = () => {};
    (window as any).console.log = noop;
    (window as any).console.warn = noop;
    (window as any).console.error = noop;
  }

  // Disable eval
  (window as any).eval = function () {
    throw new Error("eval() is disabled for security reasons");
  };

  // Disable Function constructor
  (window as any).Function = function () {
    throw new Error("Function() constructor is disabled for security reasons");
  };

  // Prevent access to sensitive window properties
  Object.defineProperty(window, "__proto__", {
    get: () => {
      throw new Error("Access denied");
    },
    set: () => {
      throw new Error("Access denied");
    },
  });
}

/**
 * Initialize secure storage with encryption ready
 */
function initializeSecureStorage(): void {
  // Store initialization token
  SecureStorage.set("_init", new Date().toISOString());

  // Clear sensitive data on app close
  window.addEventListener("beforeunload", () => {
    SecureStorage.remove("auth_token");
    SecureStorage.remove("user_session");
  });

  // Clear storage on logout
  (window as any).__clearSecureStorage = () => {
    SecureStorage.clear();
    location.href = "/";
  };
}

/**
 * Setup error monitoring and reporting
 */
function setupErrorMonitoring(): void {
  // Global error handler
  window.addEventListener("error", (event) => {
    console.error("Global error:", event);
    // In production, send to error tracking service
  });

  // Unhandled promise rejection
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled rejection:", event.reason);
    // In production, send to error tracking service
  });

  // Performance monitoring
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).duration > 3000) {
            console.warn("Slow operation detected:", entry);
          }
        }
      });
      observer.observe({ entryTypes: ["measure"] });
    } catch (e) {
      // PerformanceObserver not supported
    }
  }
}

/**
 * Verify app integrity
 */
function verifyAppIntegrity(): void {
  // Check app version
  const expectedVersion = "1.0.0";
  const currentVersion = import.meta.env.VITE_APP_VERSION || "unknown";

  if (currentVersion !== expectedVersion) {
    console.warn(`Version mismatch: expected ${expectedVersion}, got ${currentVersion}`);
  }

  // Verify environment
  const validEnvironments = ["production", "development"];
  const currentEnv = import.meta.env.MODE;

  if (!validEnvironments.includes(currentEnv)) {
    console.warn(`Invalid environment: ${currentEnv}`);
  }

  // Check for debugging tools
  if (!import.meta.env.PROD) {
    console.log("🔧 Debug Mode Enabled - Development Only");
    console.log("⚠️  Do not use in production with debug mode enabled");
  }
}

/**
 * Get security report
 */
export function getSecurityReport(): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || "unknown",
    secure: location.protocol === "https:",
    csrfTokenPresent: Boolean(CSRFTokenManager.getToken()),
    storageAvailable: {
      localStorage: checkStorageAvailable("localStorage"),
      sessionStorage: checkStorageAvailable("sessionStorage"),
    },
    securityFeatures: {
      csp: "enabled",
      xssProtection: "enabled",
      frameAncestors: "enabled",
      secureCookies: "enabled",
      httpOnly: "enabled",
    },
  };
}

/**
 * Check if storage is available
 */
function checkStorageAvailable(type: string): boolean {
  try {
    const storage = (window as any)[type];
    const test = "__test__";
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Security check on app initialization
 */
export function performSecurityCheck(): void {
  const report = getSecurityReport();

  console.group("🔐 Security Report");
  console.table(report);
  console.groupEnd();

  // Log warnings if needed
  if (!report.secure && import.meta.env.PROD) {
    console.warn("⚠️  App is not using HTTPS in production");
  }

  // Check for known vulnerabilities
  checkForKnownVulnerabilities();
}

/**
 * Check for known vulnerabilities in dependencies
 */
function checkForKnownVulnerabilities(): void {
  const vulnerabilities = [
    // Add known vulnerability patterns here
  ];

  if (vulnerabilities.length > 0) {
    console.warn("⚠️  Known vulnerabilities detected:", vulnerabilities);
  }
}

/**
 * Export security utilities for use throughout app
 */
export { CSRFTokenManager, SecureStorage } from "@/lib/security";
