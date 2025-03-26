// Simple Tesseract.js worker script
// This is a fallback that allows us to redirect to the CDN version
// when the bundled worker isn't available

(function () {
    self.importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/worker.min.js');
})(); 