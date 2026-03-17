/**
 * Version Manager - Helper utilities to manage app versions
 * 
 * ⚠️ NOTE: This file is for REFERENCE ONLY
 * It shows the structure for updating versions during build/deployment
 * 
 * In practice, you'll manually update:
 * 1. package.json - increment version number
 * 2. public/version.json - update release notes
 * 3. vite.config.ts - update VITE_APP_VERSION
 * 4. Push to GitHub - Vercel deploys automatically
 */

// This is example code for understanding version management
// Use the QUICK_REFERENCE.md guide for actual deployment steps

export interface VersionConfig {
  version: string;
  releaseNotes: string;
  forceUpdate: boolean;
  releaseDate: string;
}

/**
 * Helper function to compare versions
 * This runs in the browser to check if update is available
 * 
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
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
 * Example: How to update version files for deployment
 * 
 * This is what you'll do manually or via script:
 * 
 * 1. Edit package.json:
 *    {
 *      "version": "1.0.1"  // <- increment this
 *    }
 * 
 * 2. Edit public/version.json:
 *    {
 *      "version": "1.0.1",
 *      "releaseNotes": "Fixed billing bug",
 *      "forceUpdate": false,
 *      "releaseDate": "2026-03-17"
 *    }
 * 
 * 3. Edit vite.config.ts:
 *    define: {
 *      'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.1')
 *    }
 * 
 * 4. Commit and push:
 *    git add .
 *    git commit -m "v1.0.1: Fixed billing bug"
 *    git push origin main
 * 
 * Vercel will automatically:
 * - Detect the push
 * - Build your app
 * - Deploy to production
 * - Users will see the update notification!
 */
