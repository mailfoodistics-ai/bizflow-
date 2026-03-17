/**
 * Update Service - Handles app version checking and updates
 * Compares current version with server version and prompts for update
 * Supports both web and mobile (Capacitor) platforms
 */

export interface AppVersion {
  version: string;
  releaseNotes: string;
  downloadUrl?: string;
  forceUpdate: boolean; // If true, user cannot ignore update
  releaseDate: string;
}

// Check if running in Capacitor
const isCapacitor = () => {
  try {
    return !!(window as any).Capacitor;
  } catch {
    return false;
  }
};

class UpdateService {
  private versionCheckUrl = `${import.meta.env.VITE_API_URL || ""}/api/app-version`;
  private currentVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
  private updateCheckInterval = 5 * 60 * 1000; // Check every 5 minutes
  private updateCheckTimer: ReturnType<typeof setInterval> | null = null;
  private lastCheckTime = 0;
  private minCheckInterval = 1 * 60 * 1000; // Minimum 1 minute between checks

  /**
   * Get the current app version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Fetch the latest version from server
   */
  async getLatestVersion(): Promise<AppVersion | null> {
    try {
      // Check if enough time has passed since last check
      const now = Date.now();
      if (now - this.lastCheckTime < this.minCheckInterval) {
        return null;
      }

      this.lastCheckTime = now;

      // Try fetching from server, fallback to local version file
      try {
        const response = await fetch(`${this.versionCheckUrl}?_t=${now}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data as AppVersion;
        }
      } catch (serverError) {
        console.log("Server version check failed, trying local manifest");
      }

      // Fallback: check version.json in public folder
      const fallbackResponse = await fetch("/version.json?_t=" + now);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return data as AppVersion;
      }

      return null;
    } catch (error) {
      console.error("Failed to check app version:", error);
      return null;
    }
  }

  /**
   * Compare two semantic versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }

    return 0;
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(latestVersion: AppVersion): boolean {
    return this.compareVersions(this.currentVersion, latestVersion.version) < 0;
  }

  /**
   * Start periodic version checks
   */
  startPeriodicCheck(onUpdateAvailable: (version: AppVersion) => void): () => void {
    // Initial check
    this.checkForUpdate(onUpdateAvailable);

    // Set up periodic checks
    this.updateCheckTimer = setInterval(
      () => this.checkForUpdate(onUpdateAvailable),
      this.updateCheckInterval
    );

    // Return cleanup function
    return () => this.stopPeriodicCheck();
  }

  /**
   * Check for update once
   */
  private async checkForUpdate(onUpdateAvailable: (version: AppVersion) => void) {
    const latestVersion = await this.getLatestVersion();
    if (latestVersion && this.isUpdateAvailable(latestVersion)) {
      onUpdateAvailable(latestVersion);
    }
  }

  /**
   * Stop periodic checks
   */
  stopPeriodicCheck(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = null;
    }
  }

  /**
   * Perform the update by clearing cache and reloading
   * For mobile: navigates to download URL or app store
   * For web: clears cache and reloads
   */
  async performUpdate(): Promise<void> {
    try {
      if (isCapacitor()) {
        // Mobile app: open app store or download URL
        await this.mobileUpdate();
      } else {
        // Web app: clear cache and reload
        await this.webUpdate();
      }
    } catch (error) {
      console.error("Error during update:", error);
      // Fallback: just reload
      window.location.reload();
    }
  }

  /**
   * Update for web app
   */
  private async webUpdate(): Promise<void> {
    // Clear service worker cache if available
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // Clear browser caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // Force page reload with cache busting
    window.location.href = window.location.href + "?_v=" + Date.now();
  }

  /**
   * Update for mobile app (Capacitor)
   */
  private async mobileUpdate(): Promise<void> {
    try {
      const latestVersion = await this.getLatestVersion();
      if (!latestVersion) {
        throw new Error("Could not fetch latest version");
      }

      // For mobile, we can trigger an app reload or navigate to app store
      // The actual APK/IPA distribution would be handled through app stores
      
      // Option 1: If downloadUrl is provided, open it (goes to app store)
      if (latestVersion.downloadUrl) {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: latestVersion.downloadUrl });
        return;
      }

      // Option 2: Just reload the app (for development/testing)
      // Clear cache and reload
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Use Capacitor's reload capability
      const { App } = await import("@capacitor/app");
      // Delay reload slightly to allow update message to be shown
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error during mobile update:", error);
      // Fallback: regular reload
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  }

  /**
   * Manually trigger update check
   */
  async manualCheckForUpdate(): Promise<AppVersion | null> {
    return this.getLatestVersion();
  }
}

// Export singleton instance
export const updateService = new UpdateService();
