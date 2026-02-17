#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');

/**
 * Post-build script to create .html files alongside directory/index.html files
 * This allows both /consulting and /consulting.html to work on GitHub Pages
 */

function processDirectory(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      // Check if this directory has an index.html
      const indexPath = join(fullPath, 'index.html');
      try {
        const indexContent = readFileSync(indexPath, 'utf8');
        
        // Create a .html file at the parent level
        // e.g., dist/consulting/index.html -> dist/consulting.html
        const htmlFileName = entry.name + '.html';
        const htmlFilePath = join(dir, htmlFileName);
        
        // Only create .html files for top-level directories and direct children
        // This prevents deeply nested paths from cluttering the parent directories
        const isTopLevel = dir === distDir;
        const isSecondLevel = dirname(dir) === distDir;
        
        if (isTopLevel || isSecondLevel) {
          writeFileSync(htmlFilePath, indexContent, 'utf8');
          const relativePath = relative(distDir, htmlFilePath);
          console.log(`Created: /${relativePath}`);
        }
      } catch (err) {
        // Only expected error is ENOENT (no index.html in this directory)
        if (err.code !== 'ENOENT') {
          console.warn(`Warning: Error processing ${fullPath}: ${err.message}`);
        }
      }
      
      // Recursively process subdirectories
      processDirectory(fullPath);
    }
  }
}

console.log('Post-build: Creating .html files for directory routes...');

if (!existsSync(distDir)) {
  console.error('Error: dist directory not found. Build may have failed.');
  process.exit(1);
}

processDirectory(distDir);
console.log('Post-build: Complete!');
