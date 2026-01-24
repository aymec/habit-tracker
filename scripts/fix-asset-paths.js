#!/usr/bin/env node

/**
 * Post-build script to fix asset paths for GitHub Pages deployment.
 *
 * Fixes two issues:
 * 1. 'node_modules' in paths is ignored by gh-pages due to .gitignore
 * 2. '@' in scoped package names (like @expo) causes issues with URLs
 *
 * This script:
 * 1. Renames 'assets/node_modules' to 'assets/vendor'
 * 2. Renames '@scoped' folders to '_at_scoped'
 * 3. Updates all references in JS bundles
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

const replacements = [];

// Rename node_modules to vendor
function renameNodeModules() {
  const nodeModulesPath = path.join(ASSETS_DIR, 'node_modules');
  const vendorPath = path.join(ASSETS_DIR, 'vendor');

  if (fs.existsSync(nodeModulesPath)) {
    console.log('Renaming: assets/node_modules -> assets/vendor');
    fs.renameSync(nodeModulesPath, vendorPath);
    replacements.push({
      from: '/assets/node_modules/',
      to: '/assets/vendor/'
    });
    return vendorPath;
  }

  if (fs.existsSync(vendorPath)) {
    return vendorPath;
  }

  console.log('No node_modules or vendor directory found in assets');
  return null;
}

// Find all directories starting with @ and rename them
function renameScopedPackages(dir) {
  if (!dir || !fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('@')) {
      const oldPath = path.join(dir, entry.name);
      const newName = entry.name.replace('@', '_at_');
      const newPath = path.join(dir, newName);

      console.log(`Renaming: ${entry.name} -> ${newName}`);
      fs.renameSync(oldPath, newPath);
      replacements.push({
        from: `/${entry.name}/`,
        to: `/${newName}/`
      });
    }
  }
}

// Update references in all JS files
function updateJsReferences() {
  const jsDir = path.join(DIST_DIR, '_expo', 'static', 'js', 'web');

  if (!fs.existsSync(jsDir)) {
    console.log(`JS directory not found: ${jsDir}`);
    return;
  }

  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const { from, to } of replacements) {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        modified = true;
        console.log(`Updated in ${file}: ${from} -> ${to}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
    }
  }
}

// Main
console.log('Fixing asset paths for GitHub Pages...\n');

const vendorDir = renameNodeModules();
renameScopedPackages(vendorDir);
updateJsReferences();

console.log('\nDone!');
