import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get the paths
const sourceDir = join(__dirname, '../node_modules/occt-import-js/dist');
const targetDir = join(__dirname, '../public');

// Ensure target directory exists
try {
  mkdirSync(targetDir, { recursive: true });
  console.log('Target directory created/verified:', targetDir);
} catch (err) {
  if (err.code !== 'EEXIST') {
    console.error('Error creating directory:', err);
    process.exit(1);
  }
}

// List of files to copy with their source and target paths
const files = [
  {
    source: 'occt-import-js.js',
    target: 'occt-import-js.wasm.js'
  },
  {
    source: 'occt-import-js.wasm',
    target: 'occt-import-js.wasm.wasm'
  }
];

// Copy each file
for (const file of files) {
  try {
    const sourcePath = join(sourceDir, file.source);
    const targetPath = join(targetDir, file.target);
    
    console.log(`Copying from: ${sourcePath}`);
    console.log(`Copying to: ${targetPath}`);
    
    copyFileSync(sourcePath, targetPath);
    console.log(`Successfully copied ${file.source} to ${file.target}`);
  } catch (err) {
    console.error(`Error copying ${file.source}:`, err);
    if (err.code === 'ENOENT') {
      console.error(`File not found: ${err.path}`);
      console.error('Please ensure occt-import-js is properly installed');
    }
    process.exit(1);
  }
}

console.log('WASM file copy completed successfully');