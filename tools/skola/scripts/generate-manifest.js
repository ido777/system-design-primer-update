#!/usr/bin/env node

/**
 * Generates manifest.json for deck files
 * Scans the public/decks directory and creates a manifest.json file
 * listing all .json, .yaml, and .yml files
 */

const fs = require("fs");
const path = require("path");

const decksDir = path.join(__dirname, "..", "public", "decks");
const manifestPath = path.join(decksDir, "manifest.json");

function generateManifest() {
  try {
    // Read all files in the decks directory
    const files = fs.readdirSync(decksDir);
    
    // Filter for deck files (json, yaml, yml) and exclude manifest.json itself
    const deckFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return (
          (ext === ".json" || ext === ".yaml" || ext === ".yml") &&
          file !== "manifest.json"
        );
      })
      .sort(); // Sort alphabetically for consistency
    
    // Create manifest object
    const manifest = {
      files: deckFiles,
      generated: new Date().toISOString(),
    };
    
    // Write manifest.json
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(manifest, null, 2) + "\n",
      "utf8"
    );
    
    console.log(`✅ Generated manifest.json with ${deckFiles.length} file(s):`);
    deckFiles.forEach((file) => console.log(`   - ${file}`));
  } catch (error) {
    console.error("❌ Error generating manifest:", error.message);
    process.exit(1);
  }
}

generateManifest();
