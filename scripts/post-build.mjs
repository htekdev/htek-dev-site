#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
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
    
    if (entry.isDirectory()) {
      // Check if this directory has an index.html
      const indexPath = join(fullPath, 'index.html');
      try {
        const indexContent = readFileSync(indexPath, 'utf8');
        
        // Create a .html file at the parent level
        // e.g., dist/consulting/index.html -> dist/consulting.html
        const htmlFileName = entry.name + '.html';
        const htmlFilePath = join(dir, htmlFileName);
        
        // Don't create .html files for article slug directories (skip subdirectories in /articles)
        // Only create them for top-level pages like /consulting, /articles
        const isTopLevel = dir === distDir;
        const isArticlesIndex = dir === join(distDir, 'articles');
        
        if (isTopLevel || isArticlesIndex) {
          writeFileSync(htmlFilePath, indexContent, 'utf8');
          console.log(`Created: ${htmlFilePath.replace(distDir, '')}`);
        }
      } catch (err) {
        // No index.html in this directory, skip
      }
      
      // Recursively process subdirectories
      processDirectory(fullPath);
    }
  }
}

console.log('Post-build: Creating .html files for directory routes...');
processDirectory(distDir);
console.log('Post-build: Complete!');
