importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');

// Fallback to local worker if CDN fails
self.addEventListener('error', function(e) {
  console.error('PDF.js worker CDN failed, falling back to local worker');
  importScripts('/pdfjs-dist/build/pdf.worker.min.js');
});