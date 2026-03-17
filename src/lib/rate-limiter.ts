/**
 * Rate Limiting and Spam Protection Service
 * Protects database from abuse and overload
 */

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Default rate limits
    this.setLimit("signup", { maxRequests: 3, windowMs: 3600000 }); // 3 signups per hour
    this.setLimit("login", { maxRequests: 5, windowMs: 900000 }); // 5 logins per 15 mins
    this.setLimit("api_create", { maxRequests: 10, windowMs: 60000 }); // 10 creates per min
    this.setLimit("api_read", { maxRequests: 30, windowMs: 60000 }); // 30 reads per min
    this.setLimit("api_update", { maxRequests: 10, windowMs: 60000 }); // 10 updates per min
    this.setLimit("api_delete", { maxRequests: 5, windowMs: 60000 }); // 5 deletes per min
  }

  setLimit(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
  }

  isAllowed(key: string, identifier: string): boolean {
    const config = this.configs.get(key);
    if (!config) return true;

    const cacheKey = `${key}:${identifier}`;
    const now = Date.now();
    
    let entries = this.limits.get(cacheKey) || [];
    
    // Remove old entries outside the window
    entries = entries.filter((entry) => entry.timestamp > now - config.windowMs);
    
    // Check if limit exceeded
    if (entries.length >= config.maxRequests) {
      this.limits.set(cacheKey, entries);
      return false;
    }
    
    // Add new entry
    entries.push({ timestamp: now, count: 1 });
    this.limits.set(cacheKey, entries);
    
    return true;
  }

  getRemainingRequests(key: string, identifier: string): number {
    const config = this.configs.get(key);
    if (!config) return Infinity;

    const cacheKey = `${key}:${identifier}`;
    const now = Date.now();
    
    let entries = (this.limits.get(cacheKey) || []).filter(
      (entry) => entry.timestamp > now - config.windowMs
    );
    
    return Math.max(0, config.maxRequests - entries.length);
  }

  getResetTime(key: string, identifier: string): number {
    const config = this.configs.get(key);
    if (!config) return 0;

    const cacheKey = `${key}:${identifier}`;
    const entries = this.limits.get(cacheKey) || [];
    
    if (entries.length === 0) return 0;
    
    const oldestEntry = entries[0];
    const resetTime = oldestEntry.timestamp + config.windowMs;
    const now = Date.now();
    
    return Math.max(0, resetTime - now);
  }

  clearExpired(): void {
    const now = Date.now();
    const allConfigs = Array.from(this.configs.values());
    const maxWindow = Math.max(...allConfigs.map((c) => c.windowMs));

    for (const [key, entries] of this.limits) {
      const validEntries = entries.filter((entry) => entry.timestamp > now - maxWindow);
      if (validEntries.length === 0) {
        this.limits.delete(key);
      } else {
        this.limits.set(key, validEntries);
      }
    }
  }

  reset(key: string, identifier: string): void {
    const cacheKey = `${key}:${identifier}`;
    this.limits.delete(cacheKey);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimitService();

// Cleanup expired entries periodically
setInterval(() => {
  rateLimiter.clearExpired();
}, 60000); // Every minute
