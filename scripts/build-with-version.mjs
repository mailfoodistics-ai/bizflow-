#!/usr/bin/env node

/**
 * Build & Version Update Script
 * Automatically updates public/version.json based on package.json
 * Run this before deploying to production
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const packageJsonPath = "./package.json";
const versionJsonPath = "./public/version.json";

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const newVersion = packageJson.version;

  // Read existing version.json
  let versionConfig = {
    version: newVersion,
    releaseNotes: "",
    forceUpdate: false,
    releaseDate: new Date().toISOString().split("T")[0],
  };

  try {
    versionConfig = {
      ...JSON.parse(fs.readFileSync(versionJsonPath, "utf-8")),
      version: newVersion,
    };
  } catch (e) {
    console.log("Creating new version.json...");
  }

  // Write updated version.json
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionConfig, null, 2), "utf-8");

  console.log(`✅ Version updated to ${newVersion}`);
  console.log(`📦 Public files ready for deployment`);
  console.log(`   - Version: ${versionConfig.version}`);
  console.log(`   - Release Date: ${versionConfig.releaseDate}`);
  console.log(`   - Force Update: ${versionConfig.forceUpdate}`);

  // Run build
  console.log("\n🔨 Building app...");
  execSync("vite build", { stdio: "inherit" });

  console.log("\n✨ Build complete! Ready to deploy.");
  console.log(`   Deploy public/version.json to your server`);
  console.log(`   Deploy dist/ folder to your hosting`);
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
