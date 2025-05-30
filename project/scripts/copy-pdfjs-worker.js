import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Target directory created:', publicDir);
} else {
    console.log('Target directory verified:', publicDir);
}

// Source and destination paths
const sourceFile = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
const destFile = path.join(publicDir, 'pdf.worker.min.js');

try {
    // Copy the file
    fs.copyFileSync(sourceFile, destFile);
    console.log('Successfully copied PDF.js worker file');
} catch (error) {
    console.error('Error copying PDF.js worker file:', error);
    process.exit(1);
}