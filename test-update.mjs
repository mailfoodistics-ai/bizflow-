#!/usr/bin/env node

/**
 * Test Auto-Update Feature Locally
 * 
 * This script helps you test the auto-update system without deploying
 * 
 * Usage:
 *   node test-update.mjs
 *   node test-update.mjs --new-version 1.0.1
 *   node test-update.mjs --force-update
 */

import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const versionJsonPath = "./public/version.json";

// Parse arguments
let newVersion = null;
let forceUpdate = false;
let releaseNotes = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--new-version" && args[i + 1]) {
    newVersion = args[++i];
  }
  if (args[i] === "--force-update") {
    forceUpdate = true;
  }
  if (args[i] === "--notes" && args[i + 1]) {
    releaseNotes = args[++i];
  }
  if (args[i] === "--help") {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`
🧪 Auto-Update Testing Script

Usage:
  node test-update.mjs [options]

Options:
  --new-version <version>    Set new version (e.g., 1.0.1)
  --force-update             Mark update as required
  --notes "<text>"           Set release notes
  --help                     Show this help

Examples:
  # Simulate a new version available
  node test-update.mjs --new-version 1.0.1

  # Force an update (user cannot skip)
  node test-update.mjs --new-version 1.0.1 --force-update

  # Add release notes
  node test-update.mjs --new-version 1.0.1 --notes "Fixed billing bug"

Testing Steps:
  1. Run: npm run dev
  2. Run: node test-update.mjs --new-version 1.0.1
  3. Open browser console to see update check
  4. Dialog should appear with "App Update Available"
  5. Click "Update Now" to test cache clearing
  6. Check that app reloads with new version

  `);
}

try {
  // Read current version.json
  let versionConfig = {
    version: "1.0.0",
    releaseNotes: "Initial release",
    forceUpdate: false,
    releaseDate: new Date().toISOString().split("T")[0],
  };

  try {
    versionConfig = JSON.parse(fs.readFileSync(versionJsonPath, "utf-8"));
  } catch (e) {
    console.log("Creating new version.json...");
  }

  // Update with provided values
  if (newVersion) {
    versionConfig.version = newVersion;
  } else {
    // Increment patch version if no version specified
    const parts = versionConfig.version.split(".");
    parts[2] = String(Number(parts[2] || 0) + 1);
    versionConfig.version = parts.join(".");
  }

  if (forceUpdate) {
    versionConfig.forceUpdate = true;
  }

  if (releaseNotes) {
    versionConfig.releaseNotes = releaseNotes;
  }

  versionConfig.releaseDate = new Date().toISOString().split("T")[0];

  // Write updated version.json
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionConfig, null, 2), "utf-8");

  console.log("✅ Version.json updated for testing!\n");
  console.log("Current Configuration:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Version:       ${versionConfig.version}`);
  console.log(`Release Date:  ${versionConfig.releaseDate}`);
  console.log(`Force Update:  ${versionConfig.forceUpdate}`);
  console.log(`Release Notes: ${versionConfig.releaseNotes}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📝 Testing Steps:");
  console.log("1. Open browser DevTools (F12)");
  console.log("2. Go to Application → Cache Storage → Clear all");
  console.log("3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)");
  console.log("4. You should see 'App Update Available' dialog");
  console.log("5. Click 'Update Now' to test the update flow\n");

  console.log("🔧 To revert:");
  console.log("  Edit public/version.json manually or run:");
  console.log("  node test-update.mjs --new-version 1.0.0\n");

  if (newVersion) {
    console.log(`💡 Make sure your app is running on localhost:5173`);
    console.log(`   npm run dev\n`);
  }
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
